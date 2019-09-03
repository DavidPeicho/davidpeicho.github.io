import { importMetadata } from '@utils/metadata-processor';

/**
 * The `@blog` alias comes from the Webpack configuration.
 *
 * NOTE: If you decide to move your blog in your directory tree, think about
 * updating the Webpack configuration.
 */
const ctx = require.context('@blog', true, /\.(md|js|svelte)$/);

export const PostsList = importMetadata(ctx, 'blog');
export const PostsMap = PostsList.reduce((acc, it) => (acc[it.id] = it, acc), {});
const PostsListsSerialized = JSON.stringify(PostsList);

export function get(req, res) {
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(PostsListsSerialized);
}
