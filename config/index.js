const path = require('path');
module.exports = {
	webpackConfig: {
		output: {
			path: path.resolve(__dirname, 'dist'),
			filename: '[name]',
			publicPath: '.',
			library: 'ding'
		},
		module: {
			rules: [{
				test: /\.ts$/,
				loader: 'ts-loader',
			}, {
				test: /\.less$/,
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
					'less-loader'
				]
			}, {
				test: /\.pug$/,
				loader: 'pug-loader'
			}]
		},
		resolve: {
			modules: [
				'node_modules',
				path.resolve(__dirname, 'src/components')
			],
			extensions: ['.ts', '.js']
		},
		context: path.resolve(__dirname, '../'),
		target: 'web',
		plugins: []
	}
};
