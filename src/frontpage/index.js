import {
  Color,
  DataTexture3D,
  LinearFilter,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Vector3,
  PointLight,
  RGBFormat,
  Vector2,
  Clock,
} from "three";

import { Cloud, createPerlinTexture } from './cloud';
import { clamp } from './utils';

import CloudGeneratorWorker from './workers/cloud-generator.worker.js';

/** Constants */

const PI_OVER_2 = Math.PI * 0.5;

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

  update(e, width, height) {
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
    // this.camera.position.set(- 0.15, 0.25, 2.0);
    this.camera.position.set(0.0, 0.0, 2.0);
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();

    this.cloud = new Cloud();
    this.cloud.material.baseColor.setHex(0x9b9b9b).convertSRGBToLinear();

    this.light = new PointLight(0xeeeeee);
    this.light.position.copy(this.cloud.position);
    this.light.translateX(-0.5).translateY(0.5).translateZ(1.5);
    this.light.updateMatrix();
    this.light.updateMatrixWorld();
    this.light.decay = 1.25;
    this.light.distance = 2.75;

    this.scene.add(this.light, this.cloud);

    this._renderer = null;
    this._clock = new Clock();
    this._mouse = null;

    const volume = createPerlinTexture();
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
    container.addEventListener("mousemove", this.onMouseMove.bind(this));

    this._clock.start();
  }

  update() {
    const delta = this._clock.getDelta();
    const elapsed = this._clock.getElapsedTime();

    this.cloud.update();
    // this.cloud.rotation.y += delta * 0.15;
    // this.cloud.rotation.y = 6.0;
    this.cloud.updateMatrix();
    this.cloud.updateMatrixWorld();

    /* Cloud material. */
    const sinValue = elapsed - Math.PI * 0.5;
    const absorptionScale = 0.66;
    const thresholdScale = 0.66;

    const material = this.cloud.material;
    // material.absorption = 0.1 + ((Math.sin(sinValue * absorptionScale) + 1.0) * 0.5) * 0.2;
    material.absorption = 0.3;
  }

  render() {
    this._renderer.render(this.scene, this.camera);
  }

  onMouseMove(e) {
    this._mouse.update(e);

    const theta = this._mouse.xNorm * PI_OVER_2;
    const phi = (this._mouse.yNorm * 0.5 + 0.5) * Math.PI;

    const radius = 2.0;
    this.light.position.set(
      Math.sin(phi) * Math.sin(theta),
      - Math.cos(phi),
      Math.sin(phi) * Math.cos( theta )
    ).multiplyScalar(radius);

    this.light.updateMatrix();
    this.light.updateMatrixWorld();
    console.log(`${this.light.position.x}, ${this.light.position.y}, ${this.light.position.z}`);
  }

  _onResize(entry) {
    const rect = entry.contentRect;
    this._renderer.setSize(rect.width, rect.height, false);
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
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
