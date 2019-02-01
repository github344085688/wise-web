'use strict';

define([
    'angular',
    'src/company-facility/facility/facility-management/facilityManagement',
    'src/company-facility/facility/window-checkin/main',
    'src/company-facility/facility/resource/main',
    'src/company-facility/facility/appointment/main'
], function(angular) {
        angular.module('linc.cf.facility', ['linc.cf.facility.facility-management', 'linc.cf.facility.window-checkin',
            'linc.cf.facility.resource', 'linc.cf.facility.appointment'
        ]).config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.facility.facility-management', {
                    url: '/facilityManagement',
                    template: '<ui-view></ui-view>'
                }).state('cf.facility.windowCheckin', {
                    url: '/window',
                    template: '<ui-view></ui-view>'
                })
                .state('cf.facility.resource', {
                    url: '/resource',
                    template: '<ui-view></ui-view>'
                })
                .state('cf.facility.appointment', {
                    url: '/appointment',
                    template: '<ui-view></ui-view>'
                });
        }]);
});
