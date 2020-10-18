import { Vector3 } from 'three';

/** Constants */
export const EPSILON = 0.000001;
export const PI_OVER_2 = Math.PI * 0.5;

export function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

export function saturate(v) {
  return clamp(v, 0.0, 1.0);
}

export function lerpColor(base, colorA, colorB, coeff) {
  base.r = colorA.r + (colorB.r - colorA.r) * coeff;
  base.g = colorA.g + (colorB.g - colorA.g) * coeff;
  base.b = colorA.b + (colorB.b - colorA.b) * coeff;
}

const gVector3 = new Vector3();

/**
 * Applies the given Spherical Coordinates parameters to the cartesian
 * position of a `THREE.Object3D` instance
 *
 * @param {THREE.Object3D} object3D - The instance to update the position of
 * @param {number} theta - Azimuthal angle
 * @param {number} phi - Polar angle
 * @param {number} [radius=1.0] - Distance from the origin
 * @param {number} [lerp=1.0] - Lerping factor
 */
export function applySphericalCoords(
  object3D,
  theta,
  phi,
  radius = 1.0,
  lerp = 1.0
) {
  const vec = gVector3.set(
    Math.sin(phi) * Math.sin(theta),
    - Math.cos(phi),
    Math.sin(phi) * Math.cos(theta)
  ).multiplyScalar(radius);

  object3D.position.lerp(vec, lerp);
  object3D.updateMatrix();
  object3D.updateMatrixWorld();
}

/** Easing */

export function easeLinear(t) {
  return t;
}
export function easeQuadratic(t) {
  return t * t;
}
export function easeQuadraticOut(t) {
  return t * (2.0 - t);
}
export function sinNorm(t) {
  return Math.sin(t) * 0.5 + 0.5;
}

/**
 * Abstract Interpolator
 */
export class AInterpolator {

  constructor(params = {}) {
    const {
      min = 0.0,
      max = 1.0,
      easingFunction = easeLinear
    } = params;

    this.min = min;
    this.max = max;
    this.easingFunction = easingFunction;
  }

  update() { }

  setMinMax(min, max) {
    this.min = min;
    this.max = max;
    return this;
  }

  get range() {
    return this.max - this.min;
  }

}

/**
 * Time-constrained interpolator.
 *
 * Interpolates a value on a given time range.
 */
export class Interpolator extends AInterpolator {

  constructor(params = {}) {
    super(params);

    const {
      delay = 0.0,
      time = 1.0,
      outTime = 0.0,
      easingOutFunction = null
    } = params;

    this.time = time;
    this.outTime = outTime || time;
    this.delay = delay;
    this.easingOutFunction = easingOutFunction || this.easingFunction;

    this._clock = 0.0;
    this._running = false;
    this._done = false;
  }

  reset() {
    this._clock = 0.0;
    this._running = false;
    this._done = false;
    return this;
  }

  update(delta) {
    const range = this.range;
    const time = this.time;
    const delay = this.delay;

    const relativeClock = this._clock - this.delay;
    this._clock = clamp(this._clock + delta, 0.0, time + delay);

    if (relativeClock < 0.0) {
      // The clock is still in the delay period.
      this._running = false;
      return this.min;
    }

    this._running = true;
    const outTime = this.outTime;
    const v = relativeClock < outTime ?
      this.easingFunction(relativeClock / outTime) :
      this.easingOutFunction((relativeClock - outTime) / (time - outTime));

    if (relativeClock >= time) {
      this._running = false;
      this._done = true;
    }

    return this.min + v * range;
  }

  get clock() { return this._clock; }
  get isRunning() { return this._running; }
  get isDone() { return this._done; }

  get lerp() {
    return clamp((this._clock - this.delay) / this.time, 0.0, 1.0);
  }

}

/**
 * Unconstrained interpolator. Interpolates a value via global time variable.
 *
 * **NOTE**: using an AbsoluteInterpolator, there is no notion of "start" or
 * "end".
 */
export class AbsoluteInterpolator extends Interpolator {

  constructor(params = {}) {
    super(params);
  }

  update(elapsed) {
    const v = clamp(this.easingFunction(elapsed), 0.0, 1.0);
    return this.min + v * this.range;
  }

}
