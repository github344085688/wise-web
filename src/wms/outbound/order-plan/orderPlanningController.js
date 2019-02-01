'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var orderPlanningController = function ($scope, pickService, orderService, orderPlanningService, pickTaskFactory,
                                            $state, lincUtil) {
        $scope.freightTermList = ["Collect", "Prepaid", "Third Party"];
        $scope.order = {};
        $scope.orderPlanningBtnLabel = "Make Order Planning";

        $scope.searchOrders = function (searchParam) {
            if (searchParam.confirmedLH) {
                searchParam.longHaulIds = _.map(searchParam.longHaul, 'id');
            }else{
                searchParam.longHaulNos = _.map(searchParam.longHaul, 'longHaulNo');
            }
            getOrders(searchParam);
        };

        function getOrders(param) {
            $scope.checkedOrders = [];
            param.statuses = ["Committed"];
            $scope.isLoading = true;
            orderService.searchOrderForOrderPlanning(param).then(function (response) {
                $scope.isLoading = false;
                $scope.orders = response.orders;
                $scope.itemLineMap = response.orderItemLineMap;
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.errorPopup('Error! ' + error.data.error);
            });
        }

        $scope.orderPlanning = function () {
            if (!$scope.checkedOrders || $scope.checkedOrders.length === 0) {
                lincUtil.messagePopup("Tip", "Please choose only one Order to make order planning.", function () {
                });
            } else {
                var orderIds = _.map($scope.checkedOrders, "id");
                $scope.loading = true;
                orderPlanningService.makeOrderPlanning(orderIds).then(function (response) {
                    $scope.loading = false;
                    if (response.orderPlanningErrors.length === 0 && response.itemLinePlanningErrors.length === 0 && !response.message) {
                        orderPlanningSuccees(orderIds);
                    } else {
                        orderPlanningFail(response);
                    }
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.errorPopup(error.data.error);
                });
            }
        };

        function orderPlanningFail(response) {
            var errors;
            if (response.orderPlanningErrors.length > 0) {
                errors = _.map(response.orderPlanningErrors, "planningError");
                popUpPlanningErrorMessage(errors);
            } else if (response.itemLinePlanningErrors.length > 0) {
                errors = _.map(response.itemLinePlanningErrors, "error");
                popUpPlanningErrorMessage(errors);
            } else if (response.message) {
                lincUtil.errorPopup(response.message);
            }
        }

        function orderPlanningSuccees(orderIds) {
            lincUtil.confirmPopup("Confirm", "Order Planning Successful! Are you go to create pick Task?", function () {
                $state.go('wms.task.pickTask.createPickTask', {
                    orderIds: orderIds
                });
            }, function () {
                getOrders({});
            });

        }

        function popUpPlanningErrorMessage(errors) {
            var str = _.join(errors, '\r\n');
            lincUtil.errorPopup(str);
        }

        $scope.directCreatePickTask = function () {
            if ($scope.checkedOrders && $scope.checkedOrders.length == 1) {
                var orderIds = _.map($scope.checkedOrders, "id");
                $state.go('wms.outbound.order-plan.manual.directCreatePickTask', {
                    orderId: orderIds[0]
                });
            } else {
                lincUtil.messagePopup("Tip", "Please choose only one Order to create pick task.", function () {
                });
            }
        };

        $scope.toggleAll = function() {
            if ($scope.selectAllIsChecked()) {
                $scope.checkedOrders = _.differenceWith($scope.checkedOrders, $scope.orders, function (order1, order2) {
                    return order1.id == order2.id;
                });
            } else {
                $scope.checkedOrders = _.unionWith($scope.checkedOrders, $scope.orders, function (order1,order2) {
                    return  order1.id == order2.id;
                });
            }
        };

        $scope.selectAllIsChecked = function () {
            if(!$scope.checkedOrders || $scope.checkedOrders.length == 0) return false;
            var diffArr = _.differenceWith($scope.checkedOrders, $scope.orders, function (order1, order2) {
                return order1.id == order2.id;
            });
            if(($scope.checkedOrders.length - diffArr.length) == $scope.orders.length) {
                return true;
            }else {
                return false;
            }
        };

        $scope.isChecked = function(order) {
            return _.find($scope.checkedOrders, function (checkedOrder) {
                return checkedOrder.id == order.id;
            });
        };

        $scope.toggle = function(order) {
            var index = _.findIndex($scope.checkedOrders, function(checkedOrder) {
                return checkedOrder.id === order.id;
            });
            if (index > -1) {
                $scope.checkedOrders.splice(index, 1);
            } else {
                $scope.checkedOrders.push(order);
            }
        };

        function _init() {
            $scope.checkedOrders = [];
            getOrders({});
        }

        _init();
    };

    orderPlanningController.$inject = ['$scope', 'pickService', 'orderService', 'orderPlanningService', 'pickTaskFactory',
        '$state', 'lincUtil'];
    return orderPlanningController;
});