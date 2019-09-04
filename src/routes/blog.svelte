<script context="module">

  import { User } from '$config';

  import Card from '@components/card';
  import Meta from '@components/meta';

  export function processList(list) {
    return list.map((metadata) => {
      return {
        description: metadata.description,
        image: metadata.image,
        url: metadata.url,
        videoLink: metadata.videoLink,
        title: metadata.title,
        tags: metadata.tags || [],
        date: metadata.date || new Date(),
        readingTime: metadata.readingTime
      };
    });
  }

  export function preload({ params, query }) {
		return this.fetch('blog.json').then(r => r.json()).then(posts => {
			return { posts: processList(posts) };
		});
  }

  export const Metadata = {
    title: `${User.name} - Blog Posts`,
    seoDescription: `List articles relative to Computer Graphics and / or Game Development, written by ${User.name}`
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
  export let posts;

</script>

<!-- Blog Meta. Really important for SEO. -->
<Meta data={Metadata} />

<div>
  { #each posts as post, i }
    <Card
      {...post}
      direction={i % 2 === 0 ? 'left' : 'right'}
      displayInfo={true}
    />
  { /each }
</div>
