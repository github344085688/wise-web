'use strict';

define([
    'angular',
    'src/company-facility/company/company-management/companyManagement'
], function(angular) {
        angular.module('linc.cf.company', ['linc.cf.company.company-management'
        ]).config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.company.company-management', {
                    url: '/companyManagement',
                    template: '<ui-view></ui-view>'
                });
        }]);
});
