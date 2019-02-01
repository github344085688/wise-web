'use strict';

define([
    'angular',
    './movementTaskListController',
    './movementTaskViewController',
    './editTaskController'
], function(angular, movementTaskListController, movementTaskViewController, editTaskController) {
    angular.module('linc.wms.task.movement-task', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.movementTask.list', {
                url: '/list',
                views: {
                    "unis-main@wms.task.movementTask.list": {
                        templateUrl: 'wms/task/movement-task/template/movementTaskList.html',
                        controller: 'MovementTaskListController'
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    title: "Movement Task",
                    permissions: "task::movementTask_read"
                }
            })
            .state('wms.task.movementTask.view', {
                url: '/view/:taskId',
                views: {
                    "unis-main@wms.task.movementTask.view": {
                        templateUrl: 'wms/task/movement-task/template/movementTaskView.html',
                        controller: 'MovementTaskViewController'
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    title: "WISE-Task",
                    permissions: "task::movementTask_read"
                }
            })
                .state('wms.task.movementTask.edit', {
                url: '/edit/:taskId',
                views: {
                    "unis-main@wms.task.movementTask.edit": {
                        templateUrl: 'wms/task/movement-task/template/editTask.html',
                        controller: 'movement_EditTaskController'
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    title: "WISE-Task",
                    permissions: "task::movementTask_write"
                }
            });
        }])
        .controller('MovementTaskListController', movementTaskListController)
        .controller('MovementTaskViewController', movementTaskViewController)
        .controller('movement_EditTaskController', editTaskController);
});
