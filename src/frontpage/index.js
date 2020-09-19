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
} from "three";

import { Cloud, createPerlinTexture } from './cloud';

import {
  PI_OVER_2,
  SinInterpolator,
  easeQuadraticOut,
  Interpolator,
  clamp,
  easeInQuint,
  lerpColor
} from "./math";

import CloudGeneratorWorker from './workers/cloud-generator.worker.js';

/** Constants */

const CLOUD_BASE_COLOR = (new Color(0x7188a8)).convertSRGBToLinear();
const CLOUD_BURNT_COLOR = (new Color(0x292929)).convertSRGBToLinear();

const Modes = {
  Idle: 0,
  Burning: 1,
  Recover: 2
};

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

  get x() { return this._x; }
  get y() { return this._y; }
  get xNorm() { return this._xnorm; }
  get yNorm() { return this._ynorm; }

}

class App {

  constructor() {
    this.scene = new Scene();

    this.camera = new PerspectiveCamera();
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();

    this.cloud = new Cloud();

    this.light = new PointLight();
    this.light.color = new Color(0xeb4d4b).convertSRGBToLinear();
    this.light.intensity = 1.5;
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

    this.scene.add(this.light, this.cloud, this.light2);

    this._renderer = null;
    this._clock = new Clock();
    this._mouse = null;
    this._autoLightControl = true;
    this._mode = Modes.Idle;

    this._interpolators = {
      absorption: new SinInterpolator({
        min: 0.3,
        max: 0.35,
        speed: 0.75,
        easingFunction: easeQuadraticOut
      }),
      windowMax: new SinInterpolator({
        min: 0.3,
        max: 0.4,
        speed: 1.0
      }),
      burning: new Interpolator({
        min: 0.0,
        max: 15.0,
        time: 3.5,
        outTime: 2.5,
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

    const worker = new CloudGeneratorWorker();
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
    const main = document.getElementsByTagName("main")[0];
    const canvas = document.getElementsByTagName("canvas")[0];
    const context = canvas.getContext("webgl2");

    if (main) {
      const style = window.getComputedStyle(main, null);
      const color = style.getPropertyValue("background-color") || 0xffffff;
      this.scene.background = new Color(color);
    }

    this._renderer = new WebGLRenderer({ canvas, context });
    this._renderer.setPixelRatio(0.5);

    // Setup observer to track canvas bounds.
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0) {
        return;
      }
      this._onResize(entries[0]);
    });
    resizeObserver.observe(canvas);

    const container = document.body;
    this._mouse = new Mouse(container);

    container.addEventListener('mousedown', () => {
      const interpolator = this._interpolators.burning;
      if (interpolator.isDone || !interpolator.isRunning) {
        this._mode = Modes.Burning;
        this.cloud.material.baseColor.copy(CLOUD_BURNT_COLOR);
        interpolator.reset();
      }
    })
    container.addEventListener("mousemove", this.onMouseMove.bind(this));

    this._clock.start();
  }

  update() {
    const delta = this._clock.getDelta();
    const elapsed = this._clock.getElapsedTime();

    const scaleSpeed = 0.002;
    const scale = 0.95 + (Math.sin(elapsed * scaleSpeed - PI_OVER_2) * 0.5 + 0.5) * 0.1;

    this.cloud.update();
    this.cloud.scale.set(scale, scale, scale);
    this.cloud.rotation.y += delta * 0.15;
    this.cloud.updateMatrix();
    this.cloud.updateMatrixWorld();

    const absorptionLerp = this._interpolators.absorption;

    /* Automatic Light Rotation */

    if (this._autoLightControl) {
      const theta = Math.sin((elapsed + PI_OVER_2) * 2.0) * PI_OVER_2;
      const phi = Math.sin(elapsed - PI_OVER_2) * Math.PI;
      this.light.position.set(
        Math.sin(phi) * Math.sin(theta),
        - Math.cos(phi),
        Math.sin(phi) * Math.cos(theta)
      ).multiplyScalar(2.0);
      this.light.updateMatrix();
      this.light.updateMatrixWorld();
    }

    /* Cloud material. */

    const material = this.cloud.material;

    switch (this._mode) {
      case Modes.Burning:
        const burningLerp = this._interpolators.burning;
        if (burningLerp.isDone) {
          this.light2.intensity = 0.0;
          this.light.intensity = 0.65;
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
          this.light.intensity = 0.65 + lerp * (1.5 - 0.65);
        } else if (recoverLerp.isDone) {
          recoverLerp.reset();
          console.log('RESET');
          this._mode = Modes.Idle;
        }
        break;
    }

    material.absorption = absorptionLerp.update(elapsed + PI_OVER_2);
    const windowMaxLerp = this._interpolators.windowMax;
    material.windowMax = windowMaxLerp.update(elapsed - PI_OVER_2);
  }

  render() {
    this._renderer.render(this.scene, this.camera);
  }

  onMouseMove(e) {
    this._autoLightControl = false;
    this._mouse.update(e);

    const theta = this._mouse.xNorm * PI_OVER_2;
    const phi = (this._mouse.yNorm * 0.5 + 0.5) * Math.PI;

    this.light.position.set(
      Math.sin(phi) * Math.sin(theta),
      - Math.cos(phi),
      Math.sin(phi) * Math.cos( theta )
    ).multiplyScalar(2.0);
    this.light.updateMatrix();
    this.light.updateMatrixWorld();
  }

  _onResize(entry) {
    const rect = entry.contentRect;
    const asp = rect.width / rect.height;
    const invAsp = rect.height / rect.width;

    this._renderer.setSize(rect.width, rect.height, false);
    this.camera.aspect = asp;
    this.camera.updateProjectionMatrix();

    const factor = invAsp * invAsp;
    this.camera.position.set(
      0.0,
      clamp(factor * 0.25, 0.1, 0.35),
      clamp(factor, 1.0, 2.0)
    );
    console.log(`${this.camera.position.x}, ${this.camera.position.y}, ${this.camera.position.z}`);
  }

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
