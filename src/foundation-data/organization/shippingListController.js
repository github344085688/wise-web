'use strict';

define([], function () {

    var controller = function ($scope, $state, $stateParams, lincUtil, shippingMapService, $mdDialog, carrierService) {

        $scope.createParam = {};
        $scope.customerId = $stateParams.organizationId;
        function init () {
            shippingMapService.searchShippingMapConfig({ customerId: $scope.customerId }).then(function (response) {
                $scope.shippingMapConfigList = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        init();

        $scope.createShippingMapConfig = function () {
            $scope.isLoading = true;
            $scope.createParam.customerId = $scope.customerId;
            shippingMapService.createShippingMapConfig($scope.createParam).then(function (response) {
                lincUtil.messagePopup("Success", "Add Successful");
                $scope.isLoading = false;
                $scope.createParam = {};
                init();
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isLoading = false;
            });
        }

        $scope.deleteShippingMapConfig = function (id) {
            var confirm = $mdDialog.confirm()
                .title('Confirm')
                .textContent('Would you like to delete the this Shipping Map?')
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function () {
                shippingMapService.deleteShippingMapConfig(id).then(function (response) {
                    lincUtil.messagePopup("Success", "Delete Successful");
                    init();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        }

        $scope.onSelect = function (org) {
            $scope.createParam.shippingService = null;
            carrierService.getCarrierByOrgId(org.id).then(function (response) {
                $scope.serviceTypes = response.serviceTypes;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'shippingMapService', '$mdDialog', 'carrierService'];

    return controller;
});
