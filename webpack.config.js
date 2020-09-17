const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

const production = process.env.NODE_ENV === "production";

module.exports = {
  mode: production ? "production" : "development",

  devtool: production ? "source-map" : "inline-source-map",

  entry: {
    demo: ["./src/frontpage/index.js"],
  },

  output: {
    path: path.resolve(__dirname, "assets", "js"),
    filename: "[name].js",
  },

  module: {
    rules: [
      {
        test: /\.glsl$/i,
        use: "raw-loader",
      },
    ],
  },
};
