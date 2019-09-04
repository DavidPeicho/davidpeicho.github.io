import { importMetadata } from '@utils/metadata-processor';

/**
 * The `@projects` alias comes from the Webpack configuration.
 *
 * NOTE: If you decide to move your blog in your directory tree, think about
 * updating the Webpack configuration.
 */
const ctx = require.context('@projects', true, /\.(md|js|svelte)$/);

export const ProjectsList = importMetadata(ctx);
const ProjectsListSerialized = JSON.stringify(ProjectsList);

export function get(_, res) {
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(ProjectsListSerialized);
}
