var path = require('path');

module.exports = function(karma) {
  'use strict';

  karma.set({
    basePath: __dirname,

    frameworks: ['jasmine'],

    files: [
      { pattern: 'tests.ts', watched: false }
    ],

    exclude: [],

    preprocessors: {
      'tests.ts': ['coverage', 'webpack', 'sourcemap']
    },

    reporters: ['mocha', 'coverage'],

    coverageReporter: {
      dir: 'coverage/',
      subdir: '.',
      reporters: [
        { type: 'text-summary' },
        { type: 'json' },
        { type: 'html' }
      ]
    },

    browsers: ['Chrome'],

    port: 9018,
    runnerPort: 9101,
    colors: true,
    logLevel: karma.LOG_INFO,
    autoWatch: true,
    singleRun: false,

    webpack: {
      devtool: 'inline-source-map',
      resolve: {
        root: __dirname,
        extensions: ['', '.ts', '.js']
      },
      module: {
        loaders: [
          {
            test: /\.ts?$/,
            exclude: /(node_modules)/,
            loader: 'awesome-typescript'
          }
        ],
        postLoaders: [
          {
            test: /\.ts?$/, loader: 'istanbul-instrumenter',
            include: path.resolve(__dirname, 'src'),
            exclude: [
              /\.(e2e|spec)\.ts$/,
              /tests/,
              /node_modules/
            ]
          }
        ]
      }
    }
  });
};
