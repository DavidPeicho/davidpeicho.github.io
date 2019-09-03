import { importMetadata } from '@utils/metadata-processor';

const ctx = require.context('@content/projects', true, /\.(md|js|svelte)$/);

export const ProjectsList = importMetadata(ctx);
const ProjectsListSerialized = JSON.stringify(ProjectsList);

export function get(_, res) {
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(ProjectsListSerialized);
}
