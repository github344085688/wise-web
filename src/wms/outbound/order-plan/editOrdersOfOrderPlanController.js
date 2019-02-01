'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function($scope, $mdDialog, $state, $stateParams,
                              lincUtil, orderPlanService,
                              lincResourceFactory, orderService, orderPlanHelp) {

        $scope.pageSize = 10;
        $scope.selectOrders = function () {
            orderPlanHelp.setOrderPlan($scope.orderPlan);
            orderPlanHelp.setOrderLines(angular.copy($scope.orders));

            var fromState = "wms.outbound.order-plan.edit-orders";
            $state.go('wms.outbound.order-plan.order-select',
                {fromState: fromState, fromStateParam: $stateParams});
        };

        $scope.loadContent_orders = function (currentPage) {
            $scope.orderView = $scope.orders.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.orders.length ? $scope.orders.length : currentPage * $scope.pageSize);
        };

        $scope.deleteOrder = function(orderId) {
            lincUtil.deleteConfirmPopup('Would you like to remove the this  order?', function() {
                angular.forEach($scope.orders, function(item, key) {
                    if (item.id === orderId)
                    {
                        $scope.orders.splice(key, 1);
                    }
                });
                angular.forEach($scope.orderView, function(item1, key1) {
                    if (item1.id === orderId)
                    {
                        $scope.orderView.splice(key1, 1);
                    }
                });
            });
        };

        function getOrderPlan(orderPlanId) {
            orderPlanService.getOrderPlan(orderPlanId).then(function (orderPlan) {
                $scope.orderPlan = orderPlan;
                getOrdersByIds(orderPlan.orderIds);
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function getOrdersByIds(orderIds) {
            orderService.searchOrder({orderIds: orderIds}).then(function (orders) {
                $scope.loading = false;
                $scope.orders = orders;
                $scope.loadContent_orders(1);
            },function(err){
                $scope.loading = false;
                lincUtil.errorPopup("Error:" + err.data.error);
            });
        }

        $scope.saveOrderPlan = function () {
            var orderPlan = angular.copy($scope.orderPlan);
            orderPlan.orderIds = _.map($scope.orders, "id");
            editOrderPlan(orderPlan);
        };

        function editOrderPlan(orderPlan) {
            $scope.loading = true;
            orderPlanService.updateOrderPlan(orderPlan).then(submitSuccessPopUp, submitFail);
        }

        function submitSuccessPopUp(response) {
            $scope.loading = false;
            lincUtil.updateSuccessfulPopup(function () {
                $state.go('wms.outbound.order-plan.view', {"orderPlanId":$stateParams.orderPlanId});
            });
        }

        function submitFail(error) {
            $scope.loading = false;
            lincUtil.errorPopup('Error! ' + error.data.error);
        }

        $scope.cancel = function () {
            $state.go('wms.outbound.order-plan.view', {"orderPlanId":$stateParams.orderPlanId});
        };

        function initSet() {
            $scope.submitLabel = "Save";
            if(orderPlanHelp.isSelectOrder) {
                $scope.orderPlan = orderPlanHelp.getOrderPlan();
                $scope.orders = orderPlanHelp.getOrderLines();
                $scope.loadContent_orders(1);
            } else {
                orderPlanHelp.setOrderPlan(null);
                orderPlanHelp.setOrderLines([]);
                getOrderPlan($stateParams.orderPlanId);
            }
            orderPlanHelp.isSelectOrder = false;
        }

        initSet();

    };
    controller.$inject = ['$scope', '$mdDialog', '$state', '$stateParams',
        'lincUtil', 'orderPlanService', 'lincResourceFactory',
        'orderService', 'orderPlanHelp'];

    return controller;
});

