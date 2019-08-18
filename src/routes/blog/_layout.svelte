<script context="module">
	export async function preload(data) {
    return (
      this.fetch(`metadata.json?path=${data.path}`)
        .then(metadata => metadata.json()).then(metadata => {
          return { metadata };
        })
    );
  }

  function getTitleStyle() {
    return 'color: white; margin: 0';
  }

</script>

<script>
  import Nav from '@components/nav';
  import Meta from '@components/meta';
  import ImageHeader from '@components/image-header';
  import PostInfo from '@components/post-info';

  export let metadata;
</script>

<Meta data={metadata} />

<ImageHeader image={metadata.thumbnail}>
  <h1 style={getTitleStyle()}>{metadata.title}</h1>
  <PostInfo readingTime={metadata.readingTime || 10} />
</ImageHeader>

<div class='content'>
  <slot></slot>
</div>

{ #if metadata.previous || metadata.next }
<div class='links'>
  { #if metadata.previous }
    <a href={metadata.previous.url}>{metadata.previous.title}</a>
  { /if }
  { #if metadata.next }
    <a href={metadata.next.url}>{metadata.next.title}</a>
  { /if }
</div>
{ /if }

<style>
  .content {
    position: relative;
    max-width: 42rem;
    margin: auto;
  }

  .content::before {
    position: relative;
    top: 0;
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

  .content::after {
    position: relative;
    top: 0;
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
  }

</style>
