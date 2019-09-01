<script context='module'>

  /** Returns the target of a `<a>` element according to a boolean. */
  function getTarget(url) {
    const external = url && !url.startsWith('/');
    return external ? '_blank' : '';
  }

</script>

<script>

  /**
   * This component is a simple red button matching the template of this site.
   * This button always link to a URL.
   */

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
   * Extra style to apply to the DOM element.
   *
   * @type {string}
   */
  export let style = '';

</script>

<a
  {...attributes}
  class='button'
  href={url}
  target={getTarget(url)}
  style={style}
>
  { text }
</a>

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
    text-decoration: none;
  }

  .button:hover {
    background-color: #ffffff;
    color: #ef495c;
  }

</style>
