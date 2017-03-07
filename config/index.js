const path = require('path');

const webpack = require('webpack');

const getEntries = require('get-entries');

const AssetsPlugin = require('assets-webpack-plugin');

const ExtractTextPlugin = require("extract-text-webpack-plugin");

const cssnano = require('cssnano'),
	autoprefixer = require('autoprefixer');

const config = {
	src: './src/',
	dist: './public/dist/',
	devName: '[name]',
	prodName: '[chunkhash]',
	devPublicPath: '/public/dist/',
	prodPublicPath: '/ife/public/dist/',
	commonName: 'common',
	copyright: `Copyright ${new Date().getFullYear().toString()} by Ding\n@author Ding <ding-js@outlook.com>`
};

const entries = getEntries(config.src + 'pages/**/index.ts', {
	dir: true,
	publicModule: ['global']
});

Object.assign(config, {
	webpackConfig: {
		entry: entries,
		output: {
			path: path.resolve(__dirname, '../', config.dist),
			filename: config.devName + '.js',
			library: 'ding[id]',
			publicPath: config.devPublicPath
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
								sourceMap: true
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
			new webpack.optimize.CommonsChunkPlugin({
				name: config.commonName
			}),
			new AssetsPlugin({
				path: 'config',
				metadata: {
					copyright: config.copyright
				}
			})
		]
	}
});

module.exports = config;
