'use strict';

define([
    'angular',
    'src/wms/task/qc-task/qcTaskListController',
    'src/wms/task/qc-task/editQcTaskController',
    'src/wms/task/qc-task/qcTaskViewController'
], function (angular, qcTaskListController, editQcTaskController,qcTaskViewController) {
    angular.module('linc.wms.task.qc-task', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('wms.task.qcTask.list', {
                url: '/list',
                views: {
                    "unis-main@wms.task.qcTask.list": {
                        templateUrl: 'wms/task/qc-task/template/qcTaskList.html',
                        controller: 'QcTaskListCtrl'
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
                    permissions: "task::qcTask_read"
                }
            }).state('wms.task.qcTask.add', {
                url: '/add',
                views: {
                    "unis-main@wms.task.qcTask.add": {
                        templateUrl: 'wms/task/qc-task/template/editQcTask.html',
                        controller: 'EditQcTaskCtrl'
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                resolve: {
                    'isAddAction': function () {
                        return true;
                    }
                },
                data: {
                    permissions: "task::qcTask_write"
                }
            }).state('wms.task.qcTask.edit', {
                url: '/edit/:id',
                views: {
                    "unis-main@wms.task.qcTask.edit": {
                        templateUrl: 'wms/task/qc-task/template/editQcTask.html',
                        controller: 'EditQcTaskCtrl'
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
         
                resolve: {
                    'isAddAction': function () {
                        return false;
                    }
                },
                data: {
                    permissions: "task::qcTask_write"
                }
            }).state('wms.task.qcTask.view', {
                url: '/view/:taskId',
                views: {
                    "unis-main@wms.task.qcTask.view": {
                        templateUrl: 'wms/task/qc-task/template/qcTaskView.html',
                        controller: 'QcTaskViewCtrl'
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
                    permissions: "task::qcTask_read"
                }
            });
        }])
        .controller("QcTaskListCtrl", qcTaskListController)
        .controller("EditQcTaskCtrl", editQcTaskController)
        .controller("QcTaskViewCtrl", qcTaskViewController);

});
