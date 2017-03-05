const path = require('path');

const posix = path.posix;

const gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	data = require('gulp-data'),
	pug = require('gulp-pug');

const del = require('del');

const op = require('./index.js');

gulp.task('clean', () => {
	del.sync(op.dist + '**');
});

gulp.task('pug', () => {
	const assets = require('./webpack-assets.json');

	return gulp.src(op.src + 'pages/**/index.pug')
		.pipe(plumber())

		.pipe(data(file => {
			const filePath = path.relative(path.resolve(op.src + 'pages'), file.path),
				dirPath = path.dirname(filePath);

			// new RegExp(path.sep) 报错
			const unixAssetName = dirPath.split(path.sep).join(posix.sep);

			const _asset = assets[unixAssetName];

			const _assetFile = {};

			const _common = assets[op.commonName];

			const _root = filePath.split(path.sep).fill('../').join('');

			for (let prop in _asset) {
				_assetFile[prop] = path.basename(_asset[prop]);
			}

			return {
				_asset: _asset,
				_assetFile: _assetFile,
				_common: _common,
				_root: _root,
				metadata: assets.metadata
			};
		}))
		.pipe(pug({
			basedir: './src/components'
		}))
		.pipe(gulp.dest(op.dist));
});


gulp.task('watch', ['clean', 'pug'], () => gulp.watch(op.src + '**/*.pug', ['pug']));
