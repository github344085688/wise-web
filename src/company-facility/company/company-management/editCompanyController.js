'use strict';

define(["angular"], function (angular) {

    var controller = function ($scope, $state, $stateParams, lincUtil,
        isAddAction, companyService, organizationService) {
        function init() {

            $scope.isAddAction = isAddAction;
            if (!isAddAction) {
                companyService.getCompanyByOrgId($stateParams.companyId).then(function (response) {
                    $scope.company = response;
                    $scope.submitLabel = "Update";
                }, function () { });
            } else {
                $scope.submitLabel = "Save";
                $scope.company = {};
            }
        }
        init();

        $scope.addOrUpdateCompany = function () {
            var company = angular.copy($scope.company);
            $scope.loading = true;
            if (!$stateParams.companyId) {
                companyService.searchCompany(company.basic).then(function (response) {
                    if (!response.length) {
                        organizationService.createOrganization({ basic: company.basic, extend:{channel:'MANUAL'}}).then(function (res) {
                            delete company.basic;
                            updateCompany(res.id, company);
                        }, accessServiceFail);
                    }
                    else {
                        lincUtil.errorPopup('Company has been exsited');
                        $scope.loading = false;
                    }


                }, function () { });


            } else {
                updateCompany(company.id, company);
            }
        };

        function updateCompany(organizationId, company) {
            companyService.createAndUpdateCompany(organizationId, company).then(function (res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go("cf.company.company-management.list");
                });
            }, accessServiceFail);
        }

        function accessServiceFail(error) {
            $scope.loading = false;
            lincUtil.errorPopup('Error:' + error.data.error);
        }

        $scope.cancelEditCompany = function () {
            $state.go("cf.company.company-management.list");
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil',
        'isAddAction', 'companyService', 'organizationService'];

    return controller;
});
