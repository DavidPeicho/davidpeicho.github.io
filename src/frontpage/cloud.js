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
    super(Cloud.DEFAULT_GEOMETRY, new CloudMaterial());
  }

  copy(src) {
    this.material.copy(src)
  }

}
/**
 * Unit-box geometry. This is made static for performance purpose. You will
 * not need to change the geometry of the volume.
 */
Cloud.DEFAULT_GEOMETRY = new BoxBufferGeometry(1, 1, 1);

/**
 * Creates a cloudy texture using the Perlin noise algorithm.
 *
 * The noise is faded from the center of the volume toward the edges.
 *
 * @param {Object} [options={}] Options to configure the noise. This include
 * the width, height, and depth of the texture, as well as the scale of the
 * coordinates.
 *
 * @return The 3D Three.js texture containing the noise
 */
export function createPerlinTexture(options = {}) {

  const {
    width = 128,
    height = 128,
    depth = 128,
    scale = 0.1
  } = options;

  const halfWidth = width * 0.5;
  const halfHeight = height * 0.5;
  const halfDepth = depth * 0.5;

  const voxelPerSlice = width * height;
  const voxelCount = voxelPerSlice * depth;

  // ArrayBuffer containing the volume data. This buffer is of size
  // `width` * `height` * `depth` to contain all the 3D data.
  const buffer = new Uint8Array(voxelCount);

  // Three.js implementation of the Improved Perlin Noise algorithm.
  const perlin = new ImprovedNoise();

  // Temporary vector used for in-place computation. This is used to improve
  // performance and reduce garbage collection.
  const point = new Vector3();

  for (let i = 0; i < voxelCount; ++i) {
    const x = i % width;
    const y = Math.floor((i % voxelPerSlice) / width);
    const z = Math.floor(i / voxelPerSlice);

    const v = point.set(
      (x - halfWidth) / width,
      (y - halfHeight) / height,
      (z - halfDepth) / depth
    );
    const length = v.length();

    // `d` goes to zero when the current sample is far from the volume center.
    // At the opposite, `d` goes to one when the sample is close to the volume
    // center.
    const d = clamp(1.0 - length, 0, 1);

    const p = perlin.noise(x * scale, y * scale, z * scale);
    const rand = (p + 1.0) * 0.5;

    // The noise is scaled by how far it is from the center. This is used to
    // improve the shape of the cloud and make it appear more spherical.
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
