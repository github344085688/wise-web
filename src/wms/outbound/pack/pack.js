'use strict';

define([
    'angular',
    './selectOrderToPackTaskController',
    './packOrderDetailController',
    './packOrderController'

], function(angular, selectOrderToPackTaskController,
            packOrderDetailController,
            packOrderController) {
    angular.module('linc.wms.outbound.pack', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider
                .state('wms.outbound.pack.orderToPackTask', {
                    url: '/order-to-pack',
                    templateUrl: 'wms/outbound/pack/template/selectOrderToPackTask.html',
                    controller: 'SelectOrderToPackTaskController',
                    data: {
                        title: "Select Order To Pack",
                        permissions: "outbound::packOrder_read"
                    }
                })
                .state('wms.outbound.pack.packOrderDetail', {
                    url: '/pack-order-detail/:lpParam',
                    templateUrl: 'wms/outbound/pack/template/packOrderDetail.html',

                    controller: 'PackOrderDetailController',
                    data: {
                        permissions: "outbound::packOrder_read"
                    }
                })
                .state('wms.outbound.pack.packOrder', {
                    url: '/pack-order/:lpParam',
                    templateUrl: 'wms/outbound/pack/template/packOrder.html',

                    controller: 'PackOrderController',
                    data: {
                        permissions: "outbound::packOrder_read"
                    }
                });
        }])
        .controller('SelectOrderToPackTaskController', selectOrderToPackTaskController)
        .controller('PackOrderDetailController', packOrderDetailController)
        .controller('PackOrderController', packOrderController);
});
