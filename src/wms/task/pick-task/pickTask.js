'use strict';
define([
    'angular',
    './addPickTaskController',
    './pickTaskListController',
    './pickTaskViewController',
    './pickTaskByOrderSeparateController',
    './pickTaskByItemSeparateController',
    './mergeTaskController',
    'src/print-pages/printShippingLabelController',
    'src/print-pages/prePrintShippingLabelController',
    './pickTaskFactories',
], function(angular, addPickTaskController,
            pickTaskListController,
            pickTaskViewController, pickTaskByOrderSeparateController,
            pickTaskByItemSeparateController, mergeTaskController,printShippingLabelController,prePrintShippingLabelController) {
    angular.module('linc.wms.task.pick-task', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.pickTask.edit', {
                url: '/edit/:taskId',
                templateUrl: 'wms/task/pick-task/template/addPickTask.html',
                controller: 'AddPickTaskController',
                resolve: {
                    'isAddAction' : function(){
                        return false;
                    }
                },
                data: {
                    title: "WISE-Task",
                    permissions: "task::pickTask_write"
                }
            })
            .state('wms.task.pickTask.list', {
                url: '/list',
                templateUrl: 'wms/task/pick-task/template/pickTaskList.html',
                controller: 'PickTaskListController',
                data: {
                    title: "Pick Task",
                    permissions: "task::pickTask_read"
                }
            })
            .state('wms.task.pickTask.printShippingLabel', {
                url: '/printShippingLabel/:taskId',
                views: {
                    "unis-main@wms.task.pickTask.printShippingLabel": {
                        templateUrl: './print-pages/template/printShippingLabel.html',
                        controller: 'PrintShippingLabelController',
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
                    permissions: "task::pickTask_write"
                }
            })
            .state('wms.task.pickTask.prePrintShippingLabel', {
                url: '/prePrintShippingLabel/:taskId',
                views: {
                    "unis-main@wms.task.pickTask.prePrintShippingLabel": {
                        templateUrl: './print-pages/template/prePrintShippingLabel.html',
                        controller: 'PrePrintShippingLabelController',
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
                    permissions: "task::pickTask_write"
                }
            })
            .state('wms.task.pickTask.view', {
                url: '/:taskId',
                templateUrl: 'wms/task/pick-task/template/pickTaskView.html',
                controller: 'PickTaskViewController',
                data: {
                    title: "WISE-Task",
                    permissions: "task::pickTask_read"
                }
            })
            .state('wms.task.pickTask.by-order-separate', {
                url: '/by-order-separate/:taskId',
                templateUrl: 'wms/task/pick-task/template/pickTaskByOrderSeparate.html',
                controller: 'PickTaskByOrderSeparateController',
                data: {
                    title: "WISE-Task",
                    permissions: "task::pickTask_write"
                }
            })
            .state('wms.task.pickTask.by-item-separate', {
                url: '/by-item-seperate/:taskId',
                templateUrl: 'wms/task/pick-task/template/pickTaskByItemSeparate.html',
                controller: 'PickTaskByItemSeparateController',
                data: {
                    title: "WISE-Task",
                    permissions: "task::pickTask_write"
                }
            })
            .state('wms.task.pickTask.merge', {
                url: '/merge/:taskId',
                templateUrl: 'wms/task/pick-task/template/mergeTask.html',
                controller: 'MergeTaskController',
                data: {
                    title: "WISE-Task",
                    permissions: "task::pickTask_write"
                }
            });
        }])
        .controller('AddPickTaskController', addPickTaskController)
        .controller('PickTaskListController', pickTaskListController)
        .controller('PickTaskViewController', pickTaskViewController)
        .controller('PickTaskByOrderSeparateController', pickTaskByOrderSeparateController)
        .controller('PickTaskByItemSeparateController', pickTaskByItemSeparateController)
        .controller('MergeTaskController', mergeTaskController)
        .controller('PrePrintShippingLabelController', prePrintShippingLabelController)
        .controller('PrintShippingLabelController', printShippingLabelController);
});
