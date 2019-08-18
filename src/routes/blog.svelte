<script context="module">
  import Card from '@components/card';

	export function preload({ params, query }) {
		return this.fetch('blog.json').then(r => r.json()).then(posts => {
			return { posts };
		});
	}
</script>

<script>
  export let posts;
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
