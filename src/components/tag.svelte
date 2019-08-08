<script context='module'>

  import { Colors } from '$constants';

  /**
   * Returns an extra style for a Tag component.
   *
   * This method is a `trick` used to edit CSS using variables.
   */
  function getStyle() { return `background-color: ${Colors.Third}`; }

</script>

<script>

  /**
   * PROPS
   */

  /** String tag to display. */
  export let tag;

</script>

<small class='tag' style={getStyle()}>
  { '#' + tag }
</small>

<style>

  .tag {
    padding: 0.5rem 1rem 0.5rem 1rem;
    color: white;
    border-radius: 1.5rem;
    font-weight: 700;
    font-size: 1.0rem;
  }

</style>
