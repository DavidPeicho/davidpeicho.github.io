<script context='module'>

  import { onMount } from 'svelte';

  import { Site } from '$blog';

  // Default values for the general site metadata.
  const siteDescription = Site.description || '';
  const siteKeywords = Site.keywords || '';
  const siteImage = Site.image || '';
  const baseURL = Site.baseURL || '';

  function createMetadata(data) {
    const meta = {};
    meta.title = data.title || Site.name;
    meta.seoDescription = data.seoDescription
                          || data.description || siteDescription;
    meta.keywords = data.keywords || siteKeywords;
    meta.url = baseURL + data.url;

    const img = data.image || siteImage;
    if (img) { meta.image = baseURL + '/' + data.image; }
    return meta;
  }

</script>

<script>

  export let data = {};

  $: metadata = createMetadata(data);

</script>

<svelte:head>
  <title>{metadata.title}</title>
  <meta name='description' content='{metadata.seoDescription}' />
  <meta name='keywords' content='{metadata.keywords}'/>

  <!-- Open Graph / Facebook -->
  <meta property='og:type' content='website'>
  <meta property='og:url' content='https://lacourt.dev/{metadata.slug}'>
  <meta property='og:title' content='{metadata.title}'>
  <meta property='og:description' content='{metadata.seoDescription}'>
  {#if metadata.image !== ''}
    <meta property='og:image' content='{metadata.image}'>
  {/if}

  <!-- Twitter -->
  <meta property='twitter:card' content='summary_large_image'>
  <meta property='twitter:url' content='{metadata.url}'>
  <meta property='twitter:title' content='{metadata.title}'>
  <meta property='twitter:description' content='{metadata.seoDescription}'>
  {#if metadata.image}
    <meta property='twitter:image' content='{metadata.image}'>
  {/if}

  <meta name='viewport' content='width=device-width'>
  <meta charSet='utf-8' />

</svelte:head>

