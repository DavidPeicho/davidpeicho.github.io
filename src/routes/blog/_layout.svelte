<script context='module'>

  import { goto } from '@sapper/app'

  import Button from '@components/button';
  import Meta from '@components/meta';
  import ImageHeader from '@components/image-header';
  import PostInfo from '@components/post-info';

  import Tag from '@components/tag';

	export function preload(data) {
    return (
      this.fetch(`${data.path}.json`)
        .then(metadata => metadata.json()).then(metadata => {
          return { metadata };
        })
        .catch((e) => redirect())
    );
  }

  function getTitleStyle() {
    return 'color: white; margin: 0';
  }

  function buildLinks(metadata) {
    return [ metadata.previous, metadata.next ];
  }

  function redirect() {
    goto('/offline');
  }

</script>

<script>

  export let metadata;

  $: links = buildLinks(metadata);

  async function fetchMetadata(e, link) {
    const url = link.url;
    try {
      const res = await fetch(`${url}.json`);
      const data = await res.json();
      goto(url);
      metadata = data;
    } catch (e) {
      redirect();
    }
  }

</script>

<!-- Blog Meta. Really important for SEO. -->
<Meta data={metadata} />

<!-- Image + Title. -->
<div class='header header-image'>
  <ImageHeader image={metadata.image} opacity={0.5}>
    <h1 class='title textshadow' style={getTitleStyle()}>{metadata.title}</h1>
    <div class='tags-container'>
      { #each (metadata.tags || []) as tag }
        <Tag style='margin: 0 0.25rem 0 0.25rem;' tag={tag} />
      { /each }
    </div>
  </ImageHeader>
</div>
<!-- Info bar. -->
<div class='info header'>
  <PostInfo date={metadata.date} readingTime={metadata.readingTime || 10} />
</div>

<div class='post-content'>

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

  .header {
    margin: auto;
    max-width: 60rem;
  }

  .header-image {
    height: 60vh;
  }

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
    left: 0;
    bottom: 1rem;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .info {
    position: relative;
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

    .header-image { height: 48vh; }

  }

</style>
