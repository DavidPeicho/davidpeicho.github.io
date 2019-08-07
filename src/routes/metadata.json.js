import { PostsMap } from '../server-utils';

export function get(req, res) {
  if (!req.query || !req.query.path) {
    res.writeHead(404, {
      'Content-Type': 'application/json'
    });
    res.end('');
    return;
  }
  const metadata = PostsMap[req.query.path];

  res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(JSON.stringify(metadata));
}
