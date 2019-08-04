<script module>
  export let toto;
</script>

<script>
  import { onMount } from 'svelte';
	import Nav from '@components/nav';

  export let segment;
  export let toto;
</script>

<style>
	main {
		position: relative;
		background-color: white;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>

<svelte:head>
</svelte:head>

<Nav {segment}/>

<h1>{ toto }</h1>

<main>
	<slot></slot>
</main>
