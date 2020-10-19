/**
 * @author Jordan Pinski
 * @summary Builds SCSS and JS and distributes both to their respective
 * directories in dist/
 * 
 * 02/08/2019
 */

/*************************
 * imports
 ************************/
const { src, dest, series, task, watch } = require('gulp');
const babel = require('gulp-babel');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const copy = require('gulp-copy');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const browsersync = require('browser-sync');
const log = require('fancy-log');

const { names, paths } = require('./gulpconfig');

/*************************
 * scss
 ************************/
task('scss', scss);

function scss() {
  return src(paths.src.scss)
    .pipe(sass({
      includePaths: ['node_modules']
    }).on('error', sass.logError))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(dest(paths.dest.scss));
}


/*************************
 * js
 ************************/
task('js', js);

function js() {
  return src(paths.src.js)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat(names.dest.js))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('/'))
    .pipe(dest(paths.dest.js));
}

task('dist-js', distJs);

function distJs() {
  return src(paths.src.js)
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat(names.dest.js))
    .pipe(rename({ extname: '.min.js' }))
    .pipe(dest(paths.dest.js));
}

/*************************
 * fonts
 ************************/
task('fonts', fonts);

function fonts() {
  log('Copying fonts from src/fonts to dist/fonts')
  return src(paths.src.fonts + '*')
  .pipe(dest(paths.dest.fonts));
}

task('copy-fonts', copy_fonts);

function copy_fonts() {
  log('Copying fonts from node_modules..');
  return src(
    [paths.node_modules + '/@fortawesome/fontawesome-free/webfonts/*']
    )
    .pipe(copy(paths.src.fonts, { prefix: 4 }))
    .pipe(dest(paths.src.fonts));
}

/*************************
 * watch
 ************************/
task('watch-browsersync', watch_browsersync);

function watch_browsersync() {
  browsersync.init({
    server: './dist/'
  });

  // Watchers
  watch(paths.src.scss, scss);
  watch(paths.src.js, js);
  watch('./dist').on('change', browsersync.reload);
  watch('./src').on('change', browsersync.reload);
}

// Exports
exports.scss = scss;
exports.js = js;
exports.fonts = fonts;
exports.copyFonts = copy_fonts;
exports.default = series(scss, js, series(copy_fonts, fonts));
exports.dist = series(scss, distJs);