'use strict';

define([], function () {

    var controller = function ($scope, $state, $stateParams, lincUtil,
                               organizationService, session) {

        $scope.isCustomer = false;
        $scope.isTitle=false;
        var companyId = session.getCompanyFacility().companyId;
        $scope.changeTab = function (tab) {
            $scope.activetab = tab;
            if (tab === 'basic') {
                $state.go("fd.organization.edit.basicInfo", {organizationId: $stateParams.organizationId});

            } else if (tab === 'aka') {
                $state.go("fd.organization.edit.reference", {organizationId: $stateParams.organizationId});

            } else if (tab === 'customerRelation') {
                $state.go("fd.organization.edit.customerRelationships", {organizationId: $stateParams.organizationId});

            } else if (tab === 'customer') {
                $state.go("fd.organization.edit.customer", {organizationId: $stateParams.organizationId});

            } else if (tab === 'title') {
                $state.go("fd.organization.edit.title", {organizationId: $stateParams.organizationId});

            } else if (tab === 'address') {
                $state.go("fd.organization.edit.address", {organizationId: $stateParams.organizationId});

            } else if (tab === 'accounting') {
                $state.go("fd.organization.edit.accounting", {organizationId: $stateParams.organizationId});

            } else if (tab === 'material') {
                $state.go("fd.organization.edit.material", {organizationId: $stateParams.organizationId});

            } else if (tab === 'manualBilling') {
                $state.go("fd.organization.edit.manualBilling", {organizationId: $stateParams.organizationId});

            } else if (tab === 'shipping') {
                $state.go("fd.organization.edit.shipping", {organizationId: $stateParams.organizationId});

            }else if (tab === 'documents') {
                $state.go("fd.organization.edit.documents", {organizationId: $stateParams.organizationId});

            }
            
        };

        var editOrganization = {
            init: function () {
                $scope.isAddAction = $stateParams.organizationId? false : true;
                $scope.changeTab("basic");
                if ($stateParams.organizationId) {
                    $scope.submitLabel = "Update";
                    this.getOrganization($stateParams.organizationId);
                } else {
                    $scope.submitLabel = "Save";
                    $scope.organization = {};
                    $scope.changeTab("basic");
                }
            },
            getOrganization: function (id) {
                organizationService.getOrganizationAndRoles(companyId, id).then(function (response) {
                    $scope.organization = response;
                    var organizationRoles = response.roles;
                    if (organizationRoles && organizationRoles.indexOf("Customer") != -1) {
                        $scope.isCustomer = true;
                    }
                     if (organizationRoles && organizationRoles.indexOf("Title") != -1) {
                        $scope.isTitle = true;
                    }
                }, function () {
                });
            }
        };
        editOrganization.init();
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil',
        'organizationService', 'session'];
    return controller;
});
