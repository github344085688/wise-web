'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope,  $mdDialog, lincUtil,orderService) {
       $scope.syncToHon = {}

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
                $scope.loading=true;
                orderService.batchImportSyncOrderToHon({customerId:$scope.syncToHon.customerId}).then(function (response) {
                    $scope.loading=false;
                    lincUtil.messagePopup("Message", "Sync Orders To Hon Successful.");
                    $mdDialog.hide();
                },function (error) {
                    lincUtil.processErrorResponse(error);
                    $scope.loading = false;
                });

        };
    };
    controller.$inject = ['$scope', '$mdDialog','lincUtil','orderService'];
    return controller;
});