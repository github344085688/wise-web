'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, orderService, customerId, longHaulId) {

        $scope.checkedOrders = [];
        $scope.pageSize = 10;
        var longHaulNos;
        $scope.cancel = function () {
            $mdDialog.hide();
        };
        $scope.submit = function () {
            $mdDialog.hide($scope.checkedOrders);
        };


        $scope.isChecked = function (order) {
            var isChecked = false;
            _.forEach($scope.checkedOrders, function (item) {
                if (item.id === order.id) {
                    isChecked = true;
                    return;
                }
            });
            return isChecked;

        };

        $scope.checkOrder = function ($event, order) {
            $event.stopPropagation();
            if ($scope.isChecked(order)) {
                _.remove($scope.checkedOrders, function (item) {
                    return item.id == order.id;
                });
            } else {
                $scope.checkedOrders.push(order);
            }
        };

        $scope.toggleAll = function () {
            if (!$scope.orders) return;
            if ($scope.selectAllIsChecked()) {
                $scope.checkedOrders = [];
            } else {
                $scope.checkedOrders = angular.copy($scope.orders);
            }

        };

        $scope.selectAllIsChecked = function () {
            if (!$scope.orders) return;
            if (!$scope.checkedOrders || $scope.checkedOrders.length == 0) return false;
            if ($scope.checkedOrders.length === $scope.orders.length) {
                return true;
            } else {
                return false;
            }
        };

        $scope.searchOrders = function () {
            $scope.loadContent(1);
        };

        $scope.loadContent = function (currentPage) {
            var param = angular.copy($scope.searchInfo);
            $scope.isLoading = true;
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            orderService.searchOrderForOrderPlanning(param).then(function (response) {
                $scope.isLoading = false;
                $scope.orders = response.orders;
                $scope.paging = response.paging;
            }, function (err) {
                $scope.isLoading = false;
                lincUtil.errorPopup("Error:" + err.data.error);
            });

        };

        $scope.statusList = ["Committed", "Partial Committed","Picking","Packed"];


        function init() {
            $scope.searchInfo = { statuses: ["Committed", "Partial Committed"], customerId: customerId, longHaulId: longHaulId };
            $scope.title = "Create Order";

        }
        init();

    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'orderService', 'customerId', 'longHaulId'];
    return controller;
});
