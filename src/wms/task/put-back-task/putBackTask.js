'use strict';

define([
    'angular',
    './putBackTaskListController',
    './editPutBackTaskController',
    './putBackTaskViewController',
    './putBackHistoryListController'
], function (angular, putBackTaskListController, editPutBackTaskController, putBackTaskViewController, putBackHistoryListController) {
    angular.module('linc.wms.task.put-back-task', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('wms.task.putBackTask.list', {
                url: '/list',
                templateUrl: 'wms/task/put-back-task/template/putBackTaskList.html',
                controller: "PutBackTaskListController",
                data: {
                    permissions: "task::putBackTask_read"
                }
            }).state('wms.task.putBackTask.historySearch', {
                url: '/history-search',
                views: {
                    "unis-main@wms.task.putBackTask.historySearch": {
                        templateUrl: 'wms/task/put-back-task/template/putBackHistoryList.html',
                        controller: "PutBackHistoryListController"
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    title: "WISE-Task",
                    permissions: "task::putBackTask_read"
                }
            }).state('wms.task.putBackTask.edit', {
                url: '/:taskId',
                templateUrl: 'wms/task/put-back-task/template/editPutBackTask.html',
                controller: "EditPutBackTaskController",
                data: {
                    title: "WISE-Task",
                    permissions: "task::putBackTask_write"
                }
            }).state('wms.task.putBackTask.view', {
                url: '/:taskId/view',
                templateUrl: 'wms/task/put-back-task/template/putBackTaskView.html',
                controller: "PutBackTaskViewController",
                data: {
                    title: "WISE-Task",
                    permissions: "task::putBackTask_read"
                }
            });
        }])
        .controller('PutBackTaskListController', putBackTaskListController)
        .controller('EditPutBackTaskController', editPutBackTaskController)
        .controller('PutBackTaskViewController', putBackTaskViewController)
        .controller('PutBackHistoryListController', putBackHistoryListController)
});
