import { dirname, sep } from 'path';

const projects = processImport();
const serialized = JSON.stringify(projects);

export function get(req, res) {
	res.writeHead(200, {
		'Content-Type': 'application/json'
	});
	res.end(serialized);
}

function processImport() {
  const ctx = require.context(`../projects/`, true, /\.(js)$/);
  const keys = ctx.keys();
  const list = keys.map((path) => {
    // Extracts the article Id.
    const id = dirname(path).split(sep).pop();
    const module = ctx(path);
    const meta = module.Metadata || {};
    return meta;
  });

  return list;
}
