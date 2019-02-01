'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $resource, lincResourceFactory, materialLineService,
        organizationService, lincUtil, $state) {
        $scope.pageSize = 10;

        $scope.materialLineSearch = {};

        getMaterialLine({});
        function getMaterialLine(param) {
            $scope.loading = true;
            materialLineService.searchMaterialLine(param).then(function (response) {
                $scope.MaterialLines = response;
                $scope.loadContent(1);
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup(error);
            });
        }

        $scope.searchMaterialLine = function () {
            var searchParam = angular.copy($scope.materialLineSearch);

            getMaterialLine(searchParam);
        }

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchMaterialLine();
            }
            $event.preventDefault();
        };

        $scope.loadContent = function (currentPage) {
            $scope.materialLineView = $scope.MaterialLines.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.MaterialLines.length ? $scope.MaterialLines.length : currentPage * $scope.pageSize);
        };
        $scope.editMaterialLine = function (materialLine) {
            $state.go('wms.material-manage.edit', { materialLineId: materialLine.id });
        }
        $scope.getReceiptList = function (receiptInput) {
            getReceipts(receiptInput);
        }
        $scope.getOrderList = function (orderInput) {
            getOrders(orderInput);
        }
        function getReceipts(receiptInput) {
            var param = { scenario: 'Auto Complete' };
            if (receiptInput) {
                param["receiptId"] = receiptInput;
            }
            receiptService.searchReceipt(param).then(function (response) {
                $scope.receiptLists = _.map(response, 'id');
            }, function (error) {
                lincUtil.errorPopup("Error:" + error.data.error);
            });
        }
        function getOrders(orderInput) {
            var param = { scenario: 'Auto Complete' };
            if (orderInput) {
                param["orderId"] = orderInput;
            }
            orderService.searchOrder(param).then(function (orders) {
                $scope.OrderLists = _.map(orders, 'id');
            }, function (err) {
                lincUtil.errorPopup("Error:" + err.data.error);
            });

        }
    };
    controller.$inject = ['$scope', '$resource', 'lincResourceFactory',
        'materialLineService', 'organizationService', 'lincUtil', '$state'];
    return controller;
});
