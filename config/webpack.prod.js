const path = require('path');

const webpack = require('webpack');

const getEntries = require('get-entries');

const op = require('./index.js'),

	config = op.webpackConfig,

	entries = getEntries('./' + op.src + 'pages/**/index.ts', op.dist);

Object.assign(config, {
	entry: entries
});

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
