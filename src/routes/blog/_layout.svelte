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

<h1>THATS  BEAUTIFUL DAVID</h1>

<slot></slot>

<p>{ metadata.next ? metadata.next.title : '' }</p>
