/*jshint newcap: false*/
module.exports = function (grunt) {
    'use strict';

    var fs = require('fs');
    var path = require('path');

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
                    'typings/**/*.d.ts'
                    ],
                outDir: 'lib',
                options: {
                    compile: true,
                    comments: true,
                    target: 'es5',
                    module: 'commonjs',
                    sourceMap: true,
                    sourceRoot: '',
                    mapRoot: '',
                    declaration: false
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
