const path = require('path');

const getEntries = require('get-entries');

const op = require('./index.js');

const config = op.webpackConfig;

const entries = getEntries('./' + op.src + 'pages/**/index.ts', op.dist);

Object.assign(config, {
	entry: entries,
	devServer: {
		contentBase: path.resolve('./'),
		compress: false,
		port: 9000,
		watchContentBase: false
	},
	devtool: 'source-map'
});

module.exports = config;
