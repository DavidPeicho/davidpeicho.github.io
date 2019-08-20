<script context="module">
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

  async function fetchMetadata(e) {
    const t = e.target;
    const url = t.attributes['metadata-url'].value
    const res = await fetch(`${url}.json`);
    const data = await res.json();
    metadata = data;
    links = buildLinks(metadata);
    goto(url);
  }

</script>

<Meta data={metadata} />

<ImageHeader image={metadata.thumbnail}>
  <h1 style={getTitleStyle()}>{metadata.title}</h1>
  <PostInfo readingTime={metadata.readingTime || 10} />
</ImageHeader>

<div class='post-content'>
  <slot></slot>
  <div class='separator' />
  <ul class='links'>
    { #each links as link, i }
      { #if link }
        <li
          class='link'
          metadata-url={link.url}
          on:click={fetchMetadata}
        >
          { i === 0 ? '← ' + link.title : link.title + ' →' }
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
		background-color: #F07E74;
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    list-style: none;
    padding: 0px;
  }

  .link {
    font-size: 1.15rem;
    cursor: pointer;
    color: #F07E74;
    box-shadow: 0 1px 0 0 #F07E74;
    text-decoration: none;
  }

  .link:hover {
    box-shadow: 0 0 0 0 black;
  }

</style>
