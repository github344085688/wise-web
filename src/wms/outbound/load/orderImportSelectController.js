'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, loadsService, $mdDialog, param,loadOrderSelectService,addressService,lincResourceFactory) {
        $scope.param = param;

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.checkOrderItemIds = [];

        $scope.checkOrderItem = function (order) {
            if (_.indexOf($scope.checkOrderItemIds, order.id) > -1) {
                _.remove($scope.checkOrderItemIds, function (orderItemId) {

                    return order.id == orderItemId;
                })
            } else {
                $scope.checkOrderItemIds.push(order.id);
            }
        }

        $scope.isChecked = function (order) {
            return _.indexOf($scope.checkOrderItemIds, order.id) > -1;
        }

        $scope.submit = function () {
            var selectOrders = [];
            if ($scope.checkOrderItemIds.length > 0) {
                _.forEach($scope.checkOrderItemIds, function (id) {
                    selectOrders.push($scope.orderMatchWithId[id]);
                });
            }

            var data = {};
            data.orderLines = selectOrders;
            data.longHaulNo = $scope.param.longHaulNo;
            data.longHaulId = $scope.param.longHaulId;

            $mdDialog.hide(data);
        }

        $scope.getStatusList = function(name) {
            return lincResourceFactory.getOrderStatus(name).then(function (response) {
                $scope.statusList = response;
            });
        };

        $scope.getAddressInfo = function (addressObject) {
            return addressService.generageAddressData(addressObject, null);
        };

        $scope.selectLongHaul = function (longHaul) {
            $scope.param.longHaulNo = longHaul.longHaulNo;
        }

        $scope.search = function () {
            $scope.orderCompleted = true;
            $scope.orderLinesView = [];
            loadsService.buildLoadOrderSearch($scope.param).then(function (response) {
                if (response.orders !== null && response.orders.length > 0) {
                    $scope.orderLinesView = response.orders;
                    $scope.orderMatchWithId = _.keyBy(response.orders, 'id');
                }
                $scope.orderCompleted = false;
            });
        }

        $scope.search();

    };

    controller.$inject = ['$scope', 'loadsService', '$mdDialog', 'param','loadOrderSelectService','addressService','lincResourceFactory'];
    return controller;
});
