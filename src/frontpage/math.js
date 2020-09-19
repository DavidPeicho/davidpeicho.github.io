/** Constants */

export const EPSILON = 0.000001;
export const PI_OVER_2 = Math.PI * 0.5;

export function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

export function lerpColor(base, colorA, colorB, coeff) {
  base.r = colorA.r + (colorB.r - colorA.r) * coeff;
  base.g = colorA.g + (colorB.g - colorA.g) * coeff;
  base.b = colorA.b + (colorB.b - colorA.b) * coeff;
}

/** Easing */

export function easeLinear(v) {
  return v;
}
export function easeQuadratic(t) {
  return t * t;
}
export function easeQuadraticOut(v) {
  return v * (2.0 - v);
}

export class SinInterpolator {

  constructor(params = {}) {
    const {
      min = 0.0,
      max = 1.0,
      speed = 1.0,
      easingFunction = easeLinear
    } = params;

    this.min = min;
    this.max = max;
    this.speed = speed;
    this.easingFunction = easingFunction;
  }

  update(value) {
    const range = this.max - this.min;
    const v = clamp(
      this.easingFunction(Math.sin(value * this.speed) * 0.5 + 0.5),
      0.0,
      1.0
    );
    return this.min + v * range;
  }

  setMinMax(min, max) {
    this.min = min;
    this.max = max;
  }

}

/**
 * Simple interpolation class for scalar values.
 */
export class Interpolator {

  constructor(params = {}) {
    const {
      delay = 0.0,
      time = 1.0,
      outTime = 0.0,
      min = 0.0,
      max = 1.0,
      easingFunction = easeLinear,
      easingOutFunction = null
    } = params;

    this.time = time;
    this.outTime = outTime || time;
    this.delay = delay;
    this.min = min;
    this.max = max;
    this.easingFunction = easingFunction;
    this.easingOutFunction = easingOutFunction || easingFunction;

    this._clock = 0.0;

    this._running = false;
    this._done = false;
  }

  reset() {
    this._clock = 0.0;
    this._running = false;
    this._done = false;
  }

  update(delta) {
    const range = this.max - this.min;
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

  setMinMax(min, max) {
    this.min = min;
    this.max = max;
  }

  get clock() { return this._clock; }

  get isRunning() { return this._running; }

  get isDone() { return this._done; }

}
