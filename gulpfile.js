(function (require, process) {

  let gulp = require('gulp');
  let concat = require('gulp-concat');
  let templateCache = require('gulp-angular-templatecache');
  let del = require('del');
  let runSequence = require('run-sequence');
  let eslint = require('gulp-eslint');
  let es = require('event-stream');
  let dist = 'release';

  /*-------------------------------*/

  gulp.task('clean', function (cb) {
    del([dist], cb);
  });

  gulp.task('scripts', function () {
    let src = [
      'src/module.js',
      'src/services/countdownService.js',
      'src/components/countdownModel/countdownModel.js',
      'src/**/*.js'
    ];

    return es.merge(gulp.src(src))
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      .pipe(concat('angular-countdown.js'))
      .pipe(gulp.dest(dist));
  });

  gulp.task('templates', function () {
    return es.merge(gulp.src(dist + '/angular-countdown.js'), getTemplatesStream())
      .pipe(concat('angular-countdown.js'))
      .pipe(gulp.dest(dist));
  });

  function getTemplatesStream() {
    let src = ['src/**/*.html'];

    return gulp.src(src)
      .pipe(templateCache('templates.js', {
        module: 'tkdCountdown',
        standalone: false,
        root: 'src/'
      }));
  }

  gulp.task('styles', function () {
    let src = 'src/**/*.css';

    return gulp.src(src)
      .pipe(concat('angular-countdown.css'))
      .pipe(gulp.dest(dist));
  });

  gulp.task('build', function (cb) {
    runSequence(
      'clean', 
      'scripts', 
      ['templates', 'styles'],
      cb);
  });

  gulp.task('default', ['build']);

})(require, process);
