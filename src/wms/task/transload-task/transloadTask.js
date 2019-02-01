'use strict';

define([
    'angular',
    'src/wms/task/transload-task/transloadTaskListController',
    'src/wms/task/transload-task/transloadTaskViewController',
    'src/wms/task/transload-task/transloadReceivingController',
    'src/wms/task/transload-task/transloadShippingController',
    'src/wms/task/transload-task/editTaskController',
], function (angular, transloadTaskListCtrl, transloadTaskViewCtrl,
             transloadReceivingCtrl, transloadShippingCtrl, editTaskController) {
    angular.module('linc.wms.task.transload-task', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('wms.task.transloadTask.list', {
                url: '/list',
                templateUrl: 'wms/task/transload-task/template/transloadTaskList.html',
                controller: 'TransloadTaskListController',
                controllerAs: "ctrl",
                data: {
                    title: "Transload Task",
                    permissions: "task::transloadTask_read"
                }
            }).state('wms.task.transloadTask.view', {
                url: '/:taskId',
                templateUrl: 'wms/task/transload-task/template/transloadTaskView.html',
                controller: 'TransloadTaskViewController',
                controllerAs: "ctrl",
                data: {
                    title: "WISE-Task",
                    permissions: "task::transloadTask_read"
                }
            }).state('wms.task.transloadTask.transload', {
                url: '/:taskId/transload?receiptId&dockId',
                views: {
                    "unis-main@wms.task.transloadTask.transload": {
                        templateUrl: 'wms/task/transload-task/template/transloadReceiving.html',
                        controller: 'TransloadReceivingController',
                        controllerAs: "ctrl"
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
                    title: "Transload Task",
                    permissions: "task::transloadTask_read"
                   
                }
            }).state('wms.task.transloadTask.shipping', {
                url: '/:taskId/shipping?loadId&dockId',
                views: {
                    "unis-main@wms.task.transloadTask.shipping": {
                        templateUrl: 'wms/task/transload-task/template/transloadShipping.html',
                        controller: 'TransloadShippingController',
                        controllerAs: "ctrl"
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
                    title: "Transload Task",
                    permissions: "task::transloadTask_read"
            
                }
            }) .state('wms.task.transloadTask.edit', {
                url: '/edit/:taskId',
                views: {
                    "unis-main@wms.task.transloadTask.edit": {
                        templateUrl: 'wms/task/transload-task/template/editTask.html',
                        controller: 'Transload_EditTaskController'
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
                    permissions: "task::transloadTask_write"
                }
            });
        }])
        .controller("TransloadTaskListController", transloadTaskListCtrl)
        .controller("TransloadTaskViewController", transloadTaskViewCtrl)
        .controller("TransloadReceivingController", transloadReceivingCtrl)
        .controller("TransloadShippingController", transloadShippingCtrl)
        .controller("Transload_EditTaskController", editTaskController)
});
