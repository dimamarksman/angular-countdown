(function (require, process) {

  var gulp = require('gulp');
  var concat = require('gulp-concat');
  var inject = require('gulp-inject');
  var templateCache = require('gulp-angular-templatecache');
  var del = require('del');
  var replace = require('gulp-replace');
  var gulpIf = require('gulp-if');
  var combine = require('stream-combiner2').obj;
  var rev = require('gulp-rev');
  var revReplace = require('gulp-rev-replace');
  var sourcemaps = require('gulp-sourcemaps');
  var runSequence = require('run-sequence');
  var dist = 'dist';

  /*-------------------------------*/

  gulp.task('clean', function (cb) {
    del([dist], cb);
  });

  gulp.task('scripts', function () {
    var src = isProduction ? paths.scripts.app.prod :
      isDemo ? paths.scripts.app.demo :
      isDevelopment ? paths.scripts.app.dev :
      paths.scripts.app.dev;

    return gulp.src(src)
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
      .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      .pipe(gulpIf(
        isDevelopment || isDemo || isProduction,
        combine(
          uglify(),
          concat('app.js'),
          rev()
        )
      ))
      .pipe(gulpIf(isDevelopment, sourcemaps.write()))
      .pipe(gulp.dest(dist + '/scripts'))
      .pipe(gulpIf(
        isDevelopment || isDemo || isProduction,
        combine(
          rev.manifest('scripts.json'),
          gulp.dest('manifest')
        )
      ));
  });

  gulp.task('templates', function () {
    return gulp.src(paths.templates.app)
      .pipe(htmlmin({
        collapseWhitespace: true
      }))
      .pipe(templateCache('templates.js', {
        module: 'common',
        standalone: false,
        root: 'app/'
      }))
      .pipe(gulpIf(
        isDevelopment || isDemo || isProduction,
        combine(
          rev()
        )
      ))
      .pipe(gulp.dest(dist + '/scripts'))
      .pipe(gulpIf(
        isDevelopment || isDemo || isProduction,
        combine(
          rev.manifest('templates.json'),
          gulp.dest('manifest')
        )
      ));
  });

  gulp.task('styles', function () {
    return gulp.src(paths.styles.app)
      .pipe(gulpIf(isDevelopment, sourcemaps.init()))
      .pipe(gulpIf(
        isDevelopment || isDemo || isProduction,
        combine(
          minifyCss(),
          concat('all.css'),
          rev()
        )
      ))
      .pipe(gulpIf(isDevelopment, sourcemaps.write()))
      .pipe(gulp.dest(dist + '/styles'))
      .pipe(gulpIf(
        isDevelopment || isDemo || isProduction,
        combine(
          rev.manifest('styles.json'),
          gulp.dest('manifest')
        )
      ));
  });

  gulp.task('build', function (cb) {
    runSequence(
      'clean', 
	  ['scripts', 'templates', 'styles'],
      cb);
  });

  gulp.task('default', ['build']);

})(require, process);