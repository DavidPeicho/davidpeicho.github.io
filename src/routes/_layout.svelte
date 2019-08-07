<script>
	import Nav from '@components/nav';

  export let segment;
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

<main>
	<slot {segment}></slot>
</main>
