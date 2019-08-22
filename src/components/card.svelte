<script context='module'>
  import { Colors, TagToIcon, TagToColor, CARD_MIN_HEIGHT } from '$constants';
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

  function getIconStyle(tag) {
    const color = TagToColor[tag] || Colors.Third;
    return `color: ${color}`;
  }

  function getIconClass(tag) {
    return 'fas fa-7x ' + TagToIcon[tag];
  }

  function left(dir) { return dir !== 'right'; }

  function isLinkExternal(url) { return url && !url.startsWith('/'); }
</script>

<script>

  /**
   * PROPS
   */

  /**
   * Description of the card.
   *
   * @type {string}
   */
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
  if (videoLink) {
    buttons.push({ url: videoLink, text: 'Video', external: true });
  }
  if (url) {
    buttons.push({ url, text: 'More', external: isLinkExternal(url) });
  }

</script>

<div class='container' style={styleContainer(direction)}>
  <div class='image' style={styleImage(image)}/>
  <div class='content'>
    <div class='text'>
      <h2>
        <a
          target={isLinkExternal(url) ? '_blank' : ''}
          href={url}>
          {title}
        </a>
      </h2>

      <div>
        { #each tags as tag }
          <Tag {tag} style={'margin-right: 0.25rem;'} />
        { /each }
      </div>

      <p>{description}</p>

      <div>
        { #each buttons as button }
          <Button
            url={button.url}
            text={button.text}
            isExternal={button.external}
            style={'margin-right: 0.5rem;'}
          />
        { /each }
      </div>

    </div>

    { #if tags.length > 0 }
      <div class='icon'>
        <i class={getIconClass(tags[0])} style={getIconStyle(tags[0])}></i>
      </div>
    { /if }

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
    margin: 0 0 1rem 0;
  }

  .text p {
    margin-top: 2rem;
  }

  .container .icon {
    position: absolute;
    font-size: 100%;
    right: 1rem;
    bottom: 1rem;
    justify-content: center;
  }

  h2 > a {
    color: inherit;
    text-decoration: none;
  }

  h2 > a:hover {
    text-decoration-line: underline;
  }


</style>
