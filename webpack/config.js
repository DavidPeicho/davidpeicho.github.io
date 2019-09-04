const path = require('path');

/**
 * This blog uses aliases to find your content without knowing where it really
 * is.
 *
 * @property {string} '@content' - Path to the content folder.
 * @property {string} '@blog' - Path to your blog posts folder. Each post
 *   should live into its own subfolder. e.g: `blog/myblog/index.md`.
 * @property {string} '@projects' - Path to the project folder. Each project
 *   should live into its own subfolder. Project do not need to be markdown, as
 *   they only export a header (metadata).
 *
 * @type {Object}
 */
module.exports.UserAliases = {
  '@content': path.resolve('content'),
  '@blog': path.resolve('content', 'routes', 'blog'),
  '@projects': path.resolve('content', 'projects'),
};
