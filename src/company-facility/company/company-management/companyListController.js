'use strict';

define([
    "lodash",
    './createCompanyRelationShip'
], function (_, createCompanyRelationShip) {
    var $scope = function ($scope, companyService, lincUtil, $mdDialog, organizationRelationshipService) {
        $scope.pageSize = 10;
        $scope.searchInfo = {};

        function searchCompany(searchParam) {
            $scope.loading = true;
            companyService.searchCompany(searchParam).then(function (data) {
                $scope.loading = false;
                $scope.companies = data;
                $scope.loadContent(1);
            }, function () { });
        }

        $scope.search = function () {
            searchCompany($scope.searchInfo);
        };

        $scope.loadContent = function (currentPage) {
            $scope.companiesView = $scope.companies.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.companies.length ? $scope.companies.length : currentPage * $scope.pageSize);
            $scope.companiesView.forEach(function (company) {
                getRelationshipByCompany(company);
            }, this);
        };

        function getRelationshipByCompany(company) {
            organizationRelationshipService.searchRelationship({ partnerId: company.id, relationship: "Company", scenario: "ORGANIZATION_ONLY_THE_BASIC" }).then(function (response) {
                company.relationShips = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }
        // $scope.deleteCompany = function (company) {
        //     if (company.relationShips && company.relationShips.length) {
        //         lincUtil.errorPopup('You can not delete it before you have been relieved the relationship');
        //         return;
        //     }
        //     var id = company.id;
        //     lincUtil.confirmPopup("Delete Company", "Are you sure to delete this company?", function () {
        //         $scope.loading = true;
        //         companyService.deleteCompany(id).then(function () {
        //             $scope.loading = false;
        //             var companyIndex = _.findIndex($scope.companiesView, function (company) {
        //                 return company.id == id;
        //             });
        //             $scope.companiesView.splice(companyIndex, 1);
        //             companyIndex = _.findIndex($scope.companies, function (company) {
        //                 return company.id == id;
        //             });
        //             $scope.companies.splice(companyIndex, 1);
        //         }, function (error) {
        //             $scope.loading = false;
        //             lincUtil.errorPopup('Delete Company Error! ' + error.data.error);
        //         });
        //     });
        // };

        $scope.openCreateFacilityDialog = function (index) {
            $mdDialog.show({
                templateUrl: 'company-facility/company/company-management/template/createCompanyRelationShip.html',
                controller: createCompanyRelationShip,
                locals: {
                    company: $scope.companiesView[index],
                },
            }).then(function (res) {
                $scope.companiesView[index].relationShips = res;

            });
        }
        function _init() {
            searchCompany({});
        }

        _init();
    };
    $scope.$inject = ['$scope', 'companyService', 'lincUtil', '$mdDialog', 'organizationRelationshipService'];
    return $scope;
});
