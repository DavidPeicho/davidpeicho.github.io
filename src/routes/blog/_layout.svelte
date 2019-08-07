<script context="module">
	export async function preload(data) {
    return (
      this.fetch(`metadata.json?path=${data.path}`)
        .then(metadata => metadata.json()).then(metadata => {
          return { metadata };
        })
    );
	}
</script>

<script>
  import Nav from '@components/nav';
	import Meta from '@components/meta';

  export let segment;
  export let metadata;
</script>

<Meta data={metadata} />

<div class='post-content'>
  <slot></slot>
</div>

<style>
  .content {
    max-width: 42rem;
    margin: auto;
  }
</style>
