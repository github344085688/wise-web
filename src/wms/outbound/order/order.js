'use strict';

define([
    'angular',
    'src/wms/outbound/order/orderListController',
    'src/wms/outbound/order/addOrderController',
    'src/wms/outbound/order/orderViewController',
    'src/wms/outbound/order/lineLaulMonitorController',
    'src/wms/outbound/order/batchUpdateOrderController'
], function (angular, orderListCtrl, addOrderCtrl, orderViewCtrl, lineLaulMonitorCtrl, batchUpdateOrderCtrl) {
    angular.module('linc.wms.outbound.order', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('wms.outbound.order.list', {
                    url: '/list',
                    templateUrl: 'wms/outbound/order/template/orderList.html',
                    controller: 'OrderListController',
                    params: {
                        searchInfo:null
                    },
                    data: {
                        title: "Order",
                        permissions: "outbound::order_read"
                    }
                })
                .state('wms.outbound.order.add', {
                    url: '/add',
                    templateUrl: 'wms/outbound/order/template/addOrder.html',
                    controller: 'AddOrderController',
                    resolve: {
                        'isAddAction': function () {
                            return true;
                        }
                    },
                    data: {
                        title: "Add Order",
                        permissions: "outbound::order_write"
                    }
                }).state('wms.outbound.order.batchUpdate', {
                    url: '/batch/update',
                    params: {
                        orderIds: null,
                        searchInfo:null
                    },
                    templateUrl: 'wms/outbound/order/template/batchUpdateOrder.html',
                    controller: 'BatchUpdateOrderController',
                    data: {
                        title: "Batch",
                        permissions: "outbound::batchOrderUpdate_write"
                    }
                })
                .state('wms.outbound.order.lineLaul', {
                    url: '/lineLaul/:longHaulNo?fromDate&fromTo',

                    views: {
                        "unis-main@wms.outbound.order.lineLaul": {
                            templateUrl: 'wms/outbound/order/template/lineLaulMonitor.html',
                            controller: 'LineLaulMonitorController',
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
                        title: "Line Laul Monitor",
                        permissions: "outbound::order_write"
                    }
                })
                .state('wms.outbound.order.edit', {
                    url: '/edit/:orderId/:orderTab',
                    templateUrl: 'wms/outbound/order/template/addOrder.html',
                    controller: 'AddOrderController',
                    resolve: {
                        'isAddAction': function () {
                            return false;
                        }
                    },
                    data: {
                        title: "WISE-Order",
                        permissions: "outbound::order_write"
                    }
                })
                .state('wms.outbound.order.view', {
                    url: '/:orderId',
                    templateUrl: 'wms/outbound/order/template/orderView.html',
                    controller: 'OrderViewController',
                    data: {
                        title: "WISE-Order",
                        permissions: "outbound::order_read"
                    }
                });
        }])

        .controller('OrderListController', orderListCtrl)
        .controller('AddOrderController', addOrderCtrl)
        .controller('LineLaulMonitorController', lineLaulMonitorCtrl)
        .controller('OrderViewController', orderViewCtrl)
        .controller('BatchUpdateOrderController', batchUpdateOrderCtrl);
});