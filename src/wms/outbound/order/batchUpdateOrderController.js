'use strict';

define([
    'angular',
    'lodash',
    'moment',
    './selectShipController'
], function (angular, _, moment, selectShipController) {
    var controller = function ($scope, lincResourceFactory, orderService, lincUtil, carrierService, $mdDialog, $state, $stateParams) {

        $scope.shipmentTrackingTypes = ['LP Level', 'Order Level'];
        $scope.order = {};

        init();
        var defaultShippingMethods = ['Truckload', 'LTL', 'Small Parcel', 'Will Call'];
        $scope.switchStatuses = [{name:'Yes',dbName:true},{name:'No',dbName:false}];
        function init() {
            if (!$stateParams.orderIds) {
                $state.go('wms.outbound.order.list',{ searchInfo: $stateParams.searchInfo });
            };
            $scope.orderIds = $stateParams.orderIds ? $stateParams.orderIds.toString() : "";
        }

        $scope.carrierChange = function (carrier) {
            cancelInfoAboutCarrier();
            if (carrier && carrier.id) {
                setInfoByCarrierId(carrier.id);
            }
        };

        function cancelInfoAboutCarrier() {
            $scope.order.shipMethod = null;
            $scope.order.deliveryService = null;
            $scope.carrierServiceTypes = [];
            $scope.carrierShipMethods = [];
        }

        function setInfoByCarrierId(carrierId) {
            carrierService.getCarrierByOrgId(carrierId).then(function (carrier) {
                $scope.carrierServiceTypes = carrier.serviceTypes;
                $scope.carrierShipMethods = _.isEmpty(carrier.shippingMethods) ? defaultShippingMethods : carrier.shippingMethods;
                if (carrier.defaultShippingMethod) {
                    $scope.order.shipMethod = carrier.defaultShippingMethod;
                }
            });
        }


        $scope.submit = function (form) {
            var order = angular.copy($scope.order);
            _.forEach(order, function (value, key) {
                if (!value && typeof value !== 'boolean') {
                    delete order[key];
                }
            });
            var batchOrders = [];
            _.forEach($stateParams.orderIds, function (orderId) {
                batchOrders.push({
                    orderId: orderId,
                    update: order
                });
            });
            $scope.isBatchUpdating = true;
            orderService.batchUpdateOrder(batchOrders).then(function () {
                $scope.isBatchUpdating = false;
                lincUtil.updateSuccessfulPopup(function(){
                    $state.go('wms.outbound.order.list',{ searchInfo: $stateParams.searchInfo });
                });
            }, function (error) {
                $scope.isBatchUpdating = false;
                lincUtil.processErrorResponse(error)
            });;
        };

        $scope.cancel = function (form) {
            $state.go('wms.outbound.order.list',{ searchInfo: $stateParams.searchInfo });
        };

        $scope.getFreightTermList = function (name) {
            return lincResourceFactory.getFreightTermList(name).then(function (response) {
                $scope.freightTermList = response;
            });
        };
        $scope.getStatusList = function (name) {
            return lincResourceFactory.getOrderStatus(name).then(function (response) {
                $scope.statusList = response;
            });
        };

        $scope.selectShip = function (title) {
            var form = {
                templateUrl: 'wms/outbound/order/template/selectShip.html',
                locals: {
                    title: title
                },
                autoWrap: true,
                controller: selectShipController
            };
            $mdDialog.show(form).then(function (param) {
                changeShip(param.data, param.title);
            });
        };

        function changeShip(data, title) {
            var value;
            if (title === "Ship From")
                value = data.shipFromName;
            else if (title === "Ship To")
                value = data.shipToName;
            else if (title === "Bill To")
                value = data.shipFromName;
            value += "\r\n" + data.address;
            value += "\r\n" + data.city + "," + data.state + "," + data.zipcode;

            if (title === "Ship From")
                $scope.order.shipFrom = value;
            else if (title === "Ship To")
                $scope.order.shipTo = value;
            else if (title === "Bill To")
                $scope.order.billTo = value;
        }


    };

    controller.$inject = ['$scope', 'lincResourceFactory', 'orderService', 'lincUtil', 'carrierService', '$mdDialog', '$state', '$stateParams'];
    return controller;
});