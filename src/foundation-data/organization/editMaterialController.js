'use strict';

define(['./customerMaterialEditController'], function (customerMaterialEditController) {

    var controller = function ($scope, $state, $stateParams, lincUtil, customerMaterialService, $mdDialog) {

        $scope.createParam = {};
        $scope.customerId = $stateParams.organizationId;
        $scope.autoApprovalList = [{ name: "yes", status: true }, { name: "no", status: false }]
        function init () {
            customerMaterialService.searchCustomerMaterial({customerId:$scope.customerId}).then(function (response) {
                $scope.customerMaterialList = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        init();

        $scope.addCustomerMaterial = function () {
            $scope.createParam.customerId = $scope.customerId;
            customerMaterialService.createCustomerMaterial($scope.createParam).then(function (response) {
                lincUtil.messagePopup("Success", "Create Successful");
                init();
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }


        $scope.editCustomerMaterial = function (id) {
            var form = {
                templateUrl: 'foundation-data/organization/template/customerMaterialEdit.html',
                locals: {
                    id: id,
                    customerId: $scope.customerId
                },
                autoWrap: true,
                controller: customerMaterialEditController
            };
            $mdDialog.show(form).then(function (response) {
                init();
            });
        }


        $scope.deleteCustomerMaterial = function (id) {
            var confirm = $mdDialog.confirm()
                .title('Confirm')
                .textContent('Would you like to delete the this Material?')
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function () {
                customerMaterialService.deleteCustomerMaterial(id).then(function (response) {
                    lincUtil.messagePopup("Success", "Delete Successful");
                    init();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        }


    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'customerMaterialService', '$mdDialog'];

    return controller;
});
