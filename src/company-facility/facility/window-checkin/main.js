'use strict';

define([
    'angular',
    'src/company-facility/facility/window-checkin/checkin-process/checkinProcess',
    'src/company-facility/facility/window-checkin/entry/entry'
], function(angular) {
        angular.module('linc.cf.facility.window-checkin', ['linc.cf.facility.window-checkin.checkin-process',
            'linc.cf.facility.window-checkin.entry'
        ]).config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.facility.windowCheckin.checkinProcess', {
                url: '/checkin/:entryId',
                templateUrl: 'company-facility/facility/window-checkin/checkin-process/template/checkinProcess.html',
                controller: 'CheckinProcessController',
            }).state('cf.facility.windowCheckin.entry', {
                url: '/entry',
                templateUrl: 'company-facility/facility/window-checkin/entry/template/entry.html'
            });
        }]);
});
