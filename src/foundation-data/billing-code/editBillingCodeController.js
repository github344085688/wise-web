'use strict';

define(["angular"], function(angular) {

    var controller = function($scope, $state, $stateParams, lincUtil,
                              isAddAction, billingCodeService) {
        function init() {
            $scope.isAddAction = isAddAction;
            if(!isAddAction) {
                $scope.submitLabel = "Update";
                billingCodeService.searchBillingCode({id: $stateParams.codeId}).then(function(data) {
                    $scope.billingCode = data[0];
                }, function() {});
            }else {
                $scope.submitLabel = "Save";
                $scope.billingCode = {};
            }
        }
        init();

        $scope.submitBillingCode = function() {
            var billingCode = angular.copy($scope.billingCode);
            $scope.loading = true;
            if(isAddAction) {
                createCode(billingCode);
            }else {
                updateCode(billingCode);
            }
        };

        function createCode(code) {
            billingCodeService.createBillingCode(code).then(function(res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go("fd.billingCode.list");
                });
            },accessServiceFail);
        }

        function updateCode(code) {
            billingCodeService.updateBillingCode(code).then(function(res) {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go("fd.billingCode.list");
                });
            },accessServiceFail);
        }

        function accessServiceFail(error) {
            $scope.loading = false;
            lincUtil.errorPopup('Error:' + error.data.error);
        }

        $scope.cancel = function() {
            $state.go("fd.billingCode.list");
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil',
        'isAddAction', 'billingCodeService'];

    return controller;
});
