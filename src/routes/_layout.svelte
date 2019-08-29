<script context='module'>

  import Nav from '@components/nav';

</script>

<script>

  /**
   * Current route segment the user is at. e.g: `about`, or `projects`.
   *
   * @type {string}
   */
  export let segment;

</script>

<!-- Displays the nav bar on top. -->
<Nav {segment}/>

<main>
	<slot {segment}></slot>
</main>

<style>
	main {
		position: relative;
		background-color: white;
		margin: 0 auto;
		box-sizing: border-box;
	}
</style>
