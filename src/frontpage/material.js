import {
  BackSide,
  Matrix4,
  ShaderMaterial,
  Vector3,
  UniformsLib,
  UniformsUtils,
  Color,
} from 'three';

import cloudVertexShader from '../shaders/cloud.vert.glsl';
import cloudFragmentShader from '../shaders/cloud.frag.glsl';

const gMatrix4 = new Matrix4();

/**
 * Material feeding the cloud shader.
 *
 * **NOTE**: this material is made to work **only** with THREE.PointLight.
 *
 * **NOTE**: this material needs information about the camera being used, as
 * well as the current THREE.Object3D the material is attached to. As a
 * consequence, you **can't** share the material without cloning.
 */
export class CloudMaterial extends ShaderMaterial {

  constructor() {
    super({
      vertexShader: cloudVertexShader,
      fragmentShader: cloudFragmentShader,
      uniforms: UniformsUtils.merge([
        UniformsLib.lights,
        {
          uVolume: { value: null },
          uGradientMap: { value: null },
          uLocalSpaceCameraOrigin: { value: new Vector3() },
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

    // NOTE: This is super important. We want to only render the back faces
    // so we can generate a proper ray direction. Don't forget that users
    // can render using a perspective camera. Thus, we need to generate our
    // directions based on the back faces and not the front ones.
    this.side = BackSide;

    // Needs to be `true` so that Three.js renders our cloud in an extra step,
    // after all opaque meshes are rendered.
    this.transparent = true;

    this.toneMapped = false;
    this.fog = false;
    this.lights = true;

    this.defines.NB_STEPS = 100;
    this.defines.USE_GRADIENT_MAP = false;
  }

  update(object3d, camera) {
    const localOriginUniform = this.uniforms.uLocalSpaceCameraOrigin.value;

    object3d.modelViewMatrix.multiplyMatrices(
      camera.matrixWorldInverse,
      object3d.matrixWorld
    );

    // Use a global variable to perform in-place inverse. This is much faster
    // that allocating a matrix (obviously also reducw GC).
    gMatrix4.getInverse(object3d.matrixWorld);
    // Copies the camera world position into `uLocalSpaceCameraOrigin`.
    // NOTE: the camera world matrix **must be** up-to-date!
    camera.getWorldPosition(localOriginUniform);
    // Transform the camera world space into the volume local space using
    // the above inverse transform.
    localOriginUniform.applyMatrix4(gMatrix4);

    this.uniforms.uFrame.value++;
  }

  set volume(texture) {
    this.uniforms.uVolume.value = texture;
  }

  /** 3D texture to sample */
  get volume() {
    return this.uniforms.uVolume.value;
  }

  set gradientMap(value) {
    this.uniforms.uGradientMap.value = value;
    const needsUpdate = (!!value ^ !!this.defines.USE_GRADIENT_MAP) !== 0;
    this.defines.USE_GRADIENT_MAP = !!value;
    this.needsUpdate = needsUpdate;
  }

  /** Pre-computed gradients texture used to speed up the rendering */
  get gradientMap() {
    return this.uniforms.uGradientMap.value;
  }

  set absorption(value) {
    this.uniforms.uAbsorption.value = value;
  }

  /**
   * Absorption of every sample along the ray. The bigger it is, the more
   * opaque the cloud will look like
   */
  get absorption() {
    return this.uniforms.uAbsorption.value;
  }

  set baseColor(value) {
    this.uniforms.uBaseColor.value = value;
  }

  /** Ambient color of the cloud */
  get baseColor() {
    return this.uniforms.uBaseColor.value;
  }

  set decay(value) {
    this.uniforms.uDecay.value = value > 0.0 ? value : 1.0;
  }

  /**
   * Applies non-linearity to sampled values. The `decay` is used as follow:
   *
   * ```c
   * float finalValue = pow(sample, decay);
   * ```
   *
   * With `sample` the origin voxel from the 3D texture, in the interval [0, 1].
   *
   * Higher number means less visible voxels.
   */
  get decay() {
    return this.uniforms.uDecay.value;
  }

  set inverse(value) {
    const needsUpdate = (!!value ^ !!this.defines.INVERSE) !== 0;
    this.defines.INVERSE = !!value;
    this.needsUpdate = needsUpdate;
  }

  /**
   * If `true`, the rendering will weight sample closer to 0.0, i.e:
   *
   * ```c
   * sample = 1.0 - sample;
   * ```
   *
   * With `sample` the origin voxel from the 3D texture, in the interval [0, 1].
   */
  get inverse() {
    return !!this.defines.INVERSE;
  }

  set windowMin(value) {
    this.uniforms.uWindowMin.value = value;
  }

  /** Minimum sample value. Everything below this value is clamped to it. */
  get windowMin() {
    return this.uniforms.uWindowMin.value;
  }

  set windowMax(value) {
    this.uniforms.uWindowMax.value = value;
  }

  /** Maximum sample value. Everything above this value is clamped to it. */
  get windowMax() {
    return this.uniforms.uWindowMax.value;
  }

  set steps(value) {
    const needsUpdate = value !== this.defines.NB_STEPS;
    this.defines.NB_STEPS = value;
    if (!value) { delete this.defines.NB_STEPS; }
    this.needsUpdate = needsUpdate;
  }

  /**
   * Number of steps the ray performs.
   *
   * **NOTE**: The higher the better, but the also the higher the slower.
   *
   * **NOTE**: triggers a shader re-compile.
   */
  get steps() {
    return this.defines.NB_STEPS || null;
  }

  /**
   * Inverse of the ModelView matrix sent to the shader.
   *
   * **NOTE**: you must manually call the `update()` method in order to update
   * this uniform value.
   */
  get inverseModelView() {
    return this.uniforms.uModelViewMatrixInverse.value;
  }

}
