'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, receiptService, lincUtil, receiptId) {
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        
        getReceipt(receiptId);

        function getReceipt(receiptId) {
            $scope.loading = true;
            receiptService.getReceipt(receiptId).then(function (receipt) {
                $scope.loading = false;
                $scope.receipt = receipt;
                $scope.receipt.totalQty = 0;

            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }


    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'receiptService','lincUtil', 'receiptId'];
    return controller;
});
