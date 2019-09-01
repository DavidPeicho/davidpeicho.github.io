const mdsvex = require('mdsvex').mdsvex;
const path = require('path');

const WEBPACK_MODE = process.env.NODE_ENV;
const __DEV__ = WEBPACK_MODE === 'development';

const Aliases = {
  svelte: path.resolve('node_modules', 'svelte'),
  '@components': path.resolve('src', 'components'),
  '@layouts': path.resolve('src', 'layouts'),
  '@routes': path.resolve('src', 'routes'),
  '@utils': path.resolve('src', 'utils'),
  '$constants': path.resolve('src', 'constants.js'),
  '$config': path.resolve('src', 'config.js'),
  '$blog': path.resolve('src', 'blog.js')
};
const Extensions = [ '.mjs', '.js', '.json', '.svelte', '.md', '.html' ];
const MainFields = [ 'svelte', 'module', 'browser', 'main' ];

const BaseConfig = {

  mode: WEBPACK_MODE,

  resolve: {
    alias: Aliases,
    extensions: Extensions,
    mainFields: MainFields
  },

  module: {
    rules: [
      {
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

  plugins: []

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
