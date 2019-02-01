'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var orderSelectPageController = function ($scope, $state, $stateParams, lincUtil,
        orderService, orderPlanHelp, addressService) {
        $scope.pageObj = {pageSize:5, currentPage: 1};
        var checkedOrders = [];
        var selectedOrders = [];
        var longHaulNos;
        var searchInfo = {};
        $scope.order = {};
        $scope.add = function () {
            orderPlanHelp.longHaulNos = longHaulNos;
            orderPlanHelp.isSelectOrder = true;
            orderPlanHelp.setOrderLines(selectedOrders.concat(angular.copy(checkedOrders)));
            goBackEditOrderPlan();
        };

        function goBackEditOrderPlan() {
            $state.go($stateParams.fromState, $stateParams.fromStateParam);
        }

        $scope.cancel = function () {
            orderPlanHelp.isSelectOrder = true;
            goBackEditOrderPlan();
        };

        $scope.searchOrders = function (searchParam) {
            searchInfo = searchParam;
            $scope.loadContent(1);
        };

        function generateShipToAddressStr(orders) {
            angular.forEach(orders, function (order) {
                order.shipToAddressStr = addressService.generageAddressData(order.shipToAddress, null);
            });
        }

        $scope.loadContent = function (currentPage) {
            var param = angular.copy(searchInfo);

            if (param.confirmedLH) {
                param.longHaulIds = _.map(param.longHaul, 'id');
            }else{
                param.longHaulNos = _.map(param.longHaul, 'longHaulNo');
            }

            longHaulNos = _.map(param.longHaul, 'longHaulNo');
            $scope.isLoading = true;
            if (!param.statuses || param.statuses.length === 0) {
                param.statuses = ["Committed", "Partial Committed"];
            }
            if (selectedOrders.length > 0 ) {
                param.excludeOrderIds = _.map(selectedOrders, "id")
            }
            $scope.pageObj.currentPage = currentPage;
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize) };
            orderService.searchOrderForOrderPlanning(param).then(function (response) {
                $scope.isLoading = false;
                $scope.itemLineMap = response.orderItemLineMap;
                $scope.orders = response.orders;
                generateShipToAddressStr($scope.orders);
                $scope.orders = _.sortBy($scope.orders, ['longHualNo', 'shipToAddressStr']);
                $scope.paging = response.paging;

            }, function (err) {
                $scope.isLoading = false;
                lincUtil.errorPopup("Error:" + err.data.error);
            });

        };

        $scope.getItemName = function (itemSpecId) {
            if (itemSpecId && $scope.itemMap[itemSpecId])
                return $scope.itemMap[itemSpecId].name;
            return "";
        };

        $scope.toggleAll = function () {
            if (!$scope.orders) return;
            if ($scope.selectAllIsChecked()) {
                checkedOrders = [];
            } else {
                checkedOrders = angular.copy($scope.orders);
            }
            $scope.totalSelectWeight = orderService.calcOrderWeights(checkedOrders);
        };

        $scope.selectAllIsChecked = function () {
            if (!$scope.orders) return;
            if (!checkedOrders || checkedOrders.length == 0) return false;
            if (checkedOrders.length === $scope.orders.length) {
                return true;
            } else {
                return false;
            }
        };

        $scope.isChecked = function (order) {
            var index = _.findIndex(checkedOrders, function (checkedOrder) {
                return checkedOrder.id == order.id;
            });
            return index > -1;
        };

        $scope.toggle = function ($event, order) {
            $event.stopPropagation();
            var index = _.findIndex(checkedOrders, function (checkedOrder) {
                return checkedOrder.id === order.id;
            });
            if (index > -1) {
                checkedOrders.splice(index, 1);
            } else {
                checkedOrders.push(order);
            }
            $scope.totalSelectWeight = orderService.calcOrderWeights(checkedOrders);
        };

        $scope.showItemLine = function (order) {
            order.showItemLine = true;
        };

        $scope.hideItemLine = function (order) {
            order.showItemLine = false;
        };

        function _init() {
            // getOrders({});
            selectedOrders = angular.copy(orderPlanHelp.getOrderLines());
            if(!selectedOrders) {
                selectedOrders = [];
            }
            if (!checkedOrders) {
                checkedOrders = [];
            }
            $scope.loadContent(1);
           
        }

        _init();
    }

    orderSelectPageController.$inject = ['$scope', '$state', '$stateParams', 'lincUtil',
        'orderService', 'orderPlanHelp', 'addressService'];

    return orderSelectPageController;
});
