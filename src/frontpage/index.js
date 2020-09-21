import {
  Color,
  Clock,
  DataTexture3D,
  LinearFilter,
  Mesh,
  OctahedronBufferGeometry,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  PointLight,
  RGBFormat, MeshNormalMaterial
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

class SimpleDemo {

  constructor(app) {
    const material = new MeshNormalMaterial();
    material.flatShading = true;
    app.camera.fov = 55;
    app.camera.updateProjectionMatrix();
    this.object3D = new Mesh(new OctahedronBufferGeometry(0.5, 2), material);
  }

  onInteract() { }
  onMove() { }
  update() { }

}

class CloudDemo {

  constructor(app, options) {
    const {
      fov = 50,
      absorption,
      decay,
      windowMin,
      windowMax,
      inverse = false,
      steps = 100
    } = options;

    this.object3D = new Cloud();
    app.camera.fov = fov;

    /**
     * Interpolators used for parameters changing with time.
     *
     * Those interpolators are used to modulate absorption, scale, light
     * positions, etc...
     */
    this._interpolators = {
      decay: new SinInterpolator({
        min: decay.min,
        max: decay.max,
        speed: 1.0
      }),
      absorption: new SinInterpolator({
        min: absorption.min,
        max: absorption.max,
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

    const material = this.object3D.material;
    material.baseColor.copy(CLOUD_BASE_COLOR);
    material.absorption = absorption;
    material.decay = decay.min;
    material.windowMin = windowMin;
    material.windowMax = windowMax;
    material.inverse = inverse;
    material.steps = steps;

    this._app = app;
    this._state = CloudDemo.States.Idle;
    this._createVolume();
  }

  onInteract() {
    const app = this._app;
    const light = app.light;
    const burningLerp = this._interpolators.burning;
    if (burningLerp.isDone || !burningLerp.isRunning) {
      this._state = CloudDemo.States.Burning;
      light.intensity = 0.0;
      light.color.copy(BURNING_LIGHT_COLOR);
      this.object3D.material.baseColor.copy(CLOUD_BURNT_COLOR);
      burningLerp.reset();
      this._interpolators.recover.reset();
      app.controlsEnabled = false;
      app.autoLightTimeout = 0.0;
    }
  }

  onMove(mouse) {
    const app = this._app;
    if (app.controlsEnabled) {
      app.autoLightTimeout = 0.0;
      const theta = mouse.xNorm * PI_OVER_2;
      const phi = (mouse.yNorm * 0.5 + 0.5) * Math.PI;
      applySphericalCoords(app.light, theta, phi, 2.0);
    }
  }

  update(elapsed, delta) {
    const absorptionLerp = this._interpolators.absorption;
    const decayLerp = this._interpolators.decay;

    const material = this.object3D.material;
    material.update(this.object3D, this._app.camera);

    const app = this._app;

    switch (this._state) {
      case CloudDemo.States.Burning:
        const burningLerp = this._interpolators.burning;
        if (burningLerp.isDone) {
          app.light.color.copy(LIGHT_COLOR);
          app.controlsEnabled = true;
          this._state = CloudDemo.States.Recover;
        } else {
          app.light.intensity = burningLerp.update(delta);
        }
        break;
      case CloudDemo.States.Recover:
        const recoverLerp = this._interpolators.recover;
        const lerp = recoverLerp.update(delta);
        if (recoverLerp.isRunning) {
          const color = material.baseColor;
          lerpColor(color, CLOUD_BURNT_COLOR, CLOUD_BASE_COLOR, lerp);
          app.light.intensity = lerp * LIGHT_INTENSITY;
        } else if (recoverLerp.isDone) {
          recoverLerp.reset();
          this._state = CloudDemo.States.Idle;
        }
        break;
    }

    material.absorption = absorptionLerp.update(elapsed);
    material.decay = decayLerp.update(elapsed);
  }

  _createVolume() {
    const volume = createPerlinTexture({ scale: 0.09 });
    const { width, height, depth, data } = volume.image;
    const worker = new GradientWorker();
    worker.postMessage({ width, height, depth, buffer: data });
    worker.onmessage = (e) => {
      const texture = new DataTexture3D(new Uint8Array(e.data), width, height, depth);
      texture.format = RGBFormat;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.unpackAlignment = 1;
      this.object3D.material.gradientMap = texture;
      worker.terminate();
    };
    this.object3D.material.volume = volume;
  }

}
CloudDemo.States = {
  Idle: 0,
  Burning: 1,
  Recover: 2
};
CloudDemo.Parameters = {
  cloud: {
    fov: 45,
    absorption: { min: 0.15, max: 0.3 },
    decay: { min: 1.2 , max: 1.45 },
    windowMin: 0.1,
    windowMax: 0.28,
    inverse: false,
    steps: 100
  },
  cloudInverse: {
    fov: 70,
    absorption: { min: 0.04, max: 0.1 },
    decay: { min: 6.0 , max: 8.0 },
    windowMin: 0.3,
    windowMax: 0.85,
    inverse: true,
    steps: 200
  }
};

/**
 * This class manages the state of the scene, the states, and all data used
 * for the demo.
 */
class App {

  constructor() {
    const canvas = document.getElementsByTagName('canvas')[0];

    this.renderer = new WebGLRenderer({ canvas });
    const supportWebGL2 = this.renderer.capabilities.isWebGL2;

    this.camera = new PerspectiveCamera();
    this.camera.position.z = 1.5;
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();

    this.light = new PointLight(LIGHT_COLOR.getHex(), LIGHT_INTENSITY, 2.75, 1.25);
    this.light.position.set(-0.5, 0.5, 1.5);
    this.light.updateMatrix();
    this.light.updateMatrixWorld();

    this.scene = new Scene();
    this.scene.background = (new Color()).copy(BACKGROUND_COLOR);

    const url = new URL(window.location.href || '');
    let config = url.searchParams.get('config');
    if (!config || !(config in CloudDemo.Parameters)) {
      config = Math.random() < 0.5 ? 'cloud' : 'cloudInverse';
    }
    config = config.startsWith('cloud') && !supportWebGL2 ? 'simple' : config;
    this.camera.updateProjectionMatrix();

    this.demo = null;
    switch (config) {
      case 'simple':
        this.demo = new SimpleDemo(this);
        break;
      default:
        this.demo = new CloudDemo(this, CloudDemo.Parameters[config]);
        this.renderer.setPixelRatio(0.5);
        break;
    }
    this.scene.add(this.demo.object3D, this.light);

    /** If `true`, the light can be controlled using the mouse */
    this.controlsEnabled = true;

    /** Tracks time to start light movement interpolation */
    this.autoLightTimeout = 0.0;

    this._clock = new Clock();
    this._mouse = new Mouse();

    /**
     * Interpolators used for parameters changing with time.
     *
     * Those interpolators are used to modulate absorption, scale, light
     * positions, etc...
     */
    this._interpolators = {
      scale: new SinInterpolator({ min: 0.95, max: 1.05, speed: 0.1 })
    };

    this._mouse.domElement = document.body;
    this.resize(canvas.offsetWidth, canvas.offsetHeight);

    /** Resize Event. */

    const onResize = new ResizeObserver(entries => {
      if (entries.length > 0 && entries[0].contentRect) {
        const rect = entries[0].contentRect;
        this.resize(rect.width, rect.height);
      }
    });
    onResize.observe(canvas);

    /** Mouse Events. */

    document.body.addEventListener('mousedown', () => {
      this.demo.onInteract();
    })
    document.body.addEventListener('mousemove', (event) => {
      this._mouse.update(event);
      this.demo.onMove(this._mouse);
    });

    this._clock.start();
  }

  update() {
    const delta = this._clock.getDelta();
    const elapsed = this._clock.getElapsedTime();
    const object3D = this.demo.object3D;

    /* Cloud Position & Scale. */

    const scaleLerp = this._interpolators.scale;
    const scale = scaleLerp.update(elapsed);
    object3D.scale.set(scale, scale, scale);
    object3D.rotation.y += delta * 0.15;
    object3D.updateMatrix();
    object3D.updateMatrixWorld();

    /* Automatic Light Rotation */

    if (this.autoLightTimeout >= AUTO_LIGHT_TIMEOUT) {
      const theta = Math.sin((elapsed + PI_OVER_2) * 2.0) * PI_OVER_2;
      const phi = Math.sin(elapsed - PI_OVER_2) * Math.PI;
      const lerp = clamp(
        (this.autoLightTimeout - AUTO_LIGHT_TIMEOUT) / AUTO_LIGHT_TIMEOUT,
        0.0,
        1.0
      );
      applySphericalCoords(this.light, theta, phi, 2.0, lerp);
    }
    this.autoLightTimeout += delta;

    this.demo.update(elapsed, delta);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
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
