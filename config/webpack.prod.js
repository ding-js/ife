const path = require('path');

const webpack = require('webpack');

const op = require('./index.js'),

	config = op.webpackConfig;

config.output.filename = '[name]/[hash].js';

config.plugins.push(
	new webpack.optimize.UglifyJsPlugin({
		compress: {
			warnings: false
		},
		comments: false,
		sourceMap: false
	}),
	new webpack.BannerPlugin(`Copyright 2017 by ding\n@author Ding <ding-js@outlook.com>`)
);

module.exports = config;
