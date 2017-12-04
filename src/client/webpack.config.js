var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	// devtool: 'eval',
	context: __dirname,
	entry: {
		_devserver: 'webpack-dev-server/client?http://localhost:3000',
		index: './index',
		runner1x: '../runtime/v1/runner.ts',
		runner2x: '../runtime/v2/runner.ts'
	},
	output: {
		path: path.resolve(__dirname, "..", "..", "dist"),
		filename: '[name]-bundle.js',
		publicPath: '/dist/'
	},
	resolve: {
		extensions: ['.js', '.ts', '.tsx']
	},
	plugins: [
		new ExtractTextPlugin("styles.css"),
	],
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
				test: /global\.css$/,
				use: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader" })
			},
			{
				test: /\.css$/,
				exclude: /global\.css$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader?module&localIdentName=[path][name]--[local]--[hash:base64:5]" }
				]
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
