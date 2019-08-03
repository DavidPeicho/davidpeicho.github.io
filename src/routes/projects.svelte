<svelte:head>
	<title>Projects</title>
</svelte:head>

<script context='module'>
	export function preload({ params, query }) {
    return this.fetch('projects.json')
      .then(r => r.json())
      .then(projects => {
			  return { projects };
		});
	}
</script>

<script> export let projects; console.log(projects[1].thumbnail); </script>

<h1> {projects[0].title} </h1>

<style>
</style>
