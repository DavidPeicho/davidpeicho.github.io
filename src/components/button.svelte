<script context='module'>

  /** Returns the target of a `<a>` element according to a boolean. */
  function getTarget(url) {
    const external = url && !url.startsWith('/');
    return external ? '_blank' : '';
  }

</script>

<script>

  /** PROPS */

  export let attributes = {};

  /**
   * String tag to display.
   *
   * @type {string}
   */
  export let text;

  /**
   * String representing the URL to redirect to.
   *
   * @type {string}
   */
  export let url = '';

  /**
   * If `true`, the link should be open in a new tab.
   *
   * @type {boolean}
   */
  export let isExternal = true;

  /**
   * Extra style to apply to the DOM element.
   *
   * @type {string}
   */
  export let style = '';

</script>

<div {...attributes} class='button' style={style} >
  <a
    className='button'
    href={url}
    target={getTarget(url)}
  >
    { text }
  </a>
</div>

<style>

  .button {
    display: inline-block;
    width: auto;
    padding: .75rem 1.5rem;
    line-height: normal;
    border-radius: 0.25rem;
    background-color: #ef495c;
    transition: all .2s ease;
    color: #fff;
    border: 2px solid #ef495c;
  }

  .button a {
    text-decoration: none;
    color: inherit;
  }

  .button:hover {
    background-color: #ffffff;
    color: #ef495c;
  }

</style>
