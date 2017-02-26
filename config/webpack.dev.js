const path = require('path');

const op = require('./index.js');

const config = op.webpackConfig;

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
