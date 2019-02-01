'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, lincUtil, reportCenterService,addressService) {
        $scope.pageSize = 10;
 
        var searchInfo = {};

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
            } else {
                param.longHaulNos = _.map(param.longHaul, 'longHaulNo');
            }
            $scope.isLoading = true;
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            reportCenterService.deliverConfirmationReport(param).then(function (response) {
                $scope.isLoading = false;
                $scope.orders = response.orders;
                generateShipToAddressStr($scope.orders);
                $scope.paging = response.paging;

            }, function (err) {
                $scope.isLoading = false;
                lincUtil.errorPopup("Error:" + err.data.error);
            });

        };
        function _init() {

            $scope.loadContent(1);

        }

        _init();


    };
    controller.$inject = ['$scope', 'lincUtil', 'reportCenterService','addressService'];
    return controller;
});