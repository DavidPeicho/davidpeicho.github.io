<script>
  import { onMount } from 'svelte';

  export let data = {};

</script>

<svelte:head>
  <title>{ data.title }</title>
  <meta name="description" content="{ data.seoDescription }" />
  <meta name="keywords" content=''/>

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://lacourt.dev/{data.slug}">
  <meta property="og:title" content="{data.title}">
  <meta property="og:description" content="{data.seoDescription}">
  {#if data.thumb}
    <meta property="og:image" content="{data.thumb}">
  {/if}

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://lacourt.dev/{data.slug}">
  <meta property="twitter:title" content="{data.title}">
  <meta property="twitter:description" content="{data.description}">
  {#if data.thumb}
    <meta property="twitter:image" content="{data.thumb}">
  {/if}

  <meta name="viewport" content="width=device-width">
  <meta charSet="utf-8" />

</svelte:head>

