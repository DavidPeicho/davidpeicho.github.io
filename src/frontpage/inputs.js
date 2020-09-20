/**
 * Helper class to manage mouse coordinates.
 *
 * **NOTE**: mind to always call the `update` method when the HTML element
 * dimensions change.
 */
export class Mouse {

  constructor(domElement) {
    this._x = 0;
    this._y = 0;
    this._xnorm = 0.0;
    this._ynorm = 0.0;
    this._offset = { x: 0.0, y: 0.0 };
    this._dimensions = { width: 0.0, height: 0.0 };
    this._domElement = domElement;
    if (domElement) { this.resize(); }
  }

  /**
   * Updates the `x`, `y`, `xNorm`, and `yNorm` attributes using the mouse
   * event and the dimensions of the HTML element.
   *
   * @param {MouseEvent} e - event
   */
  update(e) {
    const x = e.clientX - this._offset.x;
    const y = e.clientY - this._offset.y;
    const dim = this._dimensions;
    this._x = x;
    this._y = y;
    this._xnorm = (x / dim.width) * 2.0 - 1.0;
    this._ynorm = -(y / dim.height) * 2.0 + 1.0;
  }

  /**
   * Retrieves the dimensions of the HTML element to use for coordinates
   * normalization.
   *
   * **NOTE**: only call this function when necesseray (using a ResizeObserver for instance),
   * in order to reduce the number of reflows.
   *
   * **NOTE**: this method **doesn't** re-project the previously stored
   * coordinates.
   */
  resize() {
    const domElement = this._domElement;
    this._dimensions.width = domElement.offsetWidth,
    this._dimensions.height = domElement.offsetHeight
  }

  set domElement(elt) {
    this._domElement = elt;
    this.resize();
  }

  /** X coordinate, in **CSS** pixels */
  get x() { return this._x; }
  /** Y coordinate, in **CSS** pixels */
  get y() { return this._y; }
  /** X coordinate, between -1 and 1 */
  get xNorm() { return this._xnorm; }
  /** Y coordinate, between -1 and 1 */
  get yNorm() { return this._ynorm; }

}
