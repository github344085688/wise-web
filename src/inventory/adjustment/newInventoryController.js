/**
 * Created by Giroux on 2017/7/11.
 */

'use strict';

define(['angular', 'lodash'], function (angular, _) {

    var controller = function ($scope, adjustmentService, inventoryService, lincUtil) {

        $scope.newInventory = {};
        $scope.newInventory.type = "Add Inventory";
        $scope.newInventory.source = "Manual";
        $scope.newInventory.status = "True adjust";



        $scope.addInventory = function (approveNow) {
            $scope.newInventory.addInventory = {};
            $scope.newInventory.addInventory.itemSpecId = $scope.newInventory.itemSpecId;
            $scope.newInventory.addInventory.productId = $scope.newInventory.productId;
            $scope.newInventory.addInventory.type = "GOOD";
            $scope.newInventory.addInventory.unitId = $scope.newInventory.unitId;
            $scope.newInventory.addInventory.qty = $scope.newInventory.adjustTo;
            $scope.newInventory.addInventory.status = "AVAILABLE";
            $scope.newInventory.addInventory.lpId = $scope.newInventory.lpId;
            $scope.newInventory.addInventory.customerId = $scope.newInventory.customerId;
            $scope.newInventory.addInventory.titleId = $scope.newInventory.titleId;
            $scope.newInventory.addInventory.supplierId = $scope.newInventory.supplierId;
            $scope.newInventory.qty = $scope.newInventory.adjustTo;
            $scope.newInventory.lpIds = [$scope.newInventory.lpId];
            $scope.newInventory.notes = $scope.adjustmentObj.notes;
            $scope.newInventory.reason = $scope.adjustmentObj.reason;
            $scope.newInventory.receiptId = $scope.adjustmentObj.receiptId;
            $scope.newInventory.itemStatus = "Available";
            $scope.isSaving = true;

            inventoryService.getLpLocation($scope.newInventory.lpId).then(function (response) {
                if (response.locationId) {
                    $scope.newInventory.locationId = response.locationId;
                }
                adjustmentService.saveAdjustment($scope.newInventory, approveNow).then(function (response) {
                    $scope.isSaving = false;
                    lincUtil.saveSuccessfulPopup();
                }, function (error) {
                    $scope.isSaving = false;
                    var mesg = error;
                    if (error.data && error.data.error) {
                        mesg = error.data.error;
                    }
                    lincUtil.errorPopup(mesg);
                    throw new Error(mesg);
                });
            }, function (error) {
                $scope.isSaving = false;
                lincUtil.processErrorResponse(error);
            });

        };
    };

    return controller;
});