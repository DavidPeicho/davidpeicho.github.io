<script context='module'>

  import { onMount, getContext } from 'svelte';

  import { User } from '$config';

  import Card from '@components/card';
  import Meta from '@components/meta';

  import { processList } from '@routes/blog';
  import { MetadataContextKey } from '@routes/_layout';

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

  export let segment;

  export let projects;

</script>

<!-- Blog Meta. Really important for SEO. -->
<Meta data={Metadata} />

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
