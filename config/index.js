const path = require('path');

const AssetsPlugin = require('assets-webpack-plugin')

const config = {
	src: './src/',
	dist: './dist/'
};

Object.assign(config, {
	webpackConfig: {
		output: {
			path: '/',
			filename: '[name]',
			publicPath: '',
			library: 'ding'
		},
		module: {
			rules: [{
				test: /\.ts$/,
				loader: 'ts-loader',
			}, {
				test: /\.scss$/,
				use: [
					'style-loader',
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							plugins: () => [
								require('autoprefixer')
							]
						}
					},
					'sass-loader'
				]
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
