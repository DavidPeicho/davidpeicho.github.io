<script context='module'>
  import { CARD_MIN_HEIGHT } from '$constants';
</script>

<script>

  /**
   * Props
   */

  /** Description of the card. */
  export let description = '';
  /** Title of the card. */
  export let title = '';
  /** Image. This takes 50% of the card. Thus, it **must** be provided. */
  export let image = null;
  /** Array of string representing tags. */
  export let tags = [];
  /** `right` to have the text on the right, `left` otherwise. */
  export let direction = 'right';

  function styleImage() {
    return `background-image: url('${image || ''}');`;
  }

  function styleContainer() {
    return `
      flex-direction: ${ left(direction) ? 'row' : 'row-reverse' };
      min-height: ${ CARD_MIN_HEIGHT + 'vh' };
    `;
  }

  function left(dir) { return dir !== 'right'; }

</script>

<div class='container' style={styleContainer()}>
  <div class='image' style={styleImage()}/>
  <div class='content'>
    <div class='text'>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>
</div>

<style>

  .container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    background-color: #f1f0f0;
  }

  .image {
    flex: 1 1 0;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }

  .container .content {
    position: relative;
    flex: 1 1 0;
  }

  .content .text {
    position: relative;
    max-width: 27.8125rem;
    padding: 5rem 5rem 5rem 6rem;
  }

</style>
