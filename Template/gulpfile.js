'use strict';

let gulp = require('gulp'),
    sass = require('gulp-sass'),
    pug = require('gulp-pug'),
    terser = require('gulp-terser'),
    notify = require( 'gulp-notify' ),
    concat = require('gulp-concat'),
    order = require("gulp-order"),
    autoprefixer = require("gulp-autoprefixer"),
    svgmin = require('gulp-svgmin'),
    replace = require('gulp-replace'),
    rename = require('gulp-rename'),
    del = require('del'),
    stringReplace = require('gulp-string-replace'),
    header = require('gulp-header'),
    cheerio = require('gulp-cheerio'),
    svgSprite = require("gulp-svg-sprite"),
    browserSync = require('browser-sync');

//----------------------------------------------------
//------ MAIN
//----------------------------------------------------

gulp.task('browser-sync', function(){
    browserSync.init({
        server: "build"
    });
});

//----------------------------------------------------
//------ PUG
//----------------------------------------------------

gulp.task('pug', function buildHTML() {
    return gulp.src('dev/*.pug')
        .pipe(pug({pretty: true})
        .on( 'error', notify.onError(
            {
                message: "<%= error.message %>",
                title  : "Pug Error!"
            })
        ))
        .pipe(gulp.dest('build/'))
        // .pipe( notify( 'PUG - Created <%= file.relative %>' ) )
        .pipe(browserSync.reload({stream: true}))
});

//----------------------------------------------------
//------ SASS
//----------------------------------------------------

gulp.task('sass', function(){
    return gulp.src('dev/assets/sass/*.{sass,scss}')
        .pipe(sass({outputStyle: 'expanded'})
            .on( 'error', notify.onError(
            {
                message: "<%= error.message %>",
                title  : "Sass Error!"
            })
        ))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest('build/assets/css'))
        .pipe( notify( 'SASS - Created <%= file.relative %>' ) )
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('css-plugins', function() {
    return gulp.src('dev/assets/plugins/**/*.css')
        .pipe(order([
            'normalize.css',
            'all.css',
            'bootstrap/bootstrap-grid.css',
            'fancybox/jquery.fancybox.min.css',
            'swiper/swiper.min.css',
            '*.css',
        ]))
        .pipe(concat('libs.min.css'))
        .pipe(gulp.dest('build/assets/css'))
        .pipe(browserSync.reload({stream: true}))
});

//----------------------------------------------------
//------ FONTS
//----------------------------------------------------

gulp.task('fonts', function() {
    return gulp.src(['dev/assets/webfonts/**/*'])
        .pipe(gulp.dest('build/assets/webfonts'))
        .pipe(browserSync.reload({stream: true}))
});

//----------------------------------------------------
//------ JS
//----------------------------------------------------

gulp.task('js', function() {
    return gulp.src(['dev/assets/js/**/*.js'])
        .pipe(gulp.dest('build/assets/js'))
        .pipe(terser())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('build/assets/js'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('js-plugins', function() {
    return gulp.src(['dev/assets/plugins/**/*.js'])
        .pipe(order([
            'jquery.min.js',
            'bootstrap/bootstrap.min.js',
            'fancybox/jquery.fancybox.js',
            'swiper/swiper.min.js',
            '*.js',
        ]))
        .pipe(concat('libs.min.js'))
        .pipe(terser())
        .pipe(gulp.dest('build/assets/js'))
        .pipe(browserSync.reload({stream: true}))
});

//----------------------------------------------------
//------ SVG AND IMAGES
//----------------------------------------------------

gulp.task('svg-sprites', function() {
    return gulp.src('dev/assets/img/icons/**/*_s.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
		.pipe(cheerio({
			run: function ($) {
				$('[fill]').removeAttr('fill');
				$('[stroke]').removeAttr('stroke');
				$('[style]').removeAttr('style');
			},
			parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg",
                }
            },
        }))
        .pipe(gulp.dest('build/assets/img/icons'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('svg', function() {
    return gulp.src(['dev/assets/img/icons/**/*.svg','!dev/assets/img/icons/**/*_s.svg'])
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(gulp.dest('build/assets/img/icons'))
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('img', function() {
    return gulp.src('dev/assets/img/**/*.{png,jpg}')
        .pipe(gulp.dest('build/assets/img'))
        .pipe(browserSync.reload({stream: true}))
});



//----------------------------------------------------
//------ BUILD AND WATCH
//----------------------------------------------------

gulp.task('watch', function(){
    gulp.watch('dev/assets/sass/**/*.{sass,scss}', gulp.parallel('sass'));
    gulp.watch('dev/**/*.pug', gulp.parallel('pug'));
    gulp.watch('dev/assets/js/**/*.js', gulp.parallel('js'));
    gulp.watch('dev/assets/plugins/**/*.js', gulp.parallel('js-plugins'));
    gulp.watch('dev/assets/plugins/**/*.css', gulp.parallel('css-plugins'));
    gulp.watch('dev/assets/img/**/*.{png,jpg}', gulp.parallel('img'));
    gulp.watch('dev/assets/img/**/*.svg', gulp.parallel('svg-sprites'));
    gulp.watch('dev/assets/img/**/*.svg', gulp.parallel('svg'));
    gulp.watch('dev/assets/webfonts/**/*', gulp.parallel('fonts'));
});

gulp.task('clean', function() {
    return del('build', {force:true});
});

gulp.task('build', gulp.series('clean', 'pug', 'sass', 'css-plugins', 'fonts', 'js', 'js-plugins', 'svg-sprites', 'svg', 'img'));

gulp.task('default', gulp.parallel('browser-sync','watch'))

