<script context="module">

  import { onMount, getContext } from 'svelte';

  import Tag from '@components/tag';

  import { MetadataContextKey } from '@routes/_layout';

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

  const metadataSetter = getContext(MetadataContextKey);
  let links = buildLinks(metadata);

  async function fetchMetadata(e, link) {
    const url = link.url;
    const res = await fetch(`${url}.json`);
    const data = await res.json();
    goto(url);
    metadata = data;
    links = buildLinks(metadata);
    setMetadata();
  }

  function setMetadata() {
    if (metadataSetter) { metadataSetter(metadata); }
  }

  onMount(() => setMetadata());

</script>

<div class='post-content'>

  <div class='header'>
    <ImageHeader image={metadata.thumbnail} opacity={0.5}>
      <h1 class='title textshadow' style={getTitleStyle()}>{metadata.title}</h1>
      <div class='tags-container'>
        { #each (metadata.tags || []) as tag }
          <Tag style='margin: 0 0.25rem 0 0.25rem;' tag={tag} />
        { /each }
      </div>
    </ImageHeader>
  </div>

  <div class='info'>
    <PostInfo readingTime={metadata.readingTime || 10} />
  </div>

  <slot></slot>

  <div class='separator' />
  <ul class='links'>
    { #each links as link, i }
      { #if link }
        <li class={'link ' + (i === 0 ? 'left' : 'right')}>
          <span class='other' on:click={(e) => fetchMetadata(e, link)}>
            {i === 0 ? '← Previous' : 'Next →'}
          </span>
          <p class='other-title'>{`"${link.title}"`}</p>
        </li>
      { :else }
        <li />
      { /if }
    { /each }
  </ul>
</div>

<style>

  .header { height: 60vh; }

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

  .info {
    position: relative;
    margin-bottom: 1rem;
    margin-top: 1rem;
    padding: 0.5rem 0 0.5rem 0;
    border-radius: 0.05rem;
    color: white;
    background-color: #ef495c;
    text-shadow: 1px 1px rgba(0, 0, 0, 0.4);
    text-transform: initial;
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
    text-decoration: none;
  }

  .link .other-title {
    color: #ef495c;
    font-style: italic;
  }

  .link .other:hover { box-shadow: 0 1px 0 0 #303030; }

  @media (max-width: 900px) {

    .header { height: 48vh; }

  }

</style>
