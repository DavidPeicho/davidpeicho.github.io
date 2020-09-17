const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const production = process.env.NODE_ENV === 'production';

const mode = production ? 'production' : 'development';
const devtool = production ? 'source-map' : 'inline-source-map';

const DemoConfig = {

  mode,
  devtool,

  entry: {
    demo: [ './src/frontpage/index.js' ],
  },

  output: {
    path: path.resolve(__dirname, 'assets/js/demo'),
    filename: "[name].js",
  },

  module: {
    rules: [
      {
        test: /\.glsl$/i,
        use: "raw-loader",
      },
      {
        test: /\.worker\.js$/,
        loader: 'worker-loader',
        options: {
          inline: 'no-fallback'
        }
      }
    ]
  }

};


module.exports = DemoConfig;
