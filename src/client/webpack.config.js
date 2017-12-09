var webpack = require('webpack');
var config = require("./webpack.config.dev.js");

delete config.entry._devserver;
config.plugins = config.plugins.concat([
	new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify('production')
	}),
	new webpack.optimize.UglifyJsPlugin()
]);

module.exports = config;
