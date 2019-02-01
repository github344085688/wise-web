'use strict';

define([
    'angular',
    './inventoryMovementTaskListController',
    './inventoryMovemenTaskViewController',
    './inventoryMovementHistoryListController'
], function(angular, inventoryMovementTaskListController, inventoryMovemenTaskViewController, inventoryMovementHistoryListController) {
    angular.module('linc.wms.task.inventory-movement-task', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.inventoryMovementTask.list', {
                url: '/list',
                views: {
                    "unis-main@wms.task.inventoryMovementTask.list": {
                        templateUrl: 'wms/task/inventory-movement-task/template/taskList.html',
                        controller: 'InventoryMovementTaskListController'
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
                    title: "Inventory Movement Task",
                    permissions: "task::inventoryMovementTask_read"
                }
            }).state('wms.task.inventoryMovementTask.view', {
                url: '/view/:taskId',
                views: {
                    "unis-main@wms.task.inventoryMovementTask.view": {
                        templateUrl: 'wms/task/inventory-movement-task/template/taskView.html',
                        controller: 'InventoryMovemenTaskViewController'
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
                    title: "Inventory Movement Task",
                    permissions: "task::inventoryMovementTask_read"
                }
            }).state('wms.task.inventoryMovementTask.historySearch', {
                url: '/history-search',
                views: {
                    "unis-main@wms.task.inventoryMovementTask.historySearch": {
                        templateUrl: 'wms/task/inventory-movement-task/template/inventoryMovementHistoryList.html',
                        controller: "InventoryMovementHistoryListController"
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
                    permissions: "task::inventoryMovementTask_read"
                }
            });
        }])
        .controller('InventoryMovementTaskListController', inventoryMovementTaskListController)
        .controller('InventoryMovemenTaskViewController', inventoryMovemenTaskViewController)
        .controller('InventoryMovementHistoryListController', inventoryMovementHistoryListController)
});
