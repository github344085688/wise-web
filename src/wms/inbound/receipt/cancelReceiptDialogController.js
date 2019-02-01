'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $mdDialog, receiptService, receiptId) {
        $scope.resonInfo = {};
        $scope.receiptId = receiptId;
        $scope.submit = function () {
            $scope.saving = true;
            receiptService.cancelReceipt(receiptId, {reason: $scope.resonInfo.reason}).then(function (response) {
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
    };

    controller.$inject = ['$scope', '$mdDialog', 'receiptService', 'receiptId'];

    return controller;
});
