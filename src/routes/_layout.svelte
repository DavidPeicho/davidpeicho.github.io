<script context='module'>

  import { onMount } from 'svelte';

  import { Site } from '$config';

  import Footer from '@components/footer';
  import Meta from '@components/meta';
  import Nav from '@components/nav-bar';

  function addScriptTag(attributes, code = null) {
    const s = document.createElement('script');
    const attr = attributes || [];
    for (const a in attr) {
      s.setAttribute(a, attr[a] ? attr[a] : null);
    }
    if (code) { s.text = code; }
    document.head.appendChild(s);
  }

  export function preload(page, session) {
    const segment = page.path.split('/').pop() || page.path;
    return { segment};
  }

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
  console.log(segment);

  onMount(() => {
    const id = Site.googleAnalytics;
    addScriptTag({
      async: '',
      src: `https://www.googletagmanager.com/gtag/js?id=${id}`
    });
    addScriptTag({},
      `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${id}');
      `
    );
  })

</script>

<main>
  <Nav {segment}/>
	<slot {segment}></slot>
  <Footer />
</main>

<style>

	main {
		position: relative;
    min-height: 100vh;
		margin: 0 auto;
		box-sizing: border-box;
		background-color: white;
  }

</style>
