import { PostsList } from '../server-utils';

const serialized = JSON.stringify(PostsList);

export function get(req, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
  });
	res.end(serialized);
}
