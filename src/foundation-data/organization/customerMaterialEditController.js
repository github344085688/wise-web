'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, id, customerId, customerMaterialService, lincUtil) {

        $scope.param = {};
        $scope.autoApprovalList = [{ name: "yes", status: true }, { name: "no", status: false }];
        $scope.customerId = customerId;
        $scope.id = id;
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        function init () {
            if (id) {
                customerMaterialService.getCustomerMaterial(id).then(function (response) {
                    $scope.param = response;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }
            if (id) {
                $scope.submitLabel = 'Update';
            } else {
                $scope.submitLabel = 'Save';
            }
        }
        init();


        $scope.addAndUpdateCustomerMaterial = function () {
            if (id) {
                updateCustomerMaterial($scope.param);
            } else {
                addCustomerMaterial($scope.param);
            }
        }

        function updateCustomerMaterial (param) {
            $scope.loading = true;
            customerMaterialService.updateCustomerMaterial(param).then(function (response) {
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
            customerMaterialService.createCustomerMaterial(param).then(function (response) {
                lincUtil.messagePopup("Success", "Create Successful");
                $scope.loading = false;
                $mdDialog.hide();
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            });
        }

    };
    controller.$inject = ['$scope', '$mdDialog', 'id', 'customerId', 'customerMaterialService', 'lincUtil'];
    return controller;
});
