import {
  Color,
  DataTexture3D,
  LinearFilter,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  PointLight,
  RGBFormat,
  Clock,
  Vector3,
} from "three";

import { Cloud, createPerlinTexture } from './cloud';

import {
  PI_OVER_2,
  SinInterpolator,
  easeQuadraticOut,
  Interpolator,
  clamp,
  lerpColor,
  easeQuadratic
} from "./math";

import GradientWorker from './workers/gradient-generator.worker.js';

/** Constants */

const CLOUD_BASE_COLOR = (new Color(0x7188a8)).convertSRGBToLinear();
const CLOUD_BURNT_COLOR = (new Color(0x292929)).convertSRGBToLinear();

const AUTO_LIGHT_TIMEOUT = 1.25;
const LIGHT_INTENSITY = 1.5;

const CloudConfigurations = {
  camera: {
    fov: 45
  },
  cloud: {
    absorption: { min: 0.15, max: 0.3 },
    decay: { min: 1.2 , max: 1.45 },
    windowMin: 0.1,
    windowMax: 0.28,
    inverse: false,
    steps: 100
  }
};

const InvertCloudConfigurations = {
  camera: {
    fov: 70
  },
  cloud: {
    absorption: { min: 0.04, max: 0.125 },
    decay: { min: 6.0 , max: 8.0 },
    windowMin: 0.2,
    windowMax: 0.8,
    inverse: true,
    steps: 200
  }
};

const Modes = {
  Idle: 0,
  Burning: 1,
  Recover: 2
};

/** Globals */

const gVector3 = new Vector3();

class Mouse {

  constructor(domElement) {
    this._x = 0;
    this._y = 0;
    this._xnorm = 0.0;
    this._ynorm = 0.0;
    this._offset = { x: domElement.offsetLeft, y: domElement.offsetTop };
    this._dimensions = {
      width: domElement.offsetWidth,
      height: domElement.offsetHeight
    };
    this._domElement = domElement;
  }

  update(e) {
    const x = e.clientX - this._offset.x;
    const y = e.clientY - this._offset.y;
    const dim = this._dimensions;
    this._x = x;
    this._y = y;
    this._xnorm = (x / dim.width) * 2.0 - 1.0;
    this._ynorm = -(y / dim.height) * 2.0 + 1.0;
  }

  resize() {
    const domElement = this._domElement;
    this._dimensions.width = domElement.offsetWidth,
    this._dimensions.height = domElement.offsetHeight
  }

  get x() { return this._x; }
  get y() { return this._y; }
  get xNorm() { return this._xnorm; }
  get yNorm() { return this._ynorm; }

}

class App {

  constructor() {
    this.scene = new Scene();

    this.camera = new PerspectiveCamera();
    this.camera.position.z = 1.5;
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();

    this.cloud = new Cloud();

    this.light = new PointLight();
    this.light.color = new Color(0xeb4d4b).convertSRGBToLinear();
    this.light.intensity = LIGHT_INTENSITY;
    this.light.position.copy(this.cloud.position);
    this.light.translateX(-0.5).translateY(0.5).translateZ(1.5);
    this.light.updateMatrix();
    this.light.updateMatrixWorld();
    this.light.decay = 1.25;
    this.light.distance = 2.75;

    this.light2 = new PointLight();
    this.light2.color = new Color(0xe67e22).convertSRGBToLinear();
    this.light2.intensity = 0.0;
    this.light2.position.copy(this.cloud.position);
    this.light2.translateX(-1.0).translateY(0.5).translateZ(1.5);
    this.light2.updateMatrix();
    this.light2.updateMatrixWorld();
    this.light2.decay = 1.25;
    this.light2.distance = 2.75;

    this.scene.background = new Color(0xeeeeee);
    this.scene.add(this.cloud, this.light, this.light2);

    this._renderer = null;
    this._clock = new Clock();
    this._mouse = null;
    this._autoLightControl = true;
    this._mode = Modes.Idle;

    this._autoLightTimeout = 0.0;

    this._interpolators = {
      absorption: new SinInterpolator({
        min: 0.25,
        max: 0.35,
        speed: 1.0,
        easingFunction: easeQuadraticOut
      }),
      decay: new SinInterpolator({
        min: 1.0,
        max: 2.5,
        speed: 1.0
      }),
      burning: new Interpolator({
        min: 0.0,
        max: 14.0,
        time: 3.0,
        outTime: 1.0,
        easingFunction: easeQuadraticOut,
        easingOutFunction: (t) => 1.0 - easeQuadraticOut(t)
      }),
      recover: new Interpolator({
        min: 0.0,
        max: 1.0,
        time: 3.0,
        delay: 0.75,
        easingFunction: easeQuadratic
      })
    };

    const material = this.cloud.material;
    material.baseColor.copy(CLOUD_BASE_COLOR);

    const volume = createPerlinTexture({
      scale: 0.09, ellipse: { a: 0.6, b: 0.3, c: 0.35 }
    });
    this.cloud.material.volume = volume;

    const worker = new GradientWorker();
    worker.postMessage({
      width: volume.image.width,
      height: volume.image.height,
      depth: volume.image.depth,
      buffer: volume.image.data
    });
    worker.onmessage = (e) => {
      const texture = new DataTexture3D(
        new Uint8Array(e.data),
        volume.image.width,
        volume.image.height,
        volume.image.depth
      );
      texture.format = RGBFormat;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;
      texture.unpackAlignment = 1;

      this.cloud.material.gradientMap = texture;
      worker.terminate();
    };

    // this.setConfiguration(Math.random() < 0.5 ? CloudConfigurations : InvertCloudConfigurations);
    // this.config = Object.assign({}, InvertCloudConfigurations);
    this.config = Object.assign({}, CloudConfigurations);
    this.setConfiguration(this.config);
  }

  init() {
    const canvas = document.getElementsByTagName("canvas")[0];
    const context = canvas.getContext("webgl2");

    this._renderer = new WebGLRenderer({ canvas, context });
    this._renderer.setPixelRatio(0.25);

    // Setup observer to track canvas bounds.
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length > 0) {
        const rect = entries[0].contentRect;
        this.resize(rect.width, rect.height);
      }
    });
    resizeObserver.observe(canvas);

    const container = document.body;
    this._mouse = new Mouse(container);

    container.addEventListener('mousedown', () => {
      const interpolator = this._interpolators.burning;
      if (interpolator.isDone || !interpolator.isRunning) {
        this._mode = Modes.Burning;
        this.light2.intensity = 0.0;
        this.light.intensity = 0.0;
        this.cloud.material.baseColor.copy(CLOUD_BURNT_COLOR);
        interpolator.reset();
      }
    })
    container.addEventListener("mousemove", this.onMouseMove.bind(this));

    this._clock.start();

    this.resize(canvas.offsetWidth, canvas.offsetHeight);
  }

  update() {
    const delta = this._clock.getDelta();
    const elapsed = this._clock.getElapsedTime();

    const scaleSpeed = 0.002;
    const scale = 0.95 + (Math.sin(elapsed * scaleSpeed - PI_OVER_2) * 0.5 + 0.5) * 0.1;

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

    switch (this._mode) {
      case Modes.Burning:
        const burningLerp = this._interpolators.burning;
        if (burningLerp.isDone) {
          this._mode = Modes.Recover;
        } else {
          this.light2.intensity = burningLerp.update(delta);
        }
        break;
      case Modes.Recover:
        const recoverLerp = this._interpolators.recover;
        const lerp = recoverLerp.update(delta);
        if (recoverLerp.isRunning) {
          const color = material.baseColor;
          lerpColor(color, CLOUD_BURNT_COLOR, CLOUD_BASE_COLOR, lerp);
          this.light.intensity = lerp * LIGHT_INTENSITY;
        } else if (recoverLerp.isDone) {
          recoverLerp.reset();
          this._mode = Modes.Idle;
        }
        break;
    }

    const absorptionLerp = this._interpolators.absorption;
    const decayLerp = this._interpolators.decay;
    material.absorption = absorptionLerp.update(elapsed);
    material.decay = decayLerp.update(elapsed);
  }

  render() {
    this._renderer.render(this.scene, this.camera);
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

  onMouseMove(e) {
    this._mouse.update(e);

    const theta = this._mouse.xNorm * PI_OVER_2;
    const phi = (this._mouse.yNorm * 0.5 + 0.5) * Math.PI;

    applySphericalCoords(this.light, theta, phi, 2.0);

    this._autoLightTimeout = 0.0;
  }

  resize(width, height) {
    const asp = width / height;
    const invAsp = height / width;
    this._mouse.resize();
    this._renderer.setSize(width, height, false);
    this.camera.aspect = asp;
    this.camera.position.z = clamp(invAsp, 1.5, 3.0);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
  }

}

///////////////////////////////////////////////////////////////////////////////
// Utils
///////////////////////////////////////////////////////////////////////////////

function applySphericalCoords(object3D, theta, phi, radius = 1.0, lerp = 1.0) {
  const vec = gVector3.set(
    Math.sin(phi) * Math.sin(theta),
    - Math.cos(phi),
    Math.sin(phi) * Math.cos(theta)
  ).multiplyScalar(radius);

  object3D.position.lerp(vec, lerp);
  object3D.updateMatrix();
  object3D.updateMatrixWorld();
}

///////////////////////////////////////////////////////////////////////////////
// Main
///////////////////////////////////////////////////////////////////////////////

window.onload = function () {
  const app = new App();
  app.init();

  function render() {
    app.update();
    app.render();
    window.requestAnimationFrame(render);
  }

  render();
};
