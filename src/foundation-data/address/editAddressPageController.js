'use strict';

define([], function() {

    var controller = function($scope, $state, $stateParams, lincUtil, isAddAction, addressService, organizationService) {

        var ctrl = this; 

        function init() {
            ctrl.isAddAction = $stateParams.addressId ? false : true;
            if (ctrl.isAddAction) {
                $scope.submitLabel = "Save";
            } else {
                $scope.submitLabel = "Update";
                addressService.getAddressById($stateParams.addressId).then(function(response) {
                    ctrl.address = response;
                }, function() {});
            }
        }

        init();
        
        ctrl.onSelectOrganization = function(org){
            ctrl.address.organizationName = org.name;
        };

        ctrl.addOrUpdateAddress = function() {
            $scope.loading = true;
            if (ctrl.isAddAction && !ctrl.address.id) {
                ctrl.address.channel = 'MANUAL';
                addressService.addAddress(ctrl.address).then(function(response) {
                    $scope.loading = false;
                    if (response.error) {
                        lincUtil.errorPopup("Error:" + response.error);
                        return;
                    }
                    ctrl.address.id = response.id;
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go("fd.address.list");
                    });
                }, function(error) {
                    $scope.loading = false;
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
            } else {
                addressService.updateAddress(ctrl.address).then(function() {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go("fd.address.list");
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.errorPopup("Error:" + error.data.error);
                    });
                });
            }

        };

        ctrl.cancelEditAddress = function() {
            $state.go("fd.address.list");
        };

    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'isAddAction', 'addressService', 'organizationService'];

    return controller;
});
