var path = require('path');
var webpack = require('webpack');

module.exports = {
	context: __dirname,
	entry: {
		runtime1x: './v1/setupRuntimeV1.ts',
		runtime2x: './v2/setupRuntimeV2.ts'
	},
	output: {
		path: path.resolve(__dirname, "..", "..", "dist"),
		filename: '[name].js',
		publicPath: '/dist/'
	},
	resolve: {
		extensions: ['.js', '.ts'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader",
				options: {
					configFile: "tsconfig.json"
				}
			}
		]
	}
};

