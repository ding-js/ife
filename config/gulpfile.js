const path = require('path');

const gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	data = require('gulp-data'),
	pug = require('gulp-pug');

const del = require('del');

const op = require('./index.js');

gulp.task('clean', () => {
	del.sync(path.join(op.src, '**'));
});

gulp.task('pug', () =>
	gulp.src(path.join(op.src, '**/index.pug'))
	.pipe(plumber())
	.pipe(data())
	.pipe(pug())
	.pipe(gulp.dest(op.dist))
)
