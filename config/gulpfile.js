const path = require('path');

const posix = path.posix;

const gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	data = require('gulp-data'),
	pug = require('gulp-pug');

const del = require('del');

const op = require('./index.js');

const assets = require('./webpack-assets.json');

gulp.task('clean', () => {
	del.sync(op.dist + '**');
});

gulp.task('pug', () =>
	gulp.src(op.src + 'pages/**/index.pug')
	.pipe(plumber())
	.pipe(data(file => {
		const filePath = path.relative(path.resolve(op.src + 'pages'), file.path),
			dirPath = path.dirname(filePath),
			assetName = path.join(op.dist, dirPath, 'index.js');

		const root = filePath.split(path.sep).fill('../').join('');

		const unixAssetName = assetName.replace(/\\/g, '/');

		const _asset = assets[unixAssetName];

		const _assetFile = {};

		for (let prop in _asset) {
			_assetFile[prop] = path.basename(_asset[prop]);
		}

		return {
			_asset: _asset,
			_assetFile: _assetFile,
			_root: root
		};
	}))
	.pipe(pug({
		basedir: './src/components'
	}))
	.pipe(gulp.dest(op.dist))
);


gulp.task('watch', ['clean', 'pug'], () => gulp.watch(op.src + '**/*.pug', ['pug']));
