const sapperConfig = require('sapper/config/webpack.js');
const webpackMerge = require('webpack-merge');
const { DefinePlugin } = require('webpack');

const { sveltePreprocess, BaseConfig, __DEV__ } = require('./webpack.common');

/**
 * Webpack client configuration.
 */
module.exports = webpackMerge(BaseConfig, {

  entry: sapperConfig.client.entry(),

  output: sapperConfig.client.output(),

  module: {
    rules: [ {
      // We need the Svelte Loader to preprocess any `.svelte` file.
      test: /\.(svelte|md|html)$/,
      use: {
        loader: 'svelte-loader',
        options: {
          dev: __DEV__,
          preprocess: sveltePreprocess(),
          hydratable: true,
          // pending https://github.com/sveltejs/svelte/issues/2377
          hotReload: false
        }
      }
    } ]
  },

  plugins: [
    // pending https://github.com/sveltejs/svelte/issues/2377
    // dev && new webpack.HotModuleReplacementPlugin(),
    new DefinePlugin({
      'process.browser': true,
      'process.env.NODE_ENV': JSON.stringify(BaseConfig.mode)
    }),
  ].filter(Boolean),

  devtool: __DEV__ && 'inline-source-map'

});
