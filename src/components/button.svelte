<script context='module'>
  import { Colors } from '$constants';

  /**
   * Returns an extra style for a Button component.
   *
   * This method is a `trick` used to edit CSS using variables.
   */
  function getStyle() {
    return `
      border-color: ${ Colors.Secondary };
      background: ${ Colors.Secondary };
    `;
  }

  /** Returns the target of a `<a>` element according to a boolean. */
  function getTarget(url) {
    const external = url && !url.startsWith('/');
    return external ? '_blank' : '';
  }

</script>

<script>

  /**
   * PROPS
   */

  export let attributes = {};

  /** String tag to display. */
  export let text;

  /** String representing the URL to redirect to. */
  export let url = '';

  /** If `true`, the link should be open in a new tab. */
  export let isExternal = true;

  export let style = '';

</script>

<div
  {...attributes}
  class='button'
  style={getStyle() + style}
>
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
    border: 2px solid;
    transition: all .2s ease;
  }

  .button a {
    color: #fff;
    text-decoration: none;
  }

  .button:hover {
    background: #ffffff;
    color: #F07E74;
  }

</style>
