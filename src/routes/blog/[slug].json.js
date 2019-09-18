import { PostsMap } from '@routes/blog.json';

export function get(req, res) {
  const slug = req.params.slug;
  if (!slug) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end('');
    return;
  }

  const metadata = PostsMap[slug];

  res.writeHead(200, {
		'Content-Type': 'application/json'
  });

	res.end(JSON.stringify(metadata));
}
