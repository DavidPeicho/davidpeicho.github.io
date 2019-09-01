const sapperConfig = require('sapper/config/webpack.js');
const webpackMerge = require('webpack-merge');
const { DefinePlugin } = require('webpack');

const { sveltePreprocess, BaseConfig, __DEV__ } = require('./webpack.common');

module.exports = webpackMerge(BaseConfig, {

  entry: sapperConfig.client.entry(),
  output: sapperConfig.client.output(),

  module: {
    rules: [ {
      test: /\.(svelte|md|html)$/,
      use: {
        loader: 'svelte-loader',
        options: {
          dev: __DEV__,
          preprocess: sveltePreprocess(),
          hydratable: true,
          hotReload: false // pending https://github.com/sveltejs/svelte/issues/2377
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
