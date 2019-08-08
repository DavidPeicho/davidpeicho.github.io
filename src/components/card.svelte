<script context='module'>
  import { CARD_MIN_HEIGHT } from '$constants';
  import Button from '@components/button';
  import Tag from '@components/tag';

  function styleImage(img) {
    return `background-image: url('${img || ''}');`;
  }

  function styleContainer(direction) {
    return `
      flex-direction: ${ left(direction) ? 'row' : 'row-reverse' };
      min-height: ${ CARD_MIN_HEIGHT + 'vh' };
    `;
  }

  function left(dir) { return dir !== 'right'; }

  function isLinkExternal(url) { return url && url.startsWith('/'); }
</script>

<script>

  /**
   * PROPS
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

  /** String representing the URL this card should redirect to. */
  export let url = null;

  /** String representing the URL to an external video link. */
  export let videoLink = null;

  const buttons = [];
  if (url) {
    buttons.push({ url, text: 'More', external: isLinkExternal(url) });
  }
  if (videoLink) {
    buttons.push({ url: videoLink, text: 'Video', external: true });
  }

</script>

<div class='container' style={styleContainer(direction)}>
  <div class='image' style={styleImage(image)}/>
  <div class='content'>
    <div class='text'>
      <h2>{title}</h2>

      <div>
        { #each tags as tag }
          <Tag {tag}/>
        { /each }
      </div>

      <p>{description}</p>

      <div>
        { #each buttons as button }
          <Button url={button.url} text={button.text} isExternal={button.external}/>
        { /each }
      </div>

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

  .text h2 {
    font-size: 2.75rem;
    line-height: 2.75rem;
    margin-bottom: 1rem;
  }

</style>
