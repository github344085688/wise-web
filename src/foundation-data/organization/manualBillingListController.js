'use strict';

define(['./manualBillingEditController'], function (manualBillingEditController) {

    var controller = function ($scope, $state, $stateParams, lincUtil, manualBillingConfigService, $mdDialog) {
    
            $scope.createParam = {};
            $scope.customerId = $stateParams.organizationId;
            function init () {
                manualBillingConfigService.searchManualBillingConfig({customerId:$scope.customerId}).then(function (response) {
                    $scope.manualBillingConfigList = response;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }
            init();
    
            $scope.editManualBilling = function (id) {
                var form = {
                    templateUrl: 'foundation-data/organization/template/manualBillingEdit.html',
                    locals: {
                        id: id,
                        customerId: $scope.customerId
                    },
                    autoWrap: true,
                    controller: manualBillingEditController
                };
                $mdDialog.show(form).then(function (response) {
                    init();
                });
            }
    
    
            $scope.deleteManualBilling = function (id) {
                var confirm = $mdDialog.confirm()
                    .title('Confirm')
                    .textContent('Would you like to delete the this Manual Billing?')
                    .ok('Yes')
                    .cancel('No');
                $mdDialog.show(confirm).then(function () {
                    manualBillingConfigService.deleteCustomerMaterial(id).then(function (response) {
                        lincUtil.messagePopup("Success", "Delete Successful");
                        init();
                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });
                });
            }

    };
    
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'manualBillingConfigService', '$mdDialog'];

    return controller;
});
