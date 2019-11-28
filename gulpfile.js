var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var autoprefixer = require('gulp-autoprefixer');
var pkg = require('./package.json');

// Set the banner content
var banner = ['/*!\n',
  ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
  ' */\n',
  '\n'
].join('');

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function(cb) {

  // Bootstrap
  gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./public/assets/vendor/bootstrap'))

  // Font Awesome
  gulp.src([
      './node_modules/@fortawesome/**/*',
    ])
    .pipe(gulp.dest('./public/assets/vendor'))

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./public/assets/vendor/jquery'))

  // jQuery Easing
  gulp.src([
      './node_modules/jquery.easing/*.js'
    ])
    .pipe(gulp.dest('./public/assets/vendor/jquery-easing'))

  cb();

});

// Compile SCSS
gulp.task('css:compile', function(cb) {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 2 versions'],
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('./public/assets/css'))
});

// Minify CSS
gulp.task('css:minify', gulp.series(['css:compile']), function() {
  return gulp.src([
      './public/assets/css/*.css',
      '!./public/assets/css/*.min.css'
    ])
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./public/assets/css'));
});

// CSS
gulp.task('css', gulp.series(['css:compile', 'css:minify']));

// Minify JavaScript
gulp.task('js:minify', function() {
  return gulp.src([
      './src/js/*.js'
    ])
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest('./public/assets/js'));
});

// JS
gulp.task('js', gulp.series(['js:minify']));

// Default task
gulp.task('default', gulp.series(['css', 'js', 'vendor']));

// Dev task
gulp.task('dev', gulp.series(['css', 'js']), function() {
  gulp.watch('./src/scss/*.scss', ['css']);
  gulp.watch('./src/js/*.js', ['js']);
});
