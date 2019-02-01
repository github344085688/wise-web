'use strict';

define([
    'angular',
    'src/wms/task/replenishment-task/replenishmentTaskListController',
    'src/wms/task/replenishment-task/replenishmentTaskViewController',
    'src/wms/task/replenishment-task/editTaskController',
    'src/wms/task/replenishment-task/replenishmentHistoryListController'
], function(angular, replenishmentTaskListCtrl, replenishmentTaskViewCtrl, editTaskController, replenishmentHistoryListController) {
    angular.module('linc.wms.task.replenishment-task', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.replenishmentTask.list', {
                url: '/list',
                templateUrl: 'wms/task/replenishment-task/template/replenishmentTaskList.html',
                controller: 'ReplenishmentTaskListController',
                data: {
                    title: "Replenishment Task",
                    permissions: "task::replenishmentTask_read"
                }
            }).state('wms.task.replenishmentTask.view', {
                url: '/view/:taskId',
                templateUrl: 'wms/task/replenishment-task/template/replenishmentTaskView.html',
                controller: 'ReplenishmentTaskViewController',
                data: {
                    title: "WISE-Task",
                    permissions: "task::replenishmentTask_read"
                }
            })
            .state('wms.task.replenishmentTask.edit', {
                url: '/edit/:taskId',
                templateUrl: 'wms/task/replenishment-task/template/editTask.html',
                controller: "Replenishment_editTaskController",
                data: {
                    title: "WISE-Task",
                    permissions: "task::replenishmentTask_write"
                }
            }).state('wms.task.replenishmentTask.historySearch', {
                url: '/history-search',
                views: {
                    "unis-main@wms.task.replenishmentTask.historySearch": {
                        templateUrl: 'wms/task/replenishment-task/template/replenishmentHistoryList.html',
                        controller: "ReplenishmentHistoryListController"
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
                    permissions: "task::replenishmentTask_read"
                }
            });
        }])
        .controller("ReplenishmentTaskListController", replenishmentTaskListCtrl)
        .controller("ReplenishmentTaskViewController", replenishmentTaskViewCtrl)
        .controller("Replenishment_editTaskController", editTaskController)
        .controller("ReplenishmentHistoryListController", replenishmentHistoryListController)
});
