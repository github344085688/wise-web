'use strict';

define([
    'angular',
    './loadTaskListController',
    './editLoadTaskController',
    './loadTaskViewController',
    './parcelLoadTaskListController',
    './parcelLoadTaskViewController',
], function (angular, loadTaskListController, editLoadTaskController,
             loadTaskViewController, parcelLoadTaskListController, parcelLoadTaskViewController) {
    angular.module('linc.wms.task.load-task', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('wms.task.loadTask.general', {
                url: '/general',
                template: '<ui-view></ui-view>',
                data:{
                    title:"General Load Task"
                }
            })
            .state('wms.task.loadTask.parcel', {
                url: '/parcel',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Parcel Load Task"
                }
            })
            .state('wms.task.loadTask.general.list', {
                url: '/list',
                templateUrl: 'wms/task/load-task/template/loadTaskList.html',
                controller: "LoadTaskListController",
                data: {
                    permissions: "task::generalLoadTask_read"
                }
            }).state('wms.task.loadTask.general.edit', {
                url: '/:taskId',
                templateUrl: 'wms/task/load-task/template/editLoadTask.html',
                controller: "EditLoadTaskController",
                data: {
                    title: "WISE-Task",
                    permissions: "task::generalLoadTask_write"
                }
            }).state('wms.task.loadTask.general.view', {
                url: '/:taskId/view',
                templateUrl: 'wms/task/load-task/template/loadTaskView.html',
                controller: "LoadTaskViewController",
                data: {
                    title: "WISE-Task",
                    permissions: "task::generalLoadTask_read"
                }
            }).state('wms.task.loadTask.parcel.list', {
                url: '/list',
                templateUrl: 'wms/task/load-task/template/parcelLoadTaskList.html',
                controller: "ParcelLoadTaskListController",
                data: {
                    permissions: "task::parcelLoadTask_read"
                }
            }).state('wms.task.loadTask.parcel.view', {
                url: '/:taskId/view',
                templateUrl: 'wms/task/load-task/template/parcelLoadTaskView.html',
                controller: "ParcelLoadTaskViewController",
                data: {
                    permissions: "task::parcelLoadTask_read"
                }
            });
        }])
        .controller('LoadTaskListController', loadTaskListController)
        .controller('EditLoadTaskController', editLoadTaskController)
        .controller('LoadTaskViewController', loadTaskViewController)
        .controller('ParcelLoadTaskListController', parcelLoadTaskListController)
        .controller('ParcelLoadTaskViewController', parcelLoadTaskViewController)
});
