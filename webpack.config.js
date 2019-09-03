const config = require('sapper/config/webpack.js');

const WebpackClientConfig = require('./webpack/webpack.client');
const WebpackServerConfig = require('./webpack/webpack.server');

module.exports = {

  /** Webpack configuration for the client. */
	client: WebpackClientConfig,

  /** Webpack configuration for the server. */
	server: WebpackServerConfig,

  /** Webpack configuration for the middleware. */
	serviceworker: {
		entry: config.serviceworker.entry(),
		output: config.serviceworker.output(),
		mode: WebpackServerConfig.mode
	}
};
