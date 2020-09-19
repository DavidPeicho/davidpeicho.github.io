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
  Object3D,
  Vector3,
  Vector2,
} from "three";

import { Cloud, createPerlinTexture } from './cloud';

import {
  PI_OVER_2,
  SinInterpolator,
  easeQuadraticOut,
  Interpolator,
  clamp,
  lerpColor
} from "./math";

import GradientWorker from './workers/gradient-generator.worker.js';

/** Constants */

const CLOUD_BASE_COLOR = (new Color(0x7188a8)).convertSRGBToLinear();
const CLOUD_BURNT_COLOR = (new Color(0x292929)).convertSRGBToLinear();

const LIGHT_INTENSITY = 1.5;

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
    this.camera.position.set(0, 0, 1);
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
        min: 0.325,
        max: 0.38,
        speed: 0.75,
        easingFunction: easeQuadraticOut
      }),
      windowMax: new SinInterpolator({
        min: 0.26,
        max: 0.4,
        speed: 1.0
      }),
      burning: new Interpolator({
        min: 0.0,
        max: 18.0,
        time: 3.0,
        outTime: 1.0,
        easingFunction: easeQuadraticOut,
        easingOutFunction: (t) => 1.0 - easeQuadraticOut(t)
      }),
      recover: new Interpolator({
        min: 0.0,
        max: 1.0,
        time: 4.0,
        delay: 3.0
      })
    };

    const material = this.cloud.material;
    material.baseColor.copy(CLOUD_BASE_COLOR);
    material.windowMin = 0.15;
    material.windowMax = this._interpolators.windowMax.min;
    material.absorption = this._interpolators.absorption.min;

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

  }

  init() {
    const canvas = document.getElementsByTagName("canvas")[0];
    const context = canvas.getContext("webgl2");

    this._renderer = new WebGLRenderer({ canvas, context });
    this._renderer.setPixelRatio(0.5);

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
    // this.cloud.rotation.y += delta * 0.15;
    this.cloud.updateMatrix();
    this.cloud.updateMatrixWorld();
    this.cloud.update(this.camera);

    /* Automatic Light Rotation */

    if (this._autoLightTimeout >= 2.5) {
      const theta = Math.sin((elapsed + PI_OVER_2) * 2.0) * PI_OVER_2;
      const phi = Math.sin(elapsed - PI_OVER_2) * Math.PI;
      const lerp = clamp((this._autoLightTimeout - 2.5) / 2.5,  0.0, 1.0);
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
          console.log('RESET');
          this._mode = Modes.Idle;
        }
        break;
    }

    material.absorption = 0.4;
    // const absorptionLerp = this._interpolators.absorption;
    // material.absorption = absorptionLerp.update(elapsed + PI_OVER_2);
    // const windowMaxLerp = this._interpolators.windowMax;
    // material.windowMax = windowMaxLerp.update(elapsed - PI_OVER_2);
  }

  render() {
    this._renderer.render(this.scene, this.camera);
  }

  onMouseMove(e) {
    // this._autoLightControl = false;
    this._mouse.update(e);

    const theta = this._mouse.xNorm * PI_OVER_2;
    const phi = (this._mouse.yNorm * 0.5 + 0.5) * Math.PI;

    const lerp = this._autoLightTimeout > 0.0 ? 0.5 : 1.0;
    applySphericalCoords(this.light, theta, phi, 2.0, lerp);

    this._autoLightTimeout = 0.0;
  }

  resize(width, height) {
    const asp = width / height;
    const invAsp = height / width;

    this._mouse.resize();
    this._renderer.setSize(width, height, false);
    this.camera.aspect = asp;
    this.camera.updateProjectionMatrix();

    const factor = invAsp * invAsp;
    // this.camera.position.set(
    //   0.0,
    //   clamp(factor * 0.25, 0.1, 0.35),
    //   clamp(factor, 1.0, 2.0)
    // );
    // console.log(`${this.camera.position.x}, ${this.camera.position.y}, ${this.camera.position.z}`);
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
