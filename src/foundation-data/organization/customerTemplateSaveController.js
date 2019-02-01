'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, customerId, customerTemplateService, lincUtil) {

        $scope.params = {};
        $scope.params.customerId = customerId;
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function () {
            $scope.loading = true;
            customerTemplateService.createCustomerTemplate($scope.params).then(function (res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

    };
    controller.$inject = ['$scope', '$mdDialog', 'customerId', 'customerTemplateService', 'lincUtil'];
    return controller;
});
