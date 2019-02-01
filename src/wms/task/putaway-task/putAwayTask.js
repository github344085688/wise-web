'use strict';

define([
    'angular',
    './putAwayTaskListController',
    './putAwayTaskViewController',
    './editTaskController'
], function(angular, putAwayTaskListCtrl, putAwayTaskViewCtrl, editTaskController) {
    angular.module('linc.wms.task.putaway-task', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.putAwayTask.list', {
                    url: '/list',
                    templateUrl: 'wms/task/putaway-task/template/putAwayTaskList.html',
                    controller: 'PutAwayTaskListController',
                    data: {
                        title: "Put Away Task",
                        permissions: "task::putAwayTask_read"
                    }
                })
                .state('wms.task.putAwayTask.edit', {
                    url: '/edit/:taskId',
                    templateUrl: 'wms/task/putaway-task/template/editTask.html',
                    controller: "putAway_editTaskController",
                    data: {
                        title: "WISE-Task",
                        permissions: "task::putAwayTask_write"
                    }
                })
                .state('wms.task.putAwayTask.view', {
                    url: '/:taskId',
                    templateUrl: 'wms/task/putaway-task/template/putAwayTaskView.html',
                    controller: 'PutAwayTaskViewController',
                    data: {
                        title: "WISE-Task",
                        permissions: "task::putAwayTask_read"
                    }
                });
        }])
        .controller('PutAwayTaskListController', putAwayTaskListCtrl)
        .controller('PutAwayTaskViewController', putAwayTaskViewCtrl)
        .controller('putAway_editTaskController', editTaskController);
});
