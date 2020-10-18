/**
 * This worker generates a gradient buffer  of a 3D texture.
 *
 * A copy of the texture is sent to the worker, so the host is still able
 * to use the texture while the generation is ongoing.
 */

import { Vector3 } from 'three/src/math/Vector3';

import { clamp } from '../math';

/**
 * Triggered when the host send a message to the worker.
 *
 * The worker assumes any message should compute the gradient texture and send
 * it back.
 */
onmessage = (event) => {
  const { width, height, depth, buffer } = event.data;

  const voxelPerSlice = width * height;
  const voxelCount = width * height * depth;

  /**
   * Computes the flattened index (0...voxelCount - 1) of a cartesian
   * coordinates tuple
   *
   * @param {number} x - Cartesian x-coordinate
   * @param {number} y - Cartesian y-coordinate
   * @param {number} z - Cartesian z-coordinate
   */
  function getIndex(x, y, z) {
    x = clamp(x, 0, width - 1);
    y = clamp(y, 0, height - 1);
    z = clamp(z, 0, depth - 1);
    return x + y * width + voxelPerSlice * z;
  }

  const gradientBuffer = new Uint8Array(voxelCount * 3);
  const gradient = new Vector3();

  for (let i = 0; i < voxelCount; ++i) {
    const x = i % width;
    const y = Math.floor((i % voxelPerSlice) / width);
    const z = Math.floor(i / voxelPerSlice);

    // Computes the gradient at position `x`, `y`, `z`.
    // The gradient is then mapped from the range [-1; 1] to [0; 1] to
    // be stored in a texture.
    gradient.set(
      buffer[getIndex(x + 1, y, z)] - buffer[getIndex(x - 1, y, z)],
      buffer[getIndex(x, y + 1, z)] - buffer[getIndex(x, y - 1, z)],
      buffer[getIndex(x, y, z + 1)] - buffer[getIndex(x, y, z - 1)]
    ).normalize().multiplyScalar(0.5).addScalar(0.5);

    const dst = i * 3;
    gradientBuffer[dst] = gradient.x * 255;
    gradientBuffer[dst + 1] = gradient.y * 255;
    gradientBuffer[dst + 2] = gradient.z * 255;
  }

  postMessage(gradientBuffer, [ gradientBuffer.buffer ]);
}
