'use strict';

define([
    'angular',
    'src/wms/task/configuration-change-task/addTaskController',
    'src/wms/task/configuration-change-task/taskListController',
    'src/wms/task/configuration-change-task/taskViewController',
    './separateController',
    './mergeController',
    './groupTaskController'
], function (angular, addTaskCtrl, taskListCtrl, taskViewCtrl, separateCtrl, mergeCtrl, groupTaskCtrl) {
    angular.module('linc.wms.task.configuration-change-task', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('wms.task.configurationChangeTask.list', {
                    url: '/list',
                    templateUrl: 'wms/task/configuration-change-task/template/taskList.html',
                    controller: 'CC-TaskListController',
                    data: {
                        permissions: "task::configurationChangeTask_read"
                    }
                })
                .state('wms.task.configurationChangeTask.group', {
                    url: '/group',
                    templateUrl: 'wms/task/configuration-change-task/template/groupTask.html',
                    controller: 'CC-groupTaskController',
                    data: {
                        title: "WISE-Task",
                        permissions: "task::configurationChangeTask_write"
                    }
                })
                .state('wms.task.configurationChangeTask.add', {
                    url: '/add',
                    templateUrl: 'wms/task/configuration-change-task/template/addTask.html',
                    controller: 'CC-AddTaskController',
                    resolve: {
                        'isAddAction' : function(){
                            return true;
                        }
                    },
                    data: {
                        title: "Add Configuration Change Task",
                        permissions: "task::configurationChangeTask_write"
                    }
                })
                .state('wms.task.configurationChangeTask.edit', {
                    url: '/edit/:taskId',
                    templateUrl: 'wms/task/configuration-change-task/template/addTask.html',
                    controller: 'CC-AddTaskController',
                    resolve: {
                        'isAddAction' : function(){
                            return false;
                        }
                    },
                    data: {
                        title: "WISE-Task",
                        permissions: "task::configurationChangeTask_write"
                    }
                })
                .state('wms.task.configurationChangeTask.view', {
                    url: '/:taskId',
                    templateUrl: 'wms/task/configuration-change-task/template/taskView.html',
                    controller: 'CC-TaskViewController',
                    data: {
                        title: "WISE-Task",
                        permissions: "task::configurationChangeTask_read"
                    }
                })
                .state('wms.task.configurationChangeTask.separate', {
                    url: '/separate/:taskId',
                    templateUrl: 'wms/task/configuration-change-task/template/separate.html',
                    controller: 'CC-separateController',
                    data: {
                        title: "WISE-Task",
                        permissions: "task::configurationChangeTask_write"
                    }
                })
                .state('wms.task.configurationChangeTask.merge', {
                    url: '/merge/:taskId',
                    templateUrl: 'wms/task/configuration-change-task/template/merge.html',
                    controller: 'CC-mergeTaskController',
                    data: {
                        title: "WISE-Task",
                        permissions: "task::configurationChangeTask_write"
                    }
                });
        }])
        .controller('CC-TaskListController', taskListCtrl)
        .controller('CC-AddTaskController', addTaskCtrl)
        .controller('CC-TaskViewController', taskViewCtrl)
        .controller('CC-separateController', separateCtrl)
        .controller('CC-mergeTaskController', mergeCtrl)
        .controller('CC-groupTaskController', groupTaskCtrl);
});
