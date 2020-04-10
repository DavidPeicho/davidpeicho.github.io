import { dirname, sep } from 'path';

/**
 * Imports all metadata from a given Webpack Context.
 *
 * @param {*} ctx - Webpack context.
 */
export function importMetadata(ctx, segment = '') {
  const keys = ctx.keys();
  const list = keys.map((path) => {
    const id = dirname(path).split(sep).pop();
    if (!id || id === '.' || id === '..') { return null; }
    const module = ctx(path);
    const url = segment !== '' ? `/${segment}/${id}` : `/${id}`;
    const meta = Object.assign({
      id,
      url,
      priority: Number.MAX_SAFE_INTEGER
    }, module.Metadata || {});
    return meta;
  })
  .filter((e) => e !== null)
  .filter((e) => e.published === undefined || !!e.published);

  // Sorts per date and priority.
  list.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return saturate(dateB - dateA) + b.priority - a.priority;
  });

  // Builds link to next / previous.
  // List is sorted by date first, so the `previous` element is actually the
  // next in the list.
  list.forEach((elt, i) => {
    elt.previous = null;
    elt.next = null;
    if (i > 0) {
      elt.next = { title: list[i - 1].title, url: list[i - 1].url };
    }
    if (i < list.length - 1) {
      elt.previous = { title: list[i + 1].title, url: list[i + 1].url };
    }
  });

  return list;
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function saturate(val) {
  return clamp(val, -1, 1);
}
