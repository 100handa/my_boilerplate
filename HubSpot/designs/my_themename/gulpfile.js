const {src, dest, watch, lastRun} = require('gulp');
const execTime = new Date().getTime();
const sassPartials = '**/_*.scss';
const using = require('gulp-using');
const SRC = {
  sass: '**/[!_]*.scss',
  babel: '**/*.babel.js',
  ignore: ['node_modules/**', sassPartials]
};

/**
 * エラーメッセージを返す
 * @return {string} error message
 */
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const plumberNotify = () => {
  return plumber({errorHandler: notify.onError('<%= error.message %>')});
};

/**
 * Sassのコンパイル
 */
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const cssnano = require('cssnano');
const stylelint = require('stylelint');
const reporter = require('postcss-reporter');

function buildSass(cb, timestamp, target = SRC.sass) {
  const options = {
    ignore: SRC.ignore,
  }
  if (target === SRC.sass) {
    options.since = lastRun(buildSass) || timestamp
  }

  return (
    src(target, options)
      .pipe(using())
      .pipe(plumberNotify())
      .pipe(
        postcss([stylelint(), reporter()], {
          syntax: require('postcss-scss')
        })
      )
      .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(postcss([autoprefixer(), mqpacker(), cssnano()]))
      .pipe(dest('./'))
  );
}


/**
 * JSのトランスパイル
 */
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const eslint = require('gulp-eslint')
const uglify = require('gulp-uglify')

function execBabel(cb, timestamp) {
  const options = {
    ignore: SRC.ignore,
    since: lastRun(execBabel) || timestamp
  }

  return (
    src(SRC.babel, options)
      .pipe(using())
      .pipe(plumberNotify())
      .pipe(eslint({useEslintrc: true}))
      .pipe(eslint.format())
      .pipe(eslint.failOnError())
      .pipe(babel({
        presets: ['@babel/env']
      }))
      .pipe(uglify())
      .pipe(rename(function (path) {
        path.basename = path.basename.replace('.babel', '');
        path.extname = ".js";
      }))
      .pipe(dest('./'))
  )
}

exports.sass = buildSass;
exports.babel = execBabel;

exports.default = function () {
  watch([sassPartials], cb => {
    buildSass(null, execTime, '**/main.scss');
    cb();
  });
  watch([SRC.sass], cb => {
    buildSass(null, execTime);
    cb();
  });
  watch([SRC.babel], cb => {
    execBabel(null, execTime);
    cb();
  });
};
