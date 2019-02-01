'use strict';

define([
    'angular',
    'src/wms/task/receive-task/receiveTaskListPageController',
    'src/wms/task/receive-task/receiveTaskViewPageController',
    'src/wms/task/receive-task/editOffloadController',
    'src/wms/task/receive-task/editReceiveTaskController'
], function(angular, receiveTaskListCtrl, receiveTaskViewCtrl,
            editOffloadCtrl, editReceiveTaskCtrl) {
    angular.module('linc.wms.task.receive-task', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.receiveTask.list', {
                url: '/list',
                templateUrl: 'wms/task/receive-task/template/receiveTaskList.html',
                controller: 'ReceiveTaskListPageController',
                controllerAs: "ctrl",
                data: {
                    title: "Receive Task",
                    permissions: "task::receiveTask_read"
                }
            }).state('wms.task.receiveTask.view', {
                url: '/:taskId',
                templateUrl: 'wms/task/receive-task/template/receiveTask.html',
                controller: 'ReceiveTaskViewPageController',
                controllerAs: "ctrl",
                data: {
                    title: "WISE-Task",
                    permissions: "task::receiveTask_read"
                }
            }).state('wms.task.receiveTask.edit', {
                url: '/edit/:taskId',
                templateUrl: 'wms/task/receive-task/template/editReceiveTask.html',
                controller: 'EditReceiveTaskController',
                data: {
                    title: "WISE-Task",
                    permissions: "task::receiveTask_write"
                }
            })
            .state('wms.task.receiveTask.offloadEdit', {
                url: '/:taskId/offloadEdit',
                templateUrl: 'wms/task/receive-task/template/editOffload.html',
                controller: 'EditOffloadController',
                controllerAs: "ctrl",
                data: {
                    title: "Receive-Task-Offload",
                    permissions: "task::receiveTask_write"
                }
            });
        }])
        .controller("ReceiveTaskListPageController", receiveTaskListCtrl)
        .controller("ReceiveTaskViewPageController", receiveTaskViewCtrl)
        .controller("EditOffloadController", editOffloadCtrl)
        .controller("EditReceiveTaskController", editReceiveTaskCtrl);
});
