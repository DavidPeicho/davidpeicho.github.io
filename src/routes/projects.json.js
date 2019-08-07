import { ProjectsList } from '../server-utils';

const serialized = JSON.stringify(ProjectsList);

export function get(_, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(serialized);
}
