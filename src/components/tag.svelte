<script context='module'>

  import { Tags } from '$blog';

  /**
   * Returns an extra style for a Tag component.
   *
   * This method is a `trick` used to edit CSS using variables.
   */
  function getStyle(tag) {
    const info = Tags[tag];
    return `background-color: ${info.color};`;
  }

</script>

<script>

  /**
   * This component represents a tag. The color is automatically selected using
   * a static LUT saved in the `$blog` file.
   */

  /** PROPS */

  /** Id of the tag to display. */
  export let tag;

  /** Extra style to apply to the DOM element. */
  export let style = '';

  if (!Tags[tag]) {
    throw new TypeError('Tag.svelte: unsupported tag.');
  }

</script>

<small class='tag' style={getStyle(tag) + style}>
  { '#' + Tags[tag].text }
</small>

<style>

  .tag {
    padding: 0.35rem 0.75rem 0.35rem 0.75rem;
    color: white;
    border-radius: 1.5rem;
    font-weight: 700;
    font-size: 1.0rem;
    text-shadow: 1px 1px rgba(0, 0 , 0, 0.3);
  }

</style>
