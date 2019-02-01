'use strict';

define([
    'angular',
    './orderPlanListController',
    './addOrderPlanController',
    './orderPlanViewController',
    './orderSelectPageController',
    './orderPlanHelp',
    './topOrderItemsController'
], function(angular, orderPlanListController, addOrderPlanController, orderPlanViewController,
            orderSelectPageController, orderPlanHelp, topOrderItemsController) {

    angular.module('linc.wms.outbound.order-plan', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider
                .state('wms.outbound.order-plan.list', {
                    url: '/list',
                    views: {
                        "unis-main@wms.outbound.order-plan.list": {
                            templateUrl: 'wms/outbound/order-plan/template/orderPlanList.html',
                            controller: 'OrderPlanListController'
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
                        permissions: "outbound::orderPlan_read"
                    }
                })
                .state('wms.outbound.order-plan.add', {
                    url: '/add',
                    views: {
                        "unis-main@wms.outbound.order-plan.add": {
                            templateUrl: 'wms/outbound/order-plan/template/addOrderPlan.html',
                            controller: 'AddOrderPlanController'
                        },
                        "@":{
                            template:""
                        },
                        "unis@": {
                            templateUrl: 'common/template/unis-main.html',
                            controller: 'DefaultMainPageController'
                        }
                    },
                    resolve: {
                        'isAddAction' : function(){
                            return true;
                        }
                    },
                    data: {
                        permissions: "outbound::orderPlan_write"
                    }
                })
                .state('wms.outbound.order-plan.edit', {
                    url: '/edit/:orderPlanId',
                    views: {
                        "unis-main@wms.outbound.order-plan.edit": {
                            templateUrl: 'wms/outbound/order-plan/template/addOrderPlan.html',
                            controller: 'AddOrderPlanController'
                        },
                        "@":{
                            template:""
                        },
                        "unis@": {
                            templateUrl: 'common/template/unis-main.html',
                            controller: 'DefaultMainPageController'
                        }
                    },
                    resolve: {
                        'isAddAction' : function(){
                            return false;
                        }
                    },
                    data: {
                        permissions: "outbound::orderPlan_write"
                    }
                })
                .state('wms.outbound.order-plan.order-select', {
                    url: '/order-select',
                    views: {
                        "unis-main@wms.outbound.order-plan.order-select": {
                            templateUrl: 'wms/outbound/order-plan/template/orderSelect.html',
                            controller: 'orderPlan.orderSelectPageController'
                        },
                        "@":{
                            template:""
                        },
                        "unis@": {
                            templateUrl: 'common/template/unis-main.html',
                            controller: 'DefaultMainPageController'
                        }
                    },
                    params: { fromState: null, fromStateParam:null},
                    data: {
                        permissions: "outbound::orderPlan_write"
                    }
                })
                .state('wms.outbound.order-plan.view', {
                    url: '/view/:orderPlanId',
                    views: {
                        "unis-main@wms.outbound.order-plan.view": {
                            templateUrl: 'wms/outbound/order-plan/template/orderPlanView.html',
                            controller: 'OrderPlanViewController'
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
                        permissions: "outbound::orderPlan_read"
                    }
                })
                .state('wms.outbound.order-plan.top', {
                    url: '/top',
                    views: {
                        "unis-main@wms.outbound.order-plan.top": {
                            templateUrl: 'wms/outbound/order-plan/template/topOrderItems.html',
                            controller: 'TopOrderItemsController'
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
                        permissions: "outbound::orderPlan_write"
                    }
                });
        }])
        .controller('OrderPlanListController', orderPlanListController)
        .controller('AddOrderPlanController', addOrderPlanController)
        .controller('OrderPlanViewController', orderPlanViewController)
        .controller('TopOrderItemsController', topOrderItemsController)
        .controller('orderPlan.orderSelectPageController', orderSelectPageController)
        .factory('orderPlanHelp', orderPlanHelp);
});

