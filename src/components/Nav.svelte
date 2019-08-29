<script context='module'>

  /**
   * Returns `true` if the route is the same as the current segment, i.e if the
   * user is on the same page pointed by the nav bar. `false` otherwise.
   *
   * @return {boolean} `true` if the route is equal to the segment, `false`
   *   otherwise.
   */
  function isSelected(segment = '', route = '') {
    return segment === route ? 'selected' : '';
  }

</script>

<script>

  /**
   * This component builds a navigation bar, with the following hardcoded
   * routes: `about`, `projects`, and `blog`.
   */

  /** PROPS */

  /**
   * Current route segment the user is at. e.g: `about`, or `projects`.
   *
   * @type {string}
   */
  export let segment;

</script>

<nav>
	<ul>
		<li>
      <a class={isSelected(segment, '')} href='.'>
        about
      </a>
    </li>
		<li>
      <a rel=prefetch class={isSelected(segment, 'projects')} href='projects'>
        projects
      </a>
    </li>
		<li>
      <a rel=prefetch class='{isSelected(segment, 'blog')}' href='blog'>
        blog
      </a>
    </li>
	</ul>
</nav>

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
