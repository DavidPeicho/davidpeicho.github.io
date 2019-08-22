<script>
  import { onMount } from 'svelte';

  export let data = {};

  const metadata = {};

  onMount(() => {
    metadata.title = data.title;
    metadata.description = data.description || metadata.title;
  });

</script>

<svelte:head>
  <title>{ metadata.title }</title>
  <meta name="description" content="{ metadata.description }" />
  <meta name="keywords" content=''/>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://lacourt.dev/{metadata.slug}">
  <meta property="og:title" content="{metadata.title}">
  <meta property="og:description" content="{metadata.description}">
  {#if metadata.thumb}
    <meta property="og:image" content="{metadata.thumb}">
  {/if}

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://lacourt.dev/{metadata.slug}">
  <meta property="twitter:title" content="{metadata.title}">
  <meta property="twitter:description" content="{metadata.description}">
  {#if metadata.thumb}
    <meta property="twitter:image" content="{metadata.thumb}">
  {/if}
</svelte:head>

