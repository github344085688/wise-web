'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope,  $mdDialog, lincUtil,receiptService) {
       $scope.syncToHon = {}

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
                $scope.loading=true;
                receiptService.batchImportSyncReceiptToHon({customerId:$scope.syncToHon.customerId}).then(function (response) {
                    $scope.loading=false;
                    lincUtil.messagePopup("Message", "Sync Receipt To Hon Successful.");
                    $mdDialog.hide();
                },function (error) {
                    lincUtil.processErrorResponse(error);
                    $scope.loading = false;
                });

        };
    };
    controller.$inject = ['$scope', '$mdDialog','lincUtil','receiptService'];
    return controller;
});