const webpack = require('webpack');
const path = require('path');
const config = require('sapper/config/webpack.js');
const pkg = require('./package.json');

const mdsvex = require('mdsvex').mdsvex;

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const alias = {
  svelte: path.resolve('node_modules', 'svelte'),
  '@components': path.resolve('src', 'components'),
  '@layouts': path.resolve('src', 'layouts'),
  '@utils': path.resolve('src', 'utils'),
  '$constants': path.resolve('src', 'constants.js'),
  '$config': path.resolve('src', 'config.js'),
  '$blog': path.resolve('src', 'blog.js')
};

const extensions = ['.mjs', '.js', '.json', '.svelte', '.svexy', '.html'];
const mainFields = ['svelte', 'module', 'browser', 'main'];

module.exports = {
	client: {
		entry: config.client.entry(),
		output: config.client.output(),
		resolve: { alias, extensions, mainFields },
		module: {
			rules: [
				{
					test: /\.(svelte|svexy|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
              dev,
              preprocess: preprocess(),
							hydratable: true,
							hotReload: false // pending https://github.com/sveltejs/svelte/issues/2377
						}
					}
        },
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
		mode,
		plugins: [
			// pending https://github.com/sveltejs/svelte/issues/2377
			// dev && new webpack.HotModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				'process.browser': true,
				'process.env.NODE_ENV': JSON.stringify(mode)
			}),
		].filter(Boolean),
		devtool: dev && 'inline-source-map'
	},

	server: {
		entry: config.server.entry(),
		output: config.server.output(),
		target: 'node',
		resolve: { alias, extensions, mainFields },
		externals: Object.keys(pkg.dependencies).concat('encoding'),
		module: {
			rules: [
				{
					test: /\.(svelte|svexy|html)$/,
					use: {
						loader: 'svelte-loader',
						options: {
              css: false,
              preprocess: preprocess(),
							generate: 'ssr',
							dev
						}
					}
        },
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
		mode: process.env.NODE_ENV,
		performance: {
			hints: false // it doesn't matter if server.js is large
		}
	},

	serviceworker: {
		entry: config.serviceworker.entry(),
		output: config.serviceworker.output(),
		mode: process.env.NODE_ENV
	}
};

function preprocess() {
  return mdsvex({});
}
