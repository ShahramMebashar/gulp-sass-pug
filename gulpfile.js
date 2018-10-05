var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    plumber = require('gulp-plumber'),
    cssUrlVersion = require('gulp-css-urlversion'),
    uglify = require('gulp-uglify'),
    pug = require('gulp-pug'),
    pugBeautify = require('gulp-pug-beautify'),
    browserSync = require('browser-sync').create(),
    sourceMaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    htmlToPug = require('gulp-html2pug'),
    notify = require('gulp-notify'),
    gutil = require('gulp-util'),
    pugI18n = require('gulp-i18n-pug');

//TODO: make a seperate folder for each local language
//FIXME: fix build folder for each local
const options = {
  browserSync:{
    server: {
        baseDir: ['./build'],
        serveStaticOptions: {
          extentions: ['html']
        }
      },
      open: false,
      //logLevel: 'debug'
  },
  autoprefixer: {
      browsers: ['last 4 versions', ' > 0.2%', 'ie 10'],
      grid: true
  },
  pug: {
    pretty: true,
    client: false,
    i18n: {
      dest: './build',
      locales: './locales/*.*',
      localeExtension: true
    }
  }
}
function errorHandler(error) {
  console.log(error.toString())
  console.log('test')
  this.emit('end');
}

gulp.task('serve', ['sass', 'html', 'js'], function () {
    browserSync.init(options.browserSync);
    gulp.watch(['*/**/*.scss', './**/*.sass'], ['sass']);
    gulp.watch(['./src/templates/**/*.pug', './locales/*.*'], ['html']);
    gulp.watch('./src/assets/js/*.js', ['js'])
    gulp.watch(['./build/**/*.html']).on('change', browserSync.reload)
});

gulp.task('sass', function () {
    gulp.src(['./src/assets/scss/**/*.scss'])
        .pipe(sourceMaps.init())

        .pipe(plumber({ errorHandler: function (err) {
          notify.onError({
              title: "Gulp error in " + err.plugin,
              message:  err.toString()
          })(err);
          gutil.beep();
        }}))
        .pipe(sass())
        //.pipe(cssUrlVersion({baseDir:'./build'}))
        .pipe(autoprefixer(options.autoprefixer))
        .pipe(cssnano())
        .pipe(sourceMaps.write())
        .pipe(gulp.dest('./build/css'))
        .pipe(browserSync.stream());
});

gulp.task('html', function () {
    gulp.src(['./src/templates/**/*.pug'])
        .pipe(plumber({ errorHandler: function (err) {
          notify.onError({
              title: "Gulp error in " + err.plugin,
              message:  err.toString()
          })(err);
          gutil.beep()
        }}))
      //  .pipe(pug())
        .pipe(pugI18n(options.pug))
        .pipe(gulp.dest(options.pug.i18n.dest))
        .pipe(browserSync.stream());
});

gulp.task('js', function () {
   return gulp.src('./src/assets/js/*.js')
              .on('error', errorHandler)
              .pipe(sourceMaps.init())
              .pipe(uglify())
              .pipe(concat('bundle.min.js'))
              .pipe(sourceMaps.write('.'))
              .pipe(gulp.dest('./build/js'))
              .pipe(browserSync.stream())
});

//FIXME: copy all of assets to build folder
gulp.task('assets', function () {
    gulp.src('./src/assets/images/**/*.{gif,jpg,png,svg}')
        .pipe(gulp.dest('./build/images'));
    gulp.src('./src/*.{htaccess,png,txt,ico,xml,json,webmanifest}')
        .pipe(gulp.dest('./build'));
    gulp.src('./src/assets/js/vendor/*.js')
        .pipe(gulp.dest('./build/js/vendor'));    
})

gulp.task('default', ['serve', 'assets']);


