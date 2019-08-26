<script context='module'>
  import { Colors, TagToIcon, TagToColor, CARD_MIN_HEIGHT } from '$constants';
  import Button from '@components/button';
  import Icon from '@components/icon';
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
      <h1>
        <a
          target={isLinkExternal(url) ? '_blank' : ''}
          href={url}>
          {title}
        </a>
      </h1>

      <div>
        { #each tags as tag }
          <Tag {tag} style={'margin-right: 0.25rem;'} />
        { /each }
      </div>

      <p>{description}</p>

      <div class='buttons-container'>
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

    <!-- Displays a big colorful icon to easily see what type of post it is. -->
    { #if tags.length > 0 && TagToIcon[tags[0]] }
      <div class='icon'>
        <Icon
          width=null
          height=null
          {...TagToIcon[tags[0]]}
          style={getIconStyle(tags[0])}
        />
      </div>
    { /if }

  </div>
</div>

<style>

  h1 > a {
    color: inherit;
    text-decoration: none;
  }

  h1 > a:hover { text-decoration-line: underline; }

  .container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    background-color: #f1f0f0;
  }

  .image {
    min-width: 30rem;
    min-height: 30rem;
    flex: 1 1 0;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }

  .container .content {
    position: relative;
    min-width: 30rem;
    flex: 1 1 0;
  }

  .content .text {
    position: relative;
    max-width: 30rem;
    padding: 5rem 5rem 5rem 6rem;
  }

  .text h1 {
    margin: 0 0 1rem 0;
  }

  .text p {
    margin-top: 2rem;
    line-height: 1.875rem;
  }

  .container .icon {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    width: 8rem;
    height: 8rem;
    justify-content: center;
  }

  .container .buttons-container {
    margin: 2.625rem 0 0;
  }

  @media (max-width: 750px) {

    .image {
      max-width: initial;
    }

    .content .text {
      max-width: initial;
      padding: 6rem 2rem 2rem 2rem;
    }

    .container .icon {
      top: 1rem;
      bottom: initial;
      width: 5rem;
      height: 5rem;
    }

  }

</style>
