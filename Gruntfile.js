/*jshint newcap: false*/
module.exports = function (grunt) {
    'use strict';

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-ts');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            lib: [
                'lib/**/*'
            ]
        },
        ts: {
            build: {
                src: [
                    'src/**/*.ts',
                    'typings/**/*.d.ts',
                    ],
                outDir: 'lib',
                options: {
                    fast: 'never',
                    compile: true,
                    noImplicitAny: true,
                    comments: true,
                    target: 'es5',
                    module: 'commonjs',
                    sourceMap: true,
                    mapRoot: '',
                    declaration: true,
                    sourceRoot: 'src',
                }
            }
        },
    });

    // setup main aliases
    grunt.registerTask('default', ['build']);

    grunt.registerTask('build', [
        'clean',
        'ts:build',
    ]);
};
