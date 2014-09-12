var gulp = require('gulp');
var ts = require('gulp-type');
var rimraf = require('gulp-rimraf');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function(done) {
    runSequence(
        "clean", 
        "compile", 
        done);
});

gulp.task('clean', function () {
    return gulp.src([
        'lib/**/*.js',
        'lib/**/*.d.ts',
        ], { read: false })
    .pipe(rimraf({ force: true }));
});

gulp.task('compile', function () {
    var compiler = ts({
        declarationFiles: true,
        noExternalResolve: false,
        module: 'commonjs',
        target: 'ES5',
        noImplicitAny: true, 
        noLib: true, 
        outDir: 'lib',
    });

    var result = gulp
        .src([
            'src/**/*.ts', 
            'typings/**/*.d.ts'
            ])
        .pipe(sourcemaps.init())
        .pipe(compiler)
        ;
    
    result.dts
        .pipe(gulp.dest('lib'))
        ;

    return result.js
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('lib'))
        ;
});