'use strict';

var shim = {
    'slimscroll': ['jquery'],
    'jquery.ui': ['jquery'],
    'popover': ['jquery'],
    'bootstrap.hover.dropdown': ['jquery', 'angular'],
    'angular': {deps: ['jquery'], 'exports' : 'angular'},
    'angularCookies': ['angular'],
    'angularRoute': ['angular'],
    'angularMocks': {
        deps:['angular'],
        'exports':'angular.mock'
    },
    'angularResource': ['angular'],
    'angularUIRouter': ['angular'],
    'angularAnimate': ['angular'],
    'angularAria': ['angular'],
    'angularMessages': ['angular'],
    'angularMaterial': ['angularAnimate', 'angularAria', 'angularMessages'],
    'angularValidation': ['angular'],
    'angularValidationRule': ['angularValidation'],
    'angularSanitize': ['angular'],
    'angularMoment': ['angular', 'moment'],
    'angularCalendar': ['angular', 'moment', 'interact'],
    'uiSelect': ['angularSanitize'],
    'ngFx': ['angularAnimate'],
    'ngTagsInput': ['angular'],
    'ngSortable': ['angular'],
    'dndLists': ['angular'],
    'angularGrowl': ['angular'],
    'uiBootstrap': ['angular', 'angularAnimate']
};

var allTestFiles = [];
var TEST_REGEXP = /(.*_spec)\.js$/i;
var HTML_REGEXP = /.*\.html\.js$/i;
for (var file in window.__karma__.files) {
    if (TEST_REGEXP.test(file)) allTestFiles.push(file);
    if (HTML_REGEXP.test(file)) shim[file.replace("/base/","").replace(".js","")] = {deps: ['angular']};
}


require.config({
    paths: {
        jquery: 'node_modules/jquery/dist/jquery',
        async:'node_modules/requirejs-async/async',
        lodash: 'node_modules/lodash/lodash',
        moment: 'node_modules/moment/moment',
        slimscroll: 'node_modules/jquery-slimscroll/jquery.slimscroll',
        blockui: 'node_modules/block-ui/jquery.blockUI',
        'jquery.ui': 'src/vendor/jquery-ui',
        'popover': 'node_modules/jquery-popover/dist/jquery-popover-0.0.3',
        bootstrap: 'src/bootstrap',
        'bootstrap.hover.dropdown': 'node_modules/bootstrap-hover-dropdown/bootstrap-hover-dropdown',
        framework: 'src/vendor/framework',
        layout: 'src/vendor/layout',
        quickSideBar: 'src/vendor/quick-sidebar',
        text: 'node_modules/requirejs-text/text',
        angular: 'node_modules/angular/angular',
        angularRoute: 'node_modules/angular-route/angular-route',
        angularCookies: 'node_modules/angular-cookies/angular-cookies',
        angularResource: 'node_modules/angular-resource/angular-resource',
        angularUIRouter: 'node_modules/@uirouter/angularjs/release/angular-ui-router',
        angularMocks: 'node_modules/angular-mocks/angular-mocks',
        angularAnimate: 'node_modules/angular-animate/angular-animate',
        angularAria: 'node_modules/angular-aria/angular-aria',
        angularMessages: 'node_modules/angular-messages/angular-messages',
        angularMaterial: 'node_modules/angular-material/angular-material',
        chart: 'node_modules/chart.js/Chart',
        angularChart: 'node_modules/angular-chart.js/dist/angular-chart',
        angularValidation: 'node_modules/angular-validation/dist/angular-validation',
        angularValidationRule: 'src/vendor/angular-validation-rule',
        angularSanitize: 'node_modules/angular-sanitize/angular-sanitize',
        angularMoment: 'node_modules/angular-moment/angular-moment',
        interact: 'node_modules/interact.js/interact',
        angularCalendar: 'node_modules/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls',
        uiSelect: 'node_modules/ui-select/dist/select',
        ngFx: 'node_modules/ng-fx/dist/ng-fx',
        ngTagsInput: 'node_modules/ng-tags-input/build/ng-tags-input',
        angularGrowl: 'src/vendor/angular-growl',
        timePicker: 'src/vendor/bootstrap-datetimepicker',
        ngSortable: 'node_modules/ng-sortable/dist/ng-sortable',
        dndLists: 'node_modules/angular-drag-and-drop-lists/angular-drag-and-drop-lists',
        uiBoostrap: 'src/vendor/ui-bootstrap'
    },
    shim: shim,

    priority: [
        "angular"
    ],

    deps: allTestFiles,
    baseUrl: '/base',
    callback: window.__karma__.start
});