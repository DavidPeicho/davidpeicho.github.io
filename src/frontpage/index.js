import {
  Color,
  DataTexture3D,
  LinearFilter,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  PointLight,
  RGBFormat,
  Clock, InterpolationModes
} from 'three';

import { Cloud, createPerlinTexture } from './cloud';
import {
  PI_OVER_2,
  SinInterpolator,
  easeQuadraticOut,
  Interpolator,
  applySphericalCoords,
  clamp,
  lerpColor,
  easeQuadratic
} from './math';
import { Mouse } from './inputs';

import GradientWorker from './workers/gradient-generator.worker.js';

/** Constants */

const BACKGROUND_COLOR = (new Color(0xeeeeee)).convertSRGBToLinear();
const CLOUD_BASE_COLOR = (new Color(0x7188a8)).convertSRGBToLinear();
const CLOUD_BURNT_COLOR = (new Color(0x292929)).convertSRGBToLinear();
const LIGHT_COLOR = (new Color(0xeb4d4b)).convertSRGBToLinear();
const BURNING_LIGHT_COLOR = (new Color(0xe67e22)).convertSRGBToLinear();

const AUTO_LIGHT_TIMEOUT = 1.25;
const LIGHT_INTENSITY = 1.5;

const Configs = {

  cloud: {
    camera: { fov: 45 },
    cloud: {
      absorption: { min: 0.15, max: 0.3 },
      decay: { min: 1.2 , max: 1.45 },
      windowMin: 0.1,
      windowMax: 0.28,
      inverse: false,
      steps: 100
    }
  },

  cloudInverse: {
    camera: { fov: 70 },
    cloud: {
      absorption: { min: 0.04, max: 0.1 },
      decay: { min: 6.0 , max: 8.0 },
      windowMin: 0.3,
      windowMax: 0.85,
      inverse: true,
      steps: 200
    }
  },

  simple: {
    camera: { fov: 70 }
  }

};

const States = {
  Idle: 0,
  Burning: 1,
  Recover: 2
};

/**
 * This class manages the state of the scene, the states, and all data used
 * for the demo.
 */
class App {

  constructor() {
    const canvas = document.getElementsByTagName('canvas')[0];

    this.renderer = new WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(0.5);

    const configId = getConfigId(this.renderer.capabilities.isWebGL2);

    this.camera = new PerspectiveCamera();
    this.camera.position.z = 1.5;
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();

    this.cloud = new Cloud();
    const material = this.cloud.material;
    material.baseColor.copy(CLOUD_BASE_COLOR);

    this.light = new PointLight(LIGHT_COLOR.getHex(), LIGHT_INTENSITY, 2.75, 1.25);
    this.light.position.set(-0.5, 0.5, 1.5);
    this.light.updateMatrix();
    this.light.updateMatrixWorld();

    this.scene = new Scene();
    this.scene.background = (new Color()).copy(BACKGROUND_COLOR);
    this.scene.add(this.cloud, this.light);

    this._clock = new Clock();
    this._mouse = new Mouse();
    this._state = States.Idle;

    /** If `true`, the light can be controlled using the mouse */
    this._controlsEnabled = true;
    /** Tracks time to start light movement interpolation */
    this._autoLightTimeout = 0.0;

    /**
     * Interpolators used for parameters changing with time.
     *
     * Those interpolators are used to modulate absorption, scale, light
     * positions, etc...
     */
    this._interpolators = {
      scale: new SinInterpolator({ min: 0.95, max: 1.05, speed: 0.1 }),
      decay: new SinInterpolator({ min: 1.0, max: 2.5, speed: 1.0 }),
      absorption: new SinInterpolator({
        min: 0.25,
        max: 0.35,
        speed: 1.0,
        easingFunction: easeQuadraticOut
      }),
      burning: new Interpolator({
        min: 0.0,
        max: 15.0,
        time: 3.0,
        outTime: 1.0,
        easingFunction: easeQuadraticOut,
        easingOutFunction: (t) => 1.0 - easeQuadraticOut(t)
      }),
      recover: new Interpolator({
        min: 0.0,
        max: 1.0,
        time: 2.5,
        delay: 0.75,
        easingFunction: easeQuadratic
      })
    };

    this.config = Object.assign({}, Configs[configId]);
    this.setConfiguration(this.config);

    this._createVolume();

    this._mouse.domElement = document.body;
    this.resize(canvas.offsetWidth, canvas.offsetHeight);

    const onResize = new ResizeObserver(entries => {
      if (entries.length > 0 && entries[0].contentRect) {
        const rect = entries[0].contentRect;
        this.resize(rect.width, rect.height);
      }
    });
    onResize.observe(canvas);

    /** Mouse Events. */

    document.body.addEventListener('mousedown', () => {
      const burningLerp = this._interpolators.burning;
      if (burningLerp.isDone || !burningLerp.isRunning) {
        this._state = States.Burning;
        this.light.intensity = 0.0;
        this.light.color.copy(BURNING_LIGHT_COLOR);
        this.cloud.material.baseColor.copy(CLOUD_BURNT_COLOR);
        burningLerp.reset();
        this._interpolators.recover.reset();
        this._controlsEnabled = false;
        this._autoLightTimeout = 0.0;
      }
    })
    document.body.addEventListener('mousemove', (event) => {
      if (this._controlsEnabled) {
        this._autoLightTimeout = 0.0;
        this._mouse.update(event);
        const theta = this._mouse.xNorm * PI_OVER_2;
        const phi = (this._mouse.yNorm * 0.5 + 0.5) * Math.PI;
        applySphericalCoords(this.light, theta, phi, 2.0);
      }
    });
    this._clock.start();
  }

  update() {
    const delta = this._clock.getDelta();
    const elapsed = this._clock.getElapsedTime();

    const absorptionLerp = this._interpolators.absorption;
    const decayLerp = this._interpolators.decay;
    const scaleLerp = this._interpolators.scale;

    /* Cloud Position & Scale. */

    const scale = scaleLerp.update(elapsed);
    this.cloud.scale.set(scale, scale, scale);
    this.cloud.rotation.y += delta * 0.15;
    this.cloud.updateMatrix();
    this.cloud.updateMatrixWorld();
    this.cloud.update(this.camera);

    /* Automatic Light Rotation */

    if (this._autoLightTimeout >= AUTO_LIGHT_TIMEOUT) {
      const theta = Math.sin((elapsed + PI_OVER_2) * 2.0) * PI_OVER_2;
      const phi = Math.sin(elapsed - PI_OVER_2) * Math.PI;
      const lerp = clamp(
        (this._autoLightTimeout - AUTO_LIGHT_TIMEOUT) / AUTO_LIGHT_TIMEOUT,
        0.0,
        1.0
      );
      applySphericalCoords(this.light, theta, phi, 2.0, lerp);
    }
    this._autoLightTimeout += delta;

    /* Cloud material. */

    const material = this.cloud.material;

    switch (this._state) {
      case States.Burning:
        const burningLerp = this._interpolators.burning;
        if (burningLerp.isDone) {
          this._state = States.Recover;
          this.light.color.copy(LIGHT_COLOR);
          this._controlsEnabled = true;
        } else {
          this.light.intensity = burningLerp.update(delta);
        }
        break;
      case States.Recover:
        const recoverLerp = this._interpolators.recover;
        const lerp = recoverLerp.update(delta);
        if (recoverLerp.isRunning) {
          const color = material.baseColor;
          lerpColor(color, CLOUD_BURNT_COLOR, CLOUD_BASE_COLOR, lerp);
          this.light.intensity = lerp * LIGHT_INTENSITY;
        } else if (recoverLerp.isDone) {
          recoverLerp.reset();
          this._state = States.Idle;
        }
        break;
    }

    material.absorption = absorptionLerp.update(elapsed);
    material.decay = decayLerp.update(elapsed);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  setConfiguration(config) {
    this.camera.fov = config.camera.fov;
    this.camera.updateProjectionMatrix();

    const material = this.cloud.material;
    material.absorption = config.cloud.absorption;
    material.decay = config.cloud.decay.min;
    material.windowMin = config.cloud.windowMin;
    material.windowMax = config.cloud.windowMax;
    material.inverse = config.cloud.inverse;
    material.steps = config.cloud.steps;

    this._interpolators.decay.min = config.cloud.decay.min;
    this._interpolators.decay.max = config.cloud.decay.max;
    this._interpolators.absorption.setMinMax(
      config.cloud.absorption.min,
      config.cloud.absorption.max
    );
  }

  resize(width, height) {
    const asp = width / height;
    this._mouse.resize();
    this.renderer.setSize(width, height, false);
    this.camera.aspect = asp;
    this.camera.position.z = clamp(height / width, 1.5, 3.0);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

  _createVolume() {
    const volume = createPerlinTexture({
      scale: 0.09,
      ellipse: { a: 0.6, b: 0.3, c: 0.35 }
    });
    const { width, height, depth, data } = volume.image;
    const worker = new GradientWorker();
    worker.postMessage({ width, height, depth, buffer: data });
    worker.onmessage = (e) => {
      const texture = new DataTexture3D(new Uint8Array(e.data), width, height, depth);
      texture.format = RGBFormat;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.unpackAlignment = 1;
      this.cloud.material.gradientMap = texture;
      worker.terminate();
    };
    this.cloud.material.volume = volume;
  }

}

function getConfigId(supportWebGL2 = false) {
  const url = new URL(window.location.href || '');
  let id = url.searchParams.get('config');
  if (!id) {
    id = Math.random() < 0.5 ? 'cloud' : 'cloudInverse';
  } else if (!(id in Configs)) {
    id = 'cloud';
  }
  if (id.startsWith('cloud') && !supportWebGL2) { id = 'simple'; }
  return id;
}

///////////////////////////////////////////////////////////////////////////////
// Main
///////////////////////////////////////////////////////////////////////////////

window.onload = function () {
  const app = new App();
  function render() {
    app.update();
    app.render();
    window.requestAnimationFrame(render);
  }
  render();
};
