'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, inventory, inventoryLockItemSpecMap, inventoryService, lincUtil) {

        $scope.isLoading = false;
        $scope.param = {};
        $scope.inventory = inventory;
        $scope.inventoryLockItemSpecMap = inventoryLockItemSpecMap;
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.release = function () {
            $scope.isLoading = true;
            inventoryService.manualRelease(inventory.id, $scope.param.qty).then(function (res) {
                $scope.isLoading = false;
                $mdDialog.hide();
                lincUtil.saveSuccessfulPopup();
            }, function (err) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(err);
            });
        }

    };
    controller.$inject = ['$scope', '$mdDialog', 'inventory', 'inventoryLockItemSpecMap', 'inventoryService', 'lincUtil'];
    return controller;
});
