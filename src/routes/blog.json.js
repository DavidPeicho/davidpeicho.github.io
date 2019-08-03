import { dirname, sep } from 'path';

const posts = processImport();
const serialized = JSON.stringify(posts);

export function get(req, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
  });
	res.end(serialized);
}

function processImport() {
  const ctx = require.context(`./blog/`, true, /\.(svexy)$/);
  const keys = ctx.keys();
  const list = keys.map((path) => {
    // Extracts the article Id.
    const id = dirname(path).split(sep).pop();
    const module = ctx(path);
    const meta = Object.assign({ href: `blog/${id}` }, module.Metadata || {});
    return meta;
  });

  return list;
}
