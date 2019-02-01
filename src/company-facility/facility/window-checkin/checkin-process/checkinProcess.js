'use strict';

define([
    'angular',
    './checkinProcessController',
    './carrierInfoController',
    './activityController',
    './tasksController',
    './transloadTaskController'
], function(angular, controller, carrierInfoController, activityController, tasksController, transloadTaskController) {
    angular.module('linc.cf.facility.window-checkin.checkin-process', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.facility.windowCheckin.checkinProcess.carrierInfo', {
                    url: '/:entryId/carrier-info',
                    templateUrl: 'company-facility/facility/window-checkin/checkin-process/template/carrierInfo.html',
                    controller: 'CarrierInfoController',
                    data: {
                        permissions: "facility::checkinEntry_write"
                    }
                })
                .state('cf.facility.windowCheckin.checkinProcess.activity', {
                    url: '/:entryId/activity',
                    templateUrl: 'company-facility/facility/window-checkin/checkin-process/template/activity.html',
                    controller: 'ActivityController',
                    data: {
                        permissions: "facility::checkinEntry_write"
                    }
                })
                .state('cf.facility.windowCheckin.checkinProcess.tasks', {
                    url: '/:entryId/tasks',
                    templateUrl: 'company-facility/facility/window-checkin/checkin-process/template/tasks.html',
                    controller: 'TasksController',
                    data: {
                        permissions: "facility::checkinEntry_write"
                    }
                })
                .state('cf.facility.windowCheckin.checkinProcess.transloadTask', {
                    url: '/:entryId/transload-task',
                    templateUrl: 'company-facility/facility/window-checkin/checkin-process/template/transloadTask.html',
                    controller: 'TransloadTaskController',
                    data: {
                        permissions: "facility::checkinEntry_write"
                    }
                });
        }])
        .controller('CheckinProcessController', controller)
        .controller('CarrierInfoController', carrierInfoController)
        .controller('ActivityController', activityController)
        .controller('TasksController', tasksController)
        .controller('TransloadTaskController', transloadTaskController);
});
