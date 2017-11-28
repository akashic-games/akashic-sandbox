var path = require('path');
var webpack = require('webpack');

module.exports = {
  devtool: 'eval',
  context: __dirname,
  entry: [
    'webpack-dev-server/client?http://localhost:3000',
    './index'
  ],
  output: {
    path: path.resolve(__dirname, "..", "..", "dist"),
    filename: 'bundle.js',
    publicPath: '/static/'
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
				test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
					configFile: "tsconfig.json"
        }
      },
      {
				test: /\.nervertsx?$/,
        loader: "awesome-typescript-loader",
        options: {
					configFileName: "./tsconfig.json"
        }
      },
      {
        test: /\.png$/,
        loader: 'url-loader?limit=10000&mimetype=image/pngl&name=[path][name].[ext]'
      },
      {
        test: /\.svg$/,
        loader: 'url-loader?limit=10000&mimetype=image/svg+xml&name=[path][name].[ext]'
      },
      {
        test: /\.woff$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff&name=[path][name].[ext]'
      },
      {
        test: /\.woff2$/,
        loader: 'url-loader?limit=10000&mimetype=application/font-woff2&name=[path][name].[ext]'
      },
      {
        test: /\.[ot]tf$/,
        loader: 'url-loader?limit=10000&mimetype=application/octet-stream&name=[path][name].[ext]'
      },
      {
        test: /\.eot$/,
        loader: 'url-loader?limit=10000&mimetype=application/vnd.ms-fontobject&name=[path][name].[ext]'
      }
    ]
  }
};
