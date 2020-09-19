import {
  BoxBufferGeometry,
  DataTexture3D,
  LinearFilter,
  Mesh,
  RedFormat,
  Vector3
} from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise';

import { CloudMaterial } from './material';
import { clamp } from './math';

export class Cloud extends Mesh {

  constructor() {
    super(new BoxBufferGeometry(1, 1, 1), new CloudMaterial());
  }

  update(camera) {
    const material = this.material;

    this.modelViewMatrix.multiplyMatrices(
      camera.matrixWorldInverse,
      this.matrixWorld
    );
    material.inverseModelView.getInverse(this.modelViewMatrix);
    material.uniforms.uFrame.value++;
  }

}

export function createPerlinTexture(options = {}) {

  const {
    width = 128,
    height = 128,
    depth = 128,
    scale = 0.1,
    ellipse = { a: 0.55, b: 0.32, c: 0.32 }
  } = options;

  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  const halfDepth = depth * 0.5;

  const voxelPerSlice = width * height;
  const voxelCount = voxelPerSlice * depth;

  const buffer = new Uint8Array(voxelCount);
  const perlin = new ImprovedNoise();
  const point = new Vector3();

  const { a, b, c } = ellipse;

  for (let i = 0; i < voxelCount; ++i) {
    const x = i % width;
    const y = Math.floor((i % voxelPerSlice) / width);
    const z = Math.floor(i / voxelPerSlice);

    const v = point.set(
      (x - halfWidth) / width,
      (y - halfHeight) / height,
      (z - halfDepth) / depth
    );

    const ellipse = (v.x * v.x) / a + (v.y * v.y) / b + (v.z * v.z) / c;
    const d = clamp(1.0 - ellipse, 0, 1);

    const p = perlin.noise(x * scale, y * scale, z * scale);
    const rand = (p + 1.0) * 0.5;
    buffer[i] = Math.round(rand * d * d * 255);
  }

  const texture = new DataTexture3D(
    buffer,
    width,
    height,
    depth
  );
  texture.format = RedFormat;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.unpackAlignment = 1;

  return texture;
}
