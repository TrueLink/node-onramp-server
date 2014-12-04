var gulp = require('gulp');
var ts = require('gulp-typescript');
var rimraf = require('gulp-rimraf');
var runSequence = require('run-sequence');
var sourcemaps = require('gulp-sourcemaps');
var chug = require('gulp-chug');
var path = require("path");

gulp.task('default', function(done) {
    runSequence(
        [
            "build:browser-relay-client",
        ],
        "clean", 
        "compile", 
        done);
});

function build_dep(name) {
    var filepath = path.join("./node_modules", name, "gulpfile.js");
    return gulp.src(filepath).pipe(chug())
}

gulp.task("build:browser-relay-client", function (done) {
    return build_dep("browser-relay-client");
});

gulp.task('clean', function () {
    return gulp.src([
        'lib/**/*.js',
        'lib/**/*.d.ts',
        'lib/**/*.map',
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
        noLib: false,
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
        .pipe(sourcemaps.write('.', {
            includeContent: false, 
            sourceRoot: '/src'
        }))
        .pipe(gulp.dest('lib'))
        ;
});