'use strict';

define([
    'angular',
    'src/dashboard/monitor/monitor'
], function (angular) {
    angular.module('linc.dashboard.main', ['linc.dashboard.monitor'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('dashboard.monitor', {
                    url: '/monitor',
                    template: '<ui-view></ui-view>'
                })
        }]);
});
