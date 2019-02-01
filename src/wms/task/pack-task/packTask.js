'use strict';

define([
    'angular',
    './createPackTaskController',
    './packTaskListController',
    './packTaskViewController',
    './batchCreatePackTaskController',
    './parcelPackTaskListController',
    './parcelPackTaskViewController',
], function(angular, createPackTaskController,
            packTaskListController, packTaskViewController,
            batchCreatePackTaskController, parcelPackTaskListController, parcelPackTaskViewController)
{
    angular.module('linc.wms.task.pack-task', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.packTask.general', {
                    url: '/general',
                    template: '<ui-view></ui-view>',
                    data:{
                        title:"General Pack Task"
                    }
                })
                .state('wms.task.packTask.parcel', {
                    url: '/parcel',
                    template: '<ui-view></ui-view>',
                    data:{
                        title:"Parcel Pack Task"
                    }
                })
                .state('wms.task.packTask.general.add', {
                    url: '/add',
                    templateUrl: 'wms/task/pack-task/template/createPackTask.html',
                    controller: 'CreatePackTaskController',
                    params: { orderIds: null },
                    data: {
                        title: "Add General Pack Task",
                        permissions: "task::generalPackTask_write"
                    }
                }).state('wms.task.packTask.general.edit', {
                    url: '/edit/:taskId',
                    templateUrl: 'wms/task/pack-task/template/createPackTask.html',
                    controller: 'CreatePackTaskController',
                    data: {
                        title: "WISE-Task",
                        permissions: "task::generalPackTask_write"
                    }
                })
                .state('wms.task.packTask.general.batchAdd', {
                    url: '/batchAdd',
                    templateUrl: 'wms/task/pack-task/template/batchCreatePackTask.html',
                    controller: 'BatchCreatePackTaskController',
                    params: { batchTaskOrderIds: null },
                    data: {
                        title: "Batch Create Pack Task",
                        permissions: "task::generalPackTask_write"
                    }
                })
                .state('wms.task.packTask.general.list', {
                    url: '/list',
                    templateUrl: 'wms/task/pack-task/template/packTaskList.html',
                    controller: 'PackTaskListController',
                    data: {
                        title: "General Pack Task",
                        permissions: "task::generalPackTask_read"
                    }
                })
                .state('wms.task.packTask.general.view', {
                    url: '/:taskId/view',
                    templateUrl: 'wms/task/pack-task/template/packTaskView.html',
                    controller: 'PackTaskViewController',
                    data: {
                        title: "WISE-Task",
                        permissions: "task::generalPackTask_read"
                    }
                })
                .state('wms.task.packTask.parcel.list', {
                    url: '/list',
                    templateUrl: 'wms/task/pack-task/template/parcelPackTaskList.html',
                    controller: 'ParcelPackTaskListController',
                    data: {
                        title: "Parcel Pack Task",
                        permissions: "task::parcelPackTask_read"
                    }
                })
                .state('wms.task.packTask.parcel.view', {
                    url: '/:taskId/view',
                    templateUrl: 'wms/task/pack-task/template/parcelPackTaskView.html',
                    controller: 'ParcelPackTaskViewController',
                    data: {
                        title: "WISE-Task",
                        permissions: "task::parcelPackTask_read"
                    }
                });
        }])
        .controller('CreatePackTaskController', createPackTaskController)
        .controller('PackTaskListController', packTaskListController)
        .controller('PackTaskViewController', packTaskViewController)
        .controller('BatchCreatePackTaskController', batchCreatePackTaskController)
        .controller('ParcelPackTaskListController', parcelPackTaskListController)
        .controller('ParcelPackTaskViewController', parcelPackTaskViewController)
});
