<svelte:head>
	<title>Projects</title>
</svelte:head>

<script context='module'>

  import Card from '@components/card';

	export function preload({ params, query }) {
    return this.fetch('projects.json')
      .then(r => r.json())
      .then(projects => {
			  return { projects };
		});
  }

</script>

<script> export let projects; </script>

<div>
  { #each projects as project, i }
    <Card
      description={project.description}
      image={project.thumbnail}
      url={project.url}
      videoLink={project.videoLink}
      title={project.title}
      direction={i % 2 === 0 ? 'left' : 'right'}
      tags={project.tags}
    />
  { /each }
</div>

<style>

</style>
