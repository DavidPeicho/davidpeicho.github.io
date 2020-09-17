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
import { clamp } from './utils';

export class Cloud extends Mesh {

  constructor() {
    super(new BoxBufferGeometry(1, 1, 1), new CloudMaterial());
  }

  update() {
    const material = this.material;
    material.inverseModelView.getInverse(this.modelViewMatrix);
    material.uniforms.uFrame.value++;
  }

}

export function createPerlinTexture(options = {}) {

  const {
    width = 128,
    height = 128,
    depth = 128
  } = options;

  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  const halfDepth = depth * 0.5;

  const voxelPerSlice = width * height;
  const voxelCount = voxelPerSlice * depth;

  const buffer = new Uint8Array(voxelCount);
  const perlin = new ImprovedNoise();
  const point = new Vector3();

  const scale = 0.1;
  const aa = 0.55;
  const bb = 0.32;
  const cc = 0.32;

  for (let i = 0; i < voxelCount; ++i) {
    const x = i % width;
    const y = Math.floor((i % voxelPerSlice) / width);
    const z = Math.floor(i / voxelPerSlice);

    const v = point.set(
      (x - halfWidth) / width,
      (y - halfHeight) / height,
      (z - halfDepth) / depth
    );

    const ellipse = clamp((v.x * v.x) / aa + (v.y * v.y) / bb + (v.z * v.z) / cc, 0.0, 1.0);
    const d = 1.0 - ellipse;

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
