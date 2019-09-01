<script>

  /**
   * This component displays a SVG icon from its path (curve).
   *
   * This is faster to load comparing to FontAwesome and you can include only
   * the icons you need.
   *
   * Obviously, creating the icon is a painful process, where you need to copy
   * them somewhere and paste them in the source. It was fine for me because I
   * don't need more than 5-6 icons.
   */

  /** PROPS */

  /**
   * SVG Path.
   *
   * @type {string}
   */
  export let path = null;

  /**
   * SVG width. This is **not** the CSS width, but rather the SVG attribute
   *   width.
   * You can set this value to `null` to size the SVG only with css.
   *
   * @type {number}
   */
  export let width = 50;

  /**
   * SVG height. This is **not** the CSS height, but rather the SVG attribute
   *   height.
   * You can set this value to `null` to size the SVG only with css.
   *
   * @type {number}
   */
  export let height = 50;

  /**
   * SVG viewport. This is used to window the given path. This is applied
   * directly on the SVG and not using CSS.
   *
   * @type {string}
   */
  export let viewBox = '0 0 512 512';

  /**
   * Extra style to apply to the DOM element.
   *
   * @type {string}
   */
  export let style = '';

</script>

<svg
  style={style}
  width={width}
  height={height}
  aria-hidden="true"
  focusable="false"
  role="img"
  xmlns="http://www.w3.org/2000/svg"
  viewBox={viewBox}
>
  <path fill='currentColor' d={path} class=''></path>
</svg>

<style>

  svg { vertical-align: middle; }

</style>
