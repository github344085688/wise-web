'use strict';

define([
    'angular',
    'src/company-facility/company/company-management/companyListController',
    'src/company-facility/company/company-management/editCompanyController'
], function (angular, companyListController, editCompanyController) {
    angular.module('linc.cf.company.company-management', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('cf.company.company-management.list', {
                url: '/list',
                templateUrl: 'company-facility/company/company-management/template/companyList.html',
                controller: 'CompanyListCtrl',
                data: {
                    permissions: "company::management_read"
                }
            }).state('cf.company.company-management.add', {
                url: '/add',
                templateUrl: 'company-facility/company/company-management/template/editCompany.html',
                controller: 'EditCompanyCtrl',
                resolve: {
                    'isAddAction': function () {
                        return true;
                    }
                },
                data: {
                    permissions: "company::management_write"
                }
            }).state('cf.company.company-management.edit', {
                url: '/edit/:companyId',
                templateUrl: 'company-facility/company/company-management/template/editCompany.html',
                controller: 'EditCompanyCtrl',
                resolve: {
                    'isAddAction': function () {
                        return false;
                    }
                },
                data: {
                    permissions: "company::management_write"
                }
            });
        }])
        .controller("CompanyListCtrl", companyListController)
        .controller("EditCompanyCtrl", editCompanyController);

});
