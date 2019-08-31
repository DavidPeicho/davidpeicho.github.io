<script context='module'>
  import { Colors, TagToIcon, TagToColor, CARD_MIN_HEIGHT } from '$constants';
  import Button from '@components/button';
  import Icon from '@components/icon';
  import PostInfo from '@components/post-info';
  import Tag from '@components/tag';

  import { createInfo } from '@components/post-info';

  function styleImage(img) {
    return `background-image: url('${img || ''}');`;
  }

  function getContainerClass(direction) {
    return left(direction) ? '' : 'reverse';
  }

  function getIconStyle(tag) {
    const color = TagToColor[tag] || Colors.Third;
    return `color: ${color}`;
  }

  function left(dir) { return dir !== 'right'; }

  function isLinkExternal(url) { return url && !url.startsWith('/'); }
</script>

<script>

  /** PROPS */

  /**
   * Description of the card.
   *
   * @type {string}
   */
  export let description = '';

  /**
   * Title of the card.
   *
   * @type {string}
   */
  export let title = '';

  /**
   * Image. This takes 50% of the card. Thus, it **must** be provided.
   *
   * @type {string}
   */
  export let image = null;

  /**
   * Array of string representing tags.
   *
   * @type {string[]}
   */
  export let tags = [];

  /**
   * `right` to have the text on the right, `left` otherwise.
   *
   * @type {string}
   */
  export let direction = 'right';

  /**
   * String representing the URL this card should redirect to.
   *
   * @type {string}
   */
  export let url = null;

  /**
   * String representing the URL to an external video link.
   *
   * @type {string}
   */
  export let videoLink = null;

  /**
   * If `true`, displays reading time and date of creation.
   *
   * @type {boolean}
   */
  export let displayInfo = true;

  const buttons = [];
  if (videoLink) {
    buttons.push({ url: videoLink, text: 'Video', external: true });
  }
  if (url) {
    buttons.push({ url, text: 'More', external: isLinkExternal(url) });
  }

</script>

<div class={'container ' + getContainerClass(direction)}>
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

      { #if displayInfo }
        <PostInfo
          date='18 October, 2019'
          readingTime={10}
          style='justify-content: space-between; margin: 0 0 1rem 0;'
        />
      { /if }

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
          width={null}
          height={null}
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
    min-height: 40vh;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .reverse { flex-direction: row-reverse; }

  .image {
    min-height: 30rem;
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

  @media (max-width: 1000px) {

    .container .icon {
      top: 0.75rem;
      bottom: initial;
      width: 3rem;
      height: 3rem;
    }

  }

  @media (max-width: 800px) {

    .container {
      flex-direction: column;
    }

    .image {
      max-width: initial;
      min-height: 32vh;
    }

    .content .text {
      max-width: initial;
      padding: 4rem 2rem 2rem 2rem;
    }

  }

</style>
