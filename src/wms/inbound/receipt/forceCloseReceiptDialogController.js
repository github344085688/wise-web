'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $mdDialog, receiptService, receiptId, itemLines) {

        $scope.exceptionItemLines = 0;
        $scope.submit = function () {
            if (!$scope.resonInfo.reason) {
                return;
            }
            $scope.saving = true;
            receiptService.forceCloseReceipt(receiptId, {reason: $scope.resonInfo.reason}).then(function (response) {
                $scope.saving = false;
                $mdDialog.hide();
            }, function(error) {
                $scope.saving = false;
                $scope.errorMsg = error.message;
            });
        };

        $scope.closeDialog = function() {
            $mdDialog.cancel();
        };
        
        function judgeItemLinesException(itemLines) {
            itemLines.forEach(function (itemLine) {
                if(itemLine.receivedQty != itemLine.qty) {
                    itemLine.qtyIsMatch = false;
                }else {
                    itemLine.qtyIsMatch = true;
                }

                if(itemLine.receivedUnit && itemLine.unit.id != itemLine.receivedUnit.id) {
                    itemLine.unitIsMatch = false;
                }else {
                    itemLine.unitIsMatch = true;
                }

                if(!(itemLine.qtyIsMatch && itemLine.unitIsMatch)) {
                    $scope.exceptionItemLines ++;
                }
            })
        }

        function init() {
            $scope.resonInfo = {};
            $scope.receiptId = receiptId;
            $scope.itemLines = itemLines;
            judgeItemLinesException(itemLines);
        }

        init();
    };

    controller.$inject = ['$scope', '$mdDialog', 'receiptService', 'receiptId', 'itemLines'];

    return controller;
});