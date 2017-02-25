const path = require('path');

const posix = path.posix;

const getEntries = require('get-entries');

const op = require('./index.js');

const config = op.webpackConfig;

const entries = getEntries(op.src + 'pages/**/index.ts', op.dist);

Object.assign(config, {
	entry: entries,
	devServer: {
		contentBase: path.resolve('./'),
		compress: false,
		port: 9000,
		watchContentBase: true,
		hot: true,
		overlay: true
	}
});

module.exports = config;
