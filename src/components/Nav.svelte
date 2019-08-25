<script>
  export let segment;

  function isSelected(segment = '', route = '') {
    return segment === route ? 'selected' : '';
  }
</script>

<style>
	nav {
		border-bottom: 1px solid #ef495c59;
		font-weight: 300;
    padding: 0 1em;
    text-align: center;
	}

	ul {
		margin: 0;
    padding: 0;
    display: inline-block;
	}

	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
    margin: 0;
		display: block;
		float: left;
	}

	.selected {
		position: relative;
		display: inline-block;
	}

	.selected::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: #ef495c;
		display: block;
		bottom: 10px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}
</style>

<nav>
	<ul>
		<li><a class={isSelected(segment, '')} href='.'>about</a></li>
		<li><a rel=prefetch class={isSelected(segment, 'projects')} href='projects'>projects</a></li>
		<li><a rel=prefetch class='{isSelected(segment, 'blog')}' href='blog'>blog</a></li>
	</ul>
</nav>
