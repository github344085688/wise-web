'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, id, customerId, manualBillingConfigService, lincUtil) {

        $scope.param = {};
        $scope.customerId = customerId;
        $scope.id = id;
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        function getAccountItems () {
            $scope.isReady = false;
            manualBillingConfigService.getAccountItems({ customerId: customerId }).then(function (response) {
                $scope.itemList = response;
                $scope.isReady = true;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isReady = true;
            });
        }

        function getCurrentManualBillingConfig () {
            $scope.isReady = false;
            manualBillingConfigService.getManualBillingConfig(id).then(function (response) {
                $scope.param = response;
                $scope.isReady = true;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isReady = true;
            });
        }

        function init () {
            getAccountItems();
            if (id) {
                getCurrentManualBillingConfig();
                $scope.submitLabel = 'Update';
            }
            else {
                $scope.submitLabel = 'Save';
            }
        }
        init();


        $scope.addOrUpdateManualBilling = function () {
            if (id) {
                updateCustomerMaterial($scope.param);
            } else {
                addCustomerMaterial($scope.param);
            }
        }

        function updateCustomerMaterial (param) {
            $scope.loading = true;
            manualBillingConfigService.updateManualBillingConfig(param).then(function (response) {
                lincUtil.messagePopup("Success", "Update Successful");
                $scope.loading = false;
                $mdDialog.hide();
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            });
        }

        function addCustomerMaterial (param) {
            param.customerId = customerId;
            $scope.loading = true;
            manualBillingConfigService.createManualBillingConfig(param).then(function (response) {
                lincUtil.messagePopup("Success", "Create Successful");
                $scope.loading = false;
                $mdDialog.hide();
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            });
        }

    };
    controller.$inject = ['$scope', '$mdDialog', 'id', 'customerId', 'manualBillingConfigService', 'lincUtil'];
    return controller;
});
