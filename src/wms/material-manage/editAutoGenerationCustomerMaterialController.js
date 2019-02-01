'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, id, customerMaterialService, lincUtil) {

        $scope.id = id;
        $scope.param = {};
        function init () {
            if (id) {
                $scope.title = "Update Customer Matrerial";
                $scope.submitLabel = "Update";
                $scope.isDisabled  = true;
                getAutoGenerationCustomerMaterial();
            } else {
                $scope.title = "Create Customer Matrerial";
                $scope.submitLabel = "Create";
                $scope.isDisabled  = false;
            }
        }
        init();


        function getAutoGenerationCustomerMaterial () {
            customerMaterialService.getAutoGenerationCustomerMaterial(id).then(function (response) {
                $scope.param = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.createOrUpdateAutoGenerationCustomerMaterial = function () {
            if (($scope.param.orderId && $scope.param.receiptId) || (!$scope.param.orderId && !$scope.param.receiptId)) {
                $scope.errorMesg = "You must select one between Order ID and Receipt ID";
                return;
            }
            if ($scope.param.orderId == "") {
                $scope.param.orderId = null;
            }
            if ($scope.param.receiptId == "") {
                $scope.param.receiptId = null;
            }
            if (id) {
                updateAutoGenerationCustomerMaterial($scope.param);
            } else {
                createAutoGenerationCustomerMaterial($scope.param);
            }
        }

        function updateAutoGenerationCustomerMaterial (param) {
            $scope.loading = true;
            customerMaterialService.updateAutoGenerationCustomerMaterial(param).then(function (response) {
                lincUtil.messagePopup("Success", "Update Successful");
                $mdDialog.hide();
                $scope.loading = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            });

        }

        function createAutoGenerationCustomerMaterial (param) {
            param.status = "Pending";
            $scope.loading = true;
            customerMaterialService.createAutoGenerationCustomerMaterial(param).then(function (response) {
                lincUtil.messagePopup("Success", "Create Successful");
                $mdDialog.hide();
                $scope.loading = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            });
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };


    };
    controller.$inject = ['$scope', '$mdDialog', 'id', 'customerMaterialService', 'lincUtil'];
    return controller;
});
