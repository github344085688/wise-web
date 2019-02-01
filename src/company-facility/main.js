'use strict';

define([
    'angular',
    'src/company-facility/company/main',
    'src/company-facility/facility/main'
], function(angular) {
    angular.module('linc.cf.main', ['linc.cf.company', 'linc.cf.facility'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.company', {
                    url: '/company',
                    template: '<ui-view></ui-view>'
                })
                .state('cf.facility', {
                    url: '/facility',
                    template: '<ui-view></ui-view>'
                });
        }]);
});
