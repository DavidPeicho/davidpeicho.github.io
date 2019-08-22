<script context='module'>

  import { Colors, TagToColor } from '$constants';
  import { Tags } from '$config';


  /**
   * Returns an extra style for a Tag component.
   *
   * This method is a `trick` used to edit CSS using variables.
   */
  function getStyle(tag) {
    let color = TagToColor[tag] || TagToColor[Tags.ComputerGraphics];
    return `background-color: ${color};`;
  }

</script>

<script>

  /**
   * PROPS
   */

  /** String tag to display. */
  export let tag;

  /** Extra style to apply to the DOM element. */
  export let style = '';

</script>

<small class='tag' style={getStyle(tag) + style}>
  { '#' + tag }
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
