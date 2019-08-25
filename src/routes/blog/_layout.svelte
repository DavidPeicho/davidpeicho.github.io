<script context="module">

  import Tag from '@components/tag';

	export function preload(data) {
    return (
      this.fetch(`${data.path}.json`)
        .then(metadata => metadata.json()).then(metadata => {
          return { metadata };
        })
    );
  }

  function getTitleStyle() {
    return 'color: white; margin: 0';
  }

  function buildLinks(metadata) {
    return [ metadata.previous, metadata.next ];
  }

</script>

<script>
  import { goto } from '@sapper/app'
  import Button from '@components/button';
  import Nav from '@components/nav';
  import Meta from '@components/meta';
  import ImageHeader from '@components/image-header';
  import PostInfo from '@components/post-info';

  export let metadata;
  export let segment;

  let links = buildLinks(metadata);

  async function fetchMetadata(e, link) {
    const url = link.url;
    const res = await fetch(`${url}.json`);
    const data = await res.json();
    metadata = data;
    links = buildLinks(metadata);
    goto(url);
  }

</script>

<Meta data={metadata} />

<div class='post-content'>

  <ImageHeader image={metadata.thumbnail} opacity={0.5}>
    <h1 class='title textshadow' style={getTitleStyle()}>{metadata.title}</h1>
    <div class='tags-container'>
      { #each (metadata.tags || []) as tag }
        <Tag style='margin: 0 0.25rem 0 0.25rem;' tag={tag} />
      { /each }
    </div>
  </ImageHeader>

  <PostInfo readingTime={metadata.readingTime || 10} />

  <slot></slot>

  <div class='separator' />
  <ul class='links'>
    { #each links as link, i }
      { #if link }
        <li
          class={'link ' + (i === 0 ? 'left' : 'right')}
          metadata-url={link.url}
          on:click={(e) => fetchMetadata(e, link)}
        >
          <p>{i === 0 ? '← Previous' : 'Next →'}</p>
          <p class='text'>{`"${link.title}"`}</p>
        </li>
      { :else }
        <li />
      { /if }
    { /each }
  </ul>
</div>

<style>

  .separator {
    position: relative;
    left: 50%;
		height: 3px;
    width: 50%;
    margin-top: 2rem;
    margin-bottom: 1rem;
    transform: translateX(-50%);
    content: '';
		bottom: -1px;
		display: block;
		background-color: #ef495c;
  }

  .title {
    width: 100%;
    margin: auto;
    text-align: center;
    text-transform: uppercase;
  }

  .tags-container {
    position: absolute;
    bottom: 1rem;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    list-style: none;
    padding: 0px;
  }

  .links .left { text-align: left; }

  .links .right { text-align: right; }

  .links p { margin: 0; }

  .links .link {
    flex-grow: 1;
    font-size: 1.15rem;
    cursor: pointer;
    color: #425664;
    text-decoration: none;
  }

  .link:hover { box-shadow: 1px 0 1px 0 rgba(0, 0, 0, 0.15); }

  .link .text {
    color: #ef495c;
    font-style: italic;
  }

</style>
