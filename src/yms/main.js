'use strict';
define([
    'angular',
    'src/yms/entry/entry',
    'src/yms/black-list/blackList',
    'src/yms/report/report'
], function(angular) {
    angular.module('linc.yms.main', ['linc.yms.entry', 'linc.yms.black-list', 'linc.yms.report'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('yms.entry', {
                url: '/entry',
                templateUrl: 'yms/entry/template/entry.html'
            }).state('yms.black-list', {
                url: '/black-list',
                template:'<ui-view></ui-view>'
            }).state('yms.report', {
                url: '/report',
                template:'<ui-view></ui-view>'
            });
        }]);
});
