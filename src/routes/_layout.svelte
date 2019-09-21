<script context='module'>

  import Footer from '@components/footer';
  import Meta from '@components/meta';
  import Nav from '@components/nav-bar';

</script>

<script>

  /**
   * Main blog layout. Every page gets wrapped by this.
   */

  /**
   * Current route segment the user is at. e.g: `about`, or `projects`.
   *
   * @type {string}
   */
  export let segment;

</script>

<main>
  <Nav {segment}/>
	<slot {segment}></slot>
  <Footer />
</main>

<style>

	main {
		position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100vh;
		margin: 0 auto;
		box-sizing: border-box;
		background-color: white;
  }

</style>
