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
    const meta = Object.assign({ id, url }, module.Metadata || {});
    return meta;
  })
  .filter((e) => e !== null)
  .filter((e) => e.published === undefined || !!e.published);

  list.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
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
