import {  LinearFilter, RGBFormat } from 'three/src/constants';
import { Vector3 } from 'three/src/math/Vector3';
import { DataTexture3D } from 'three/src/textures/DataTexture3D';

import { clamp } from '../utils';

onmessage = (event) => {
  const { width, height, depth, buffer } = event.data;

  const voxelPerSlice = width * height;
  const voxelCount = width * height * depth;

  function getIndex(x, y, z) {
    x = clamp(x, 0, width - 1);
    y = clamp(y, 0, height - 1);
    z = clamp(z, 0, depth - 1);
    return x + y * width + voxelPerSlice * z;
  }

  const gradientBuffer = new Uint8Array(voxelCount * 3);
  const texture = new DataTexture3D(
    buffer,
    width,
    height,
    depth
  );
  texture.format = RGBFormat;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.unpackAlignment = 1;

  const gradient = new Vector3();

  for (let i = 0; i < voxelCount; ++i) {
    const x = i % width;
    const y = Math.floor((i % voxelPerSlice) / width);
    const z = Math.floor(i / voxelPerSlice);

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
