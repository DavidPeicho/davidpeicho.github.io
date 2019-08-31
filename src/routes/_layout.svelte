<script context='module'>

  import { setContext } from 'svelte';

  import { Site } from '$blog';
  import Footer from '@components/footer';
  import Meta from '@components/meta';
  import Nav from '@components/nav';

  export const MetadataContextKey = 'metadata-context-key';

  function createMetadata(metadata) {
    const meta = {};
    meta.title = metadata.title || Site.name || '';
    meta.seoDescription = metadata.seoDescription || Site.description || '';
    return meta;
  }

</script>

<script>

  /**
   * Current route segment the user is at. e.g: `about`, or `projects`.
   *
   * @type {string}
   */
  export let segment;

  let metadata = createMetadata({});

  setContext(MetadataContextKey, (data) => {
    metadata = createMetadata(data || {});
  });

</script>

<!-- Blog Meta. Really important for SEO. -->
<Meta data={metadata} />

<main>
  <!-- Displays the nav bar on top. -->
  <Nav {segment}/>
	<slot {segment}></slot>
  <Footer />
</main>

<style>
	main {
		position: relative;
		background-color: white;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
