var webpack = require('webpack');
var config = require("./webpack.config.dev.js");

config.plugins = (config.plugins || []).concat([
	new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify('production')
	})
	// エンジンのデバッグ容易性と、devtoolでクラス名がmangleされてしまうのを避けるため使わない
	// TODO コメント除去
	// , new webpack.optimize.UglifyJsPlugin()
]);

module.exports = config;
