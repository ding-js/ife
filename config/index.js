const path = require('path');

const webpack = require('webpack');

const getEntries = require('get-entries');

const AssetsPlugin = require('assets-webpack-plugin');

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const cssnano = require('cssnano'),
	autoprefixer = require('autoprefixer');

const config = {
	src: 'src/',
	dist: 'dist/'
};

const entries = getEntries('./' + config.src + 'pages/**/index.ts', config.dist, {
	dir: true
});


Object.assign(config, {
	webpackConfig: {
		entry: entries,
		output: {
			path: path.resolve(__dirname, '../'),
			filename: '[name]/index.js',
			library: 'ding',
			publicPath: ''
		},
		module: {
			rules: [{
				test: /\.ts$/,
				loader: 'ts-loader',
			}, {
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					fallback: 'style-loader',
					use: [{
							loader: 'css-loader',
							options: {
								sourceMap: true,
								importLoaders: 2
							}
						}, {
							loader: 'postcss-loader',
							options: {
								plugins: () => [
									autoprefixer,
									cssnano({
										safe: true
									})
								]
							}
						},
						{
							loader: 'sass-loader',
							options: {
								sourceMap: true
							}
						}
					]
				})
			}, {
				test: /\.pug$/,
				loader: 'pug-loader'
			}]
		},
		resolve: {
			modules: [
				'node_modules',
				'src/components'
			],
			extensions: ['.ts', '.js']
		},
		context: path.resolve(__dirname, '../'),
		target: 'web',
		plugins: [
			new AssetsPlugin({
				path: 'config'
			})
		]
	}
});

module.exports = config;
