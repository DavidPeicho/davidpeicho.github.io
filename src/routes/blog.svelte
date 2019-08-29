<script context="module">

  import { onMount, getContext } from 'svelte';

  import { User } from '$blog';

  import Card from '@components/card';

  import { MetadataContextKey } from '@routes/_layout';

	export function preload({ params, query }) {
		return this.fetch('blog.json').then(r => r.json()).then(posts => {
			return { posts };
		});
  }

  export const Metadata = {
    title: `${User.name} - Blog Posts`,
    seoDescription: `List articles relative to Computer Graphics and / or Game Development, written by ${User.name}`
  };

</script>

<script>

  export let segment;

  export let posts;

  onMount(() => {
    const setMetadata = getContext(MetadataContextKey);
    if (setMetadata) { setMetadata(Metadata); }
  });

</script>

<div>
  { #each posts as post, i }
    <Card
      description={post.description}
      image={post.thumbnail}
      url={post.url}
      videoLink={post.videoLink}
      title={post.title}
      direction={i % 2 === 0 ? 'left' : 'right'}
      tags={post.tags}
    />
  { /each }
</div>
