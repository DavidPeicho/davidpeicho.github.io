const CopyPlugin = require('copy-webpack-plugin');
const { mdsvex } = require('mdsvex');
const path = require('path');

const Config = require('./config');

const WEBPACK_MODE = process.env.NODE_ENV || 'development';
const __DEV__ = WEBPACK_MODE === 'development';

const CONTENT_PATH = path.resolve(__dirname, '..', 'content');
const SRC_PATH = path.resolve(__dirname, '..', 'src');

/**
 * Webpack aliases for faster require.
 *
 * @type {Object}
 */
const Aliases = {
  svelte: path.resolve('node_modules', 'svelte'),
  '@components': path.resolve('src', 'components'),
  '@layouts': path.resolve('src', 'layouts'),
  '@routes': path.resolve('src', 'routes'),
  '@utils': path.resolve('src', 'utils'),
  '$blog': path.resolve('blog.js'),
  '$config': path.resolve('config.js'),
};

/**
 * Extensions that Webpack should resolve.
 *
 * @type {string[]}
 */
const Extensions = [ '.mjs', '.js', '.json', '.svelte', '.md', '.html' ];

/**
 * Fields to require from in a `package.json` dependency.
 *
 * @type {string[]}
 */
const MainFields = [ 'svelte', 'module', 'browser', 'main' ];

/**
 * Base Webpack configuration.
 *
 * The client and the server will use this as a sharable config.
 */
const BaseConfig = {

  mode: WEBPACK_MODE,

  resolve: {
    alias: Object.assign({}, Aliases, Config.UserAliases),
    extensions: Extensions,
    mainFields: MainFields
  },

  module: {

    rules: [
      {
        // We use this loader to import images in the code, just lile any other
        // code resource. The image will be moved to the static folder and a
        // URL will be generated.
        test: /\.(png|jpg)$/,
        use: {
          loader: 'url-loader',
          options: {
            outputPath: '../../../static/images',
            publicPath: 'images',
            limit: 1000
          }
        }
      }

    ]
  },

  plugins: [

    new CopyPlugin([
      {
        from: path.resolve(CONTENT_PATH, 'routes'),
        to: path.resolve(SRC_PATH, 'routes'),
        toType: 'dir'
      }
    ])

  ]

};

function highlight(str, lang) {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return '<pre class="hljs"><code>' +
             hljs.highlight(lang, str, true).value +
             '</code></pre>';
    } catch (__) {}
  }
  return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
}

/**
 * Svelte Preprocessor.
 *
 * This function applies the MDSvex preprocessor in order to transpiles
 * markdown files into Svelte components.
 *
 * See https://github.com/pngwn/MDsveX for more information.
 *
 */
function sveltePreprocess() {
  return mdsvex({
    extension: '.md',
    markdownOptions: { highlight }
  });
}

module.exports = {

  sveltePreprocess,

  __DEV__,

  BaseConfig,

};
