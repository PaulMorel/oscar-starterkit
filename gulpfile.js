'use strict';

// ============================================================================
// Config
// ============================================================================

var config = {
    projectName: 'Oscar Starterkit',
    browserSync: true,
    basePath: {
        src:    'src/assets/',
        assets: 'dev/assets/',
        dev:    'dev/',
        proxy:  'http://192.168.100.100'
    }
};

// ============================================================================
// Load Packages
// ============================================================================

console.time("Loaded Plugins"); // Start Measuring

// General
var gulp = require('gulp'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    request = require('request');

// Styles
var sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    sourcemaps = require('gulp-sourcemaps'),
    cssnano = require('gulp-cssnano'),
    cmq = require('gulp-combine-mq');

// Javascript
var uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

// Images
var imagemin = require('gulp-imagemin');
var svgsprite = require('gulp-svg-sprite');

// Browser Sync
var browserSync = require('browser-sync').create( config.projectName );

console.timeEnd("Loaded Plugins"); // Stop Measuring

// ============================================================================
// Functions
// ============================================================================

function onError(error) {
    console.log(error.stack);
    this.emit('end');
}

// ============================================================================
// Task Configuration
// ============================================================================

// --------------------------------------------------------
// Styles
// --------------------------------------------------------

//
// SASS Compiler, Source Maps, Autoprefixer and Minify
//

function css() {
    return gulp.src(config.basePath.src + 'scss/{,*/}/*.scss')
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 4'],
            cascade: false
        }))
        .pipe(gulp.dest(config.basePath.assets + 'css/'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(cmq({
            beautify: false
        }))
        .pipe(cssnano({
            autoprefixer: false
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.basePath.assets + 'css/'));
}

// --------------------------------------------------------
// Javascript
// --------------------------------------------------------

//
// Concatenation & Uglify Javascript
//

function js() {
    return gulp.src([
            config.basePath.src + 'js/*.js'
        ])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('global.js'))
        .pipe(gulp.dest(config.basePath.assets + 'js/'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest(config.basePath.assets + 'js/'));
}

//
// Concatenation & Uglify Javascript Libraries
//
function libraries() {
    return gulp.src([
            config.basePath.src + 'js/libs/*.js'
        ])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(concat('libs.js'))
        .pipe(gulp.dest(config.basePath.assets + 'js/'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest(config.basePath.assets + 'js/'));
}
libraries.displayName = 'js:libs';

// --------------------------------------------------------
// Images
// --------------------------------------------------------

//
// Image Compression
//


function img() {
    return gulp.src([
            config.basePath.src + 'img/{,*/}*.{png,jpg,gif,svg}',
            '!' + config.basePath.src + 'img/sprites/*', // Negated Folder
        ])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(imagemin({
            optimizationLevel: 4,
            multipass: true
        }))
        .pipe(gulp.dest(config.basePath.assets + 'img/'));
}

//
// SVG Sprites
//
function sprite() {
    return gulp.src(
            config.basePath.src + 'img/sprites/*.svg'
        )
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(svgsprite({
            log: 'info',
            shape: {
                id: {
                    whitespace: '-'
                },
                dimension: {
                    precision: 0,
                    attributes: true
                },
                transform: [{
                    svgo: {
                        plugins : [
                            {transformsWithOnePath: {
                                floatPrecision: 0,
                            }},
                            {collapseGroups: true},
                            {sortAttrs: true},
                            {cleanupIDs: true},
                            {removeTitle: false},
                            {convertPathData: true},
                            {cleanupNumericValues: {
                                floatPrecision: 0,
                            }},
                        ]
                    }
                }]
            },
            svg: {
                xmlDeclaration: false,
                doctypeDeclaration: false,
                precision: 1,
            },
            mode: {
                symbol: {
                    dest: './',
                    bust: false,
                    prefix: '.sprite-%s',
                    sprite: '../img/sprite.svg',
                }
                //css: {
                //    dest: './',
                //    bust: false,
                //    prefix: '.sprite-%s',
                //    sprite: '../img/sprite.svg',
                //    dimensions: true,
                //    render: {
                //        scss: {
                //            dest:  '../scss/_sprite.scss'
                //        }
                //    }
                //}
            }
        }))
        .pipe(gulp.dest(config.basePath.src + 'img/'));
}

// --------------------------------------------------------
// Watch
// --------------------------------------------------------

function watch() {

    if (config.browserSync === true ) {
        browserSync.init({
            files:          [
                '!' + config.basePath.dev + 'site/accounts/',
                config.basePath.dev + 'site/**/*.php',
                config.basePath.dev + 'content/**/*.txt',
                config.basePath.assets + '**/*'
            ],
            injectChanges:  true,
            proxy:          config.basePath.proxy,
            snippetOptions: {
                ignorePaths: [ '/panel', '/panel/**' ]
            }
        });
    } else {
        console.log('Browser Sync Disabled');
    }

    // Watch .scss files
    gulp.watch(config.basePath.src + 'scss/**/*.scss', { usePolling: true }, css);

    // Watch js files
    gulp.watch(config.basePath.src + 'js/*.js', { usePolling: true }, js );
    gulp.watch(config.basePath.src + 'js/libs/*.js', { usePolling: true }, libraries );

    // Images
    gulp.watch(config.basePath.src + 'img/{,*/}*.{png,jpg,gif,svg}', { ignored: config.basePath.src + 'img/sprites/*', usePolling: true }, img );
    gulp.watch(config.basePath.src + 'img/sprites/*.svg', { usePolling: true }, gulp.series(sprite, css) );

   console.log('Watching files...');
}

// ============================================================================
// Task Registration
// ============================================================================

gulp.task(css);
gulp.task('default', gulp.parallel(js, img, gulp.series(sprite, css) ) );
gulp.task(watch);
gulp.task(js);
gulp.task(libraries);
gulp.task(img);
gulp.task(sprite);
