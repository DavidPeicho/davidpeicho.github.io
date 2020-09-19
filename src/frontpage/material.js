import {
  BackSide,
  Matrix4,
  ShaderMaterial,
  Vector3,
  CustomBlending,
  UniformsLib,
  UniformsUtils,
  Color,
} from 'three';

import vertexShader from '../shaders/cloud.vert.glsl';
import fragmentShader from '../shaders/cloud.frag.glsl';

export class CloudMaterial extends ShaderMaterial {

  constructor() {
    super({
      fragmentShader,
      vertexShader,
      uniforms: UniformsUtils.merge([
        UniformsLib.lights,
        {
          uVolume: { value: null },
          uGradientMap: { value: null },
          uModelViewMatrixInverse: { value: new Matrix4() },
          uInverseVoxelSize: { value: new Vector3(1.0, 1.0, 1.0) },
          uBaseColor: { value: new Color(0xeeeeee) },
          uAbsorption: { value: 0.15 },
          uAlphaTest: { value: 0.9 },
          uDecay: { value: 2.0 },
          uFrame: { value: 0.0 },
          uWindowMin: { value: 0.15 },
          uWindowMax: { value: 0.35 }
        }
      ])
    });

    this.side = BackSide;

    this.transparent = true;
    this.toneMapped = false;
    this.fog = false;
    this.lights = true;

    this.defines.NB_STEPS = 100;
    this.defines.USE_GRADIENT_MAP = false;
  }

  set volume(texture) {
    this.uniforms.uVolume.value = texture;
    this.uniforms.uInverseVoxelSize.value.set(
      1.0 / texture.image.width,
      1.0 / texture.image.height,
      1.0 / texture.image.depth
    );
  }

  set gradientMap(value) {
    this.uniforms.uGradientMap.value = value;
    const needsUpdate = (!!value ^ !!this.defines.USE_GRADIENT_MAP) !== 0;
    this.defines.USE_GRADIENT_MAP = !!value;
    this.needsUpdate = needsUpdate;
  }

  set threshold(value) {
    this.uniforms.uThreshold.value = value;
  }

  set absorption(value) {
    this.uniforms.uAbsorption.value = value;
  }
  get absorption() {
    return this.uniforms.uAbsorption.value;
  }

  set baseColor(value) { this.uniforms.uBaseColor.value = value; }

  set decay(value) {
    this.uniforms.uDecay.value = value > 0.0 ? value : 1.0;
  }

  set inverse(value) {
    const needsUpdate = (!!value ^ !!this.defines.INVERSE) !== 0;
    this.defines.INVERSE = !!value;
    this.needsUpdate = needsUpdate;
  }

  set windowMin(value) {
    this.uniforms.uWindowMin.value = value;
  }
  get windowMin() {
    return this.uniforms.uWindowMin.value;
  }

  set windowMax(value) {
    this.uniforms.uWindowMax.value = value;
  }
  get windowMax() {
    return this.uniforms.uWindowMax.value;
  }

  set steps(value) {
    const needsUpdate = value !== this.defines.NB_STEPS;
    this.defines.NB_STEPS = value;
    if (!value) { delete this.defines.NB_STEPS; }
    this.needsUpdate = needsUpdate;
  }

  get baseColor() {
    return this.uniforms.uBaseColor.value;
  }

  get inverseModelView() {
    return this.uniforms.uModelViewMatrixInverse.value;
  }

}
