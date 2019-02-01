/* global module */
"use strict";

module.exports = function(config){
  config.set({

    basePath : '',

    frameworks: ['jasmine','requirejs'],

    files : [
        'node_modules/requirejs/require.js',
        'test/test-require.js',
        {pattern:'node_modules/angular/angular.js', included:false},
        {pattern:'node_modules/requirejs-async/async.js', included:false},
        {pattern:'node_modules/lodash/lodash.js', included:false},
        {pattern:'node_modules/moment/moment.js', included:false},
        {pattern:'node_modules/jquery-slimscroll/jquery.slimscroll.js',  included:false},
        {pattern:'node_modules/block-ui/jquery.blockUI.js',  included:false},
        {pattern:'node_modules/jquery-popover/dist/jquery-popover-0.0.3.js',  included:false},
        {pattern:'node_modules/bootstrap-hover-dropdown/bootstrap-hover-dropdown.js',  included:false},
        {pattern:'node_modules/requirejs-text/text.js',  included:false},
        {pattern:'node_modules/angular-route/angular-route.js',  included:false},
        {pattern:'node_modules/angular-cookies/angular-cookies.js',  included:false},
        {pattern:'node_modules/angular-resource/angular-resource.js',  included:false},
        {pattern:'node_modules/@uirouter/angularjs/release/angular-ui-router.js',  included:false},
        {pattern:'node_modules/angular-mocks/angular-mocks.js',  included:false},
        {pattern:'node_modules/angular-animate/angular-animate.js',  included:false},
        {pattern:'node_modules/angular-aria/angular-aria.js', included:false},
        {pattern:'node_modules/angular-messages/angular-messages.js', included:false},
        {pattern:'node_modules/angular-material/angular-material.js', included:false},
        {pattern:'node_modules/chart.js/Chart.js', included:false},
        {pattern:'node_modules/angular-chart.js/dist/angular-chart.js',  included:false},
        {pattern:'node_modules/angular-validation/dist/angular-validation.js', included:false},
        {pattern:'node_modules/angular-sanitize/angular-sanitize.js', included:false},
        {pattern:'node_modules/angular-moment/angular-moment.js', included:false},
        {pattern:'node_modules/interact.js/interact.js', included:false},
        {pattern:'node_modules/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.js',  included:false},
        {pattern:'node_modules/ui-select/dist/select.js',  included:false},
        {pattern:'node_modules/ng-fx/dist/ng-fx.js', included:false},
        {pattern:'node_modules/ng-tags-input/build/ng-tags-input.js',  included:false},
        {pattern:'node_modules/ng-sortable/dist/ng-sortable.js',  included:false},
        {pattern:'node_modules/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',  included:false},
        {pattern:'node_modules/jquery/dist/jquery.js',  included:false},
        {pattern: 'src/**/*.js', included: false},
        {pattern: 'src/*.js', included:false},
        {pattern: 'test/src/*_spec.js', included:false},
        {pattern: 'src/**/*.html', included:false}

    ],

      exclude : [
          'src/require-config.js',
          'src/app.js',
          'src/bootstrap.js',
          'src/index.html'
      ],

    autoWatch : true,

    preprocessors: {
        'src/**/*.html': ['ng-html2js']
    },

     ngHtml2JsPreprocessor: {
          // strip this from the file path
         stripPrefix: 'src/',
         cacheIdFromPath: function(filepath) {
             var cacheId = filepath.replace('src/', '');
             return cacheId;
         }
     },

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-requirejs',
            'karma-junit-reporter',
            'karma-ng-html2js-preprocessor'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
