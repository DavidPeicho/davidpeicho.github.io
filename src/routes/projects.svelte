<script context='module'>

  import { onMount } from 'svelte';

  import Card from '@components/card';
  import Meta from '@components/meta';
  import { processList } from '@routes/blog';

  import { User } from '$config';

	export function preload({ params, query }) {
    return this.fetch('projects.json').then(r => r.json()).then(projects => {
			return { projects: processList(projects) };
		});
  }

  export const Metadata = {
    title: `${User.name} - Projects`,
    seoDescription: `List of Computer Graphics, and Game Development projects of ${User.name}`,
    url: '/projects'
  };

</script>

<script>

  /**
   * Current route segment the user is at. e.g: `about`, or `projects`.
   *
   * @type {string}
   */
  export let segment;

  /**
   * List of posts metadata, ordered by date directly on the server.
   *
   * @type {Object[]}
   */
  export let projects;

  let metadata = Object.assign({}, Metadata);

  onMount(() => {
    if (projects.length > 0) {
      metadata.image = projects[0].image;
      metadata = metadata;
    } else {
      delete Metadata.image;
    }
  })

</script>

<!-- Blog Meta. Really important for SEO. -->
<Meta data={metadata} />

<div>
  { #each projects as project, i }
    <Card
      {...project}
      direction={i % 2 === 0 ? 'left' : 'right'}
      displayInfo={false}
    />
  { /each }
</div>

<style>

</style>
