'use strict';

define([
    'angular'
], function (angular) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemService) {
        var ctrl = this;
        $scope.itemReplenishment = [{}];
        $scope.availableLocationTypes = ['ZONE', 'LOCATION', 'STAGING', 'PARKING', 'DOCK', 'BASE', ,'SORTING','OTHER'];
        $scope.availableLocationSubTypes=['PARKING', 'EMPTY_CTN', 'FULL_CTN', 'WAITING', '2D', '3D', '3D_GRID'];
        var itemSpecId;

        initReplenishment();
        function initReplenishment() {
            $scope.submitLabel = "Save";
            itemSpecId = $stateParams.itemSpecId;
            getItemUnits(itemSpecId);
            itemService.getReplenishmentsByItemId(itemSpecId).then(function (response) {
                $scope.submitLabel = "Update";
                $scope.itemReplenishment = response;
                if (!$scope.itemReplenishment.miniInventories || $scope.itemReplenishment.miniInventories.length === 0) {
                    $scope.itemReplenishment.miniInventories = [{}];
                }
            }, function (response) {
                $scope.itemReplenishment = {};
                $scope.itemReplenishment.miniInventories = [{}];
            });
        }

        ctrl.saveOrUpdateReplenishments = function () {
            $scope.itemReplenishment.id = itemSpecId;
            var validQty = false;
            _.forEach($scope.itemReplenishment.miniInventories, function (miniInventories) {

                if (miniInventories.miniQty >= miniInventories.maxQty) {
                    validQty = true;
                    return;
                }
            });
            if (validQty)
                lincUtil.errorPopup('maxQty must be greater than miniQty');
            else {
                $scope.loading = true;
                itemService.updateReplenishments($scope.itemReplenishment).then(function (response) {
                    $scope.loading = false;
                    if ($scope.submitLabel == "Save") {
                        lincUtil.saveSuccessfulPopup();
                        $scope.submitLabel = "Update";
                    } else {
                        lincUtil.updateSuccessfulPopup();
                    }
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }

        };

        ctrl.removeReplenishment = function (index) {
            $scope.itemReplenishment.miniInventories.splice(index, 1);
        };

        ctrl.addReplenishment = function () {
            $scope.itemReplenishment.miniInventories.push({});
        };
        function getItemUnits(itemSpecId) {
            itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (response) {
                $scope.units = response.units;
            });
        }

    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemService'];

    return controller;
});
