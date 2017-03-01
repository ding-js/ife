const path = require('path');

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const op = require('./index.js');

const config = op.webpackConfig;


config.plugins.unshift(
	new ExtractTextPlugin({
		filename: op.devName + '.css'
	})
);

Object.assign(config, {
	devServer: {
		contentBase: path.resolve('./'),
		compress: false,
		port: 9000,
		watchContentBase: false
	},
	devtool: 'source-map'
});

module.exports = config;
