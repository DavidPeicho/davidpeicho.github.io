const sapperConfig = require('sapper/config/webpack.js');
const webpackMerge = require('webpack-merge');

const pkg = require('../package');

const { sveltePreprocess, BaseConfig, __DEV__ } = require('./webpack.common');

/**
 * Webpack server configuration.
 */
module.exports = webpackMerge(BaseConfig, {

  entry: sapperConfig.server.entry(),
  output: sapperConfig.server.output(),

  target: 'node',

  externals: Object.keys(pkg.dependencies).concat('encoding'),

  module: {
    rules: [ {
      // We need the Svelte Loader to preprocess any `.svelte` file.
      test: /\.(svelte|md|html)$/,
      use: {
        loader: 'svelte-loader',
        options: {
          dev: __DEV__,
          css: false,
          preprocess: sveltePreprocess(),
          generate: 'ssr',
        }
      }
    } ]
  },

  performance: {
    hints: false // it doesn't matter if server.js is large
  }

});
