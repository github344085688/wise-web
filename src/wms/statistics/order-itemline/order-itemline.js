'use strict';

define([
    'angular',
    './orderItemlineStatisticsController',
    './itemlineByOrderController',
    './itemByVelocityController',
    '../pick-task-statistics/pickTaskStatisticsController',
    '../task-statistics/taskStatisticsController'
], function(angular, orderItemlineStatisticsController, itemlineByOrderController,itemByVelocityController, pickTaskStatisticsController, taskStatisticsController) {
    angular.module('linc.wms.statistics.order-itemline', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.statistics.order-itemline', {
                    url: '/order-itemline',
                    views: {
                        "unis-main@wms.statistics.order-itemline": {
                            templateUrl: 'wms/statistics/order-itemline/template/order-itemline.html',
                            controller: 'OrderItemlineStatisticsController'
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
                        title: "Order Itemline By Item",
                        permissions: "statistics::orderItemLineByItem_read"
                    }
                })
                .state('wms.statistics.itemline-order', {
                    url: '/itemline-order',
                    views: {
                        "unis-main@wms.statistics.itemline-order": {
                            templateUrl: 'wms/statistics/order-itemline/template/itemline-by-order.html',
                            controller: 'ItemlineByOrderController'
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
                        title: "Order Itemline By Order",
                        permissions: "statistics::orderItemLineByOrder_read"
                    }
                })
                .state('wms.statistics.item-velocity', {
                    url: '/item-velocity',
                    views: {
                        "unis-main@wms.statistics.item-velocity": {
                            templateUrl: 'wms/statistics/order-itemline/template/item-by-velocity.html',
                            controller: 'ItemByVelocityController'
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
                        title: "Item Velocity",
                        permissions: "statistics::itemVelocity_read"
                    }
                })
                .state('wms.statistics.pick-task-statistics', {
                    url: '/pick-task-statistics',
                    views: {
                        "unis-main@wms.statistics.pick-task-statistics": {
                            templateUrl: 'wms/statistics/pick-task-statistics/template/pick-task-statistics.html',
                            controller: 'PickTaskStatisticsController'
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
                        title: "Order Itemline Statistics",
                        permissions: "statistics::pickTask_read"
                    }
                })
                .state('wms.statistics.task-statistics', {
                    url: '/task-statistics',
                    views: {
                        "unis-main@wms.statistics.task-statistics": {
                            templateUrl: 'wms/statistics/task-statistics/template/task-statistics.html',
                            controller: 'TaskStatisticsController'
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
                        title: "Order Itemline Statistics",
                        permissions: "statistics::pickTask_read"
                    }
                })
        }])
        .controller('OrderItemlineStatisticsController', orderItemlineStatisticsController)
        .controller('ItemlineByOrderController', itemlineByOrderController)
        .controller('ItemByVelocityController',itemByVelocityController)
        .controller('PickTaskStatisticsController', pickTaskStatisticsController)
        .controller('TaskStatisticsController', taskStatisticsController);
});
