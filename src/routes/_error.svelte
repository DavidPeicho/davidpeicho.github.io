<script context='module'>

  import Offline from './offline';

  function isFetchError(error) {
    return (
      error.name === 'ChunkLoadError'
      || (error.message || '').toLowerCase().match(/failed\s+to\s+fetch/g)
    );
  }

  function isOffline(status, error) {
    return status === 500 && isFetchError(error);
  }

</script>

<script>

	export let status;
  export let error;

  console.log(status);
  console.log(error);

</script>

<style>
	h1, p {
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	p {
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

{ #if isOffline(status, error) }
  <Offline />
{ /if }

{ #if process.env.NODE_ENV === 'development' }
  <h1>{status}</h1>
  <p>{error.message}</p>
  { #if error.stack }
	  <pre>{error.stack}</pre>
  { /if }
{ /if }
