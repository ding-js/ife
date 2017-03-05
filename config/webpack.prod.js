const path = require('path');

const webpack = require('webpack');

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const op = require('./index.js'),

	config = op.webpackConfig;


Object.assign(config.output, {
	filename: op.prodName + '.js',
	publicPath: op.prodPublicPath
});

config.plugins.unshift(
	new ExtractTextPlugin({
		filename: op.prodName + '.css'
	})
);

config.plugins.push(
	new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		},
		comments: false,
		sourceMap: false
	}),
	new webpack.BannerPlugin(op.copyright)
);

module.exports = config;
