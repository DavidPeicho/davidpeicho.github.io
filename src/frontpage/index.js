import {
  Color,
  DataTexture3D,
  LinearFilter,
  PerspectiveCamera,
  RedFormat,
  Scene,
  WebGLRenderer,
  Vector3,
  PointLight,
  Vector2,
  Clock,
} from "three";

import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';

import { Cloud } from './cloud';
import { clamp } from './utils';

const TEXTURE_SIZE = 128;

/** Constants */

const PI_OVER_2 = Math.PI * 0.5;

/** Globals. */

const gSize = new Vector2();
const gMouse = new Vector3();
const gPointA = new Vector3();
const gPointB = new Vector3();

class Mouse {

  constructor(domElement) {
    this._x = 0;
    this._y = 0;
    this._xnorm = 0.0;
    this._ynorm = 0.0;
    this._offset = { x: domElement.offsetLeft, y: domElement.offsetTop };
  }

  update(e, width, height) {
    const x = e.clientX - this._offset.x;
    const y = e.clientY - this._offset.y;
    this._x = x;
    this._y = y;
    this._xnorm = (x / width) * 2.0 - 1.0;
    this._ynorm = -(y / height) * 2.0 + 1.0;
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
    this.camera.position.z = 2.0;
    this.camera.updateMatrix();
    this.camera.updateMatrixWorld();

    this.cloud = new Cloud();
    this.cloud.material.baseColor.setHex(0x9b9b9b).convertSRGBToLinear();

    this.light = new PointLight(0xeeeeee);
    this.light.position.copy(this.cloud.position);
    this.light.position.x += 1.0;
    this.light.position.z -= 0.5;
    this.light.updateMatrix();
    this.light.updateMatrixWorld();
    this.light.decay = 1.25;
    this.light.distance = 1.0;

    this.scene.add(this.light, this.cloud);

    this._renderer = null;
    this._clock = new Clock();
    this._mouse = null;

    const nbSlices = TEXTURE_SIZE;
    const voxelPerDim = TEXTURE_SIZE;
    const voxelPerSlice = voxelPerDim * voxelPerDim;
    const voxelCount = voxelPerSlice * nbSlices;

    const texture = new DataTexture3D(
      new Uint8Array(voxelCount),
      voxelPerDim,
      voxelPerDim,
      voxelPerDim
    );
    texture.format = RedFormat;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.unpackAlignment = 1;

    const vector = new Vector3();

    const perlin = new ImprovedNoise();
    const scale = 0.1;

    const aa = 0.55;
    const bb = 0.32;
    const cc = 0.32;

    for (let i = 0; i < voxelCount; ++i) {
      const x = i % voxelPerDim;
      const y = Math.floor((i % voxelPerSlice) / voxelPerDim);
      const z = Math.floor(i / voxelPerSlice);

      const v = vector
        .set(x, y, z)
        .subScalar(voxelPerDim / 2)
        .divideScalar(voxelPerDim);

      const ellipse = clamp((v.x * v.x) / aa + (v.y * v.y) / bb + (v.z * v.z) / cc, 0.0, 1.0);
      const d = 1.0 - ellipse;

      const p = perlin.noise(x * scale, y * scale, z * scale);
      const rand = (p + 1.0) * 0.5;
      texture.image.data[i] = Math.round(rand * d * d * 255);
    }

    this.cloud.material.volume = texture;
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

    this._renderer = new WebGLRenderer({canvas, context});
    this._renderer.setPixelRatio(0.5);

    // Setup observer to track canvas bounds.
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0) {
        return;
      }
      this._onResize(entries[0]);
    });
    resizeObserver.observe(canvas);

    const container = canvas.parentNode;
    this._mouse = new Mouse(container);
    container.addEventListener("mousemove", this.onMouseMove.bind(this));

    this._clock.start();
  }

  update() {
    const delta = this._clock.getDelta();
    const elapsed = this._clock.getElapsedTime();

    this.cloud.update();
    this.cloud.rotation.y += delta * 0.75;
    // this.cloud.rotation.y = 6.0;
    this.cloud.updateMatrix();
    this.cloud.updateMatrixWorld();

    /* Cloud material. */
    const sinValue = elapsed - Math.PI * 0.5;
    const absorptionScale = 0.66;
    const thresholdScale = 0.66;

    const material = this.cloud.material;
    // material.absorption = 0.05 + ((Math.sin(sinValue * absorptionScale) + 1.0) * 0.5) * 0.1;
    material.absorption = 0.4;
    // material.threshold = 0.25 + ((Math.sin(sinValue * thresholdScale) + 1.0) * 0.5) * 0.4;
  }

  render() {
    this._renderer.render(this.scene, this.camera);
  }

  onMouseMove(e) {
    const size = this._renderer.getSize(gSize);
    this._mouse.update(e, size.x, size.y);

    gMouse.set(this._mouse.xNorm, this._mouse.yNorm, 0.5);

    const cameraPos = this.camera.getWorldPosition(gPointA);
    const camToCloud = this.cloud.getWorldPosition(gPointB).sub(cameraPos);

    gMouse.unproject(this.camera).normalize();
    this.light.position.copy(camToCloud).projectOnVector(gMouse).add(cameraPos);

    this.light.updateMatrix();
    this.light.updateMatrixWorld();
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
