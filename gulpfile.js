'use strict';

const gulp = require('gulp');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const postcss = require('gulp-postcss');
const replace = require('gulp-replace');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
const sync = require('browser-sync');
const imagemin = require('gulp-imagemin');

let destination = 'dist';

sass.compiler = require('node-sass');

gulp.task('sass', function () {
    return gulp.src('./src/styles/index.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(`./${destination}/styles`));
});


// HTML

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(htmlmin({
            removeComments: true,
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(`${destination}`))
        .pipe(sync.stream());
});

// IMG Compress

gulp.task('image-compress', function() {
    return gulp.src(['src/images/**/*', 'src/images/*'])
        .pipe(imagemin())
        .pipe(gulp.dest(`${destination}/images`));
});

// Styles

gulp.task('styles', function() {
    return gulp.src(`${destination}/styles/index.css`)
        .pipe(postcss([
            require('postcss-import'),
            require('postcss-media-minmax'),
            require('autoprefixer'),
            require('postcss-csso')
        ]))
        .pipe(replace(/\.\.\/\.\.\//g, '\.\.\/'))
        .pipe(gulp.dest(`${destination}/styles`))
        .pipe(sync.stream());
});

// Scripts

gulp.task('scripts', function() {
    return gulp.src('src/scripts/index.js')
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(terser())
        .pipe(gulp.dest(`${destination}/scripts`))
        .pipe(sync.stream());
});

// Copy Fonts

gulp.task('copy-fonts', function() {
    return gulp.src('src/fonts/*', {
            base: 'src'
        })
        .pipe(gulp.dest(`${destination}`))
        .pipe(sync.stream({
            once: true
        }));
});

// Copy Images

gulp.task('copy-images', function() {
    return gulp.src([
            'src/images/*',
            'src/images/**/*'
        ], {
            base: 'src'
        })
        .pipe(gulp.dest(`${destination}`))
        .pipe(sync.stream({
            once: true
        }));
});

// Paths

gulp.task('paths', function() {
    return gulp.src(`${destination}/*.html`)
        .pipe(replace(
            /(<link rel="stylesheet" href=")styles\/(index.css">)/, '$1$2' //заменяет строку на конкатенацию первой и второй скобок
        ))
        .pipe(replace(
            /(<script src=")scripts\/(index.js">)/, '$1$2'
        ))
        .pipe(gulp.dest(`${destination}`));
});

// Server

gulp.task('server', function() {
    sync.init({
        ui: false,
        notify: false,
        server: {
            baseDir: `${destination}`
        }
    });
});

// Watch

gulp.task('watch', function() {
    gulp.watch('src/*.html', gulp.series('html'));
    gulp.watch(['src/styles/*.scss', 'src/styles/**/*.scss'], gulp.series('sass', 'styles'));
    gulp.watch('src/scripts/*.js', gulp.series('scripts'));
    gulp.watch('src/fonts/*', gulp.series('copy-fonts'));
    gulp.watch(['src/images/**/*', 'src/images/*'], gulp.series('copy-images'));
});

// Default

gulp.task('default', gulp.series(
    'sass',
    gulp.parallel(
        'html',
        'styles',
        'scripts',
        'copy-fonts',
        'copy-images'
    ),
    // 'paths',
    gulp.parallel(
        'watch',
        'server'
    )
));

// Build

gulp.task('build', gulp.series(
    'sass',
    gulp.parallel(
        'html',
        'styles',
        'scripts',
        'copy-fonts',
        'image-compress'
    )
));