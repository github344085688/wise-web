'use strict';

define([], function() {

    var controller = function($scope, $state, $stateParams, lincUtil, isAddAction, organizationService, lincResourceFactory) {
        var ctrl = this;

        function init() {
            $scope.submitLabel = "Save";
            ctrl.isAddAction = $stateParams.organizationId ? true : false;
            organizationService.getOrganizationById($stateParams.organizationId).then(function(response) {
                ctrl.organization = response;
                ctrl.selectedTags = ctrl.organization.tags;
            }, function() {});

            organizationService.getCarrierByOrganizationId($stateParams.organizationId).then(function(response) {
                ctrl.carrier = response;
                $scope.submitLabel = "Update";
                ctrl.carrier.organizationId = $stateParams.organizationId;
            }, function() {});
        }

        init();


        ctrl.addOrUpdateCarrier = function() {
            ctrl.carrier.id = $stateParams.organizationId;
            $scope.loading = true;
            organizationService.updateCarrier(ctrl.carrier).then(function(res) {
                $scope.loading = false;
                $scope.submitLabel = "Update";
                lincUtil.saveSuccessfulPopup();
            }, function() {
                $scope.loading = false;
                lincUtil.messagePopup("Error Found");
            });
        };

        ctrl.cancelEditOrganization = function() {
            $state.go("fd.organization.list");
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'isAddAction', 'organizationService', 'lincResourceFactory'];

    return controller;
});
