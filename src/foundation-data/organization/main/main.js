'use strict';

define([
    'angular',
    'src/foundation-data/organization/organizationListPageController',
    'src/foundation-data/organization/editOrganizationPageController',
    'src/foundation-data/organization/editAkaPageController',
    'src/foundation-data/organization/editCustomerPageController',
    'src/foundation-data/organization/editOrganizationInfoPageController',
    'src/foundation-data/organization/editCustomerRelationshipsPageController',
    'src/foundation-data/organization/editTitlePageController',
    'src/foundation-data/organization/editAddressController',
    'src/foundation-data/organization/editAccountingController',
    'src/foundation-data/organization/editMaterialController',
    'src/foundation-data/organization/manualBillingListController',
    'src/foundation-data/organization/shippingListController',
    'src/foundation-data/organization/documentsListController'
], function (angular, organizationListCtrl, editOrganizationCtrl, editAkaCtrl, editCustomerCtrl,
             editBasicInfoCtrl, editCustomerRelationshipsCtrl,editTitlePageController,
             editAddressCtrl, editAccountingCtrl, editMaterialController, manualBillingListController, 
             shippingListController,documentsListController) {

    angular.module('linc.fd.organization', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('fd.organization.list', {
                url: '/list',
                views: {
                    "unis-main@fd.organization.list": {
                        templateUrl: 'foundation-data/organization/template/list.html',
                        controller: 'OrganizationListCtrl',
                        controllerAs: "ctrl"
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    permissions: "organization_read"
                }
            }).state('fd.organization.edit', {
                url: '/edit/:organizationId',
                views: {
                    "unis-main@fd.organization.edit": {
                        templateUrl: 'foundation-data/organization/template/edit.html',
                        controller: 'EditOrganizationCtrl',
                        controllerAs: "ctrl"
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                params: {organizationId: null},
                data: {
                    permissions: "organization_read"
                }
            }).state('fd.organization.edit.customer', {
                url: '/customer',
                templateUrl: 'foundation-data/organization/template/customerEdit.html',
                controller: 'EditCustomerCtrl',
                controllerAs: "ctrl",
                params: {organizationId: null},
                data: {
                    permissions: "organization_read"
                }
            }).state('fd.organization.edit.reference', {
                url: '/aka',
                templateUrl: 'foundation-data/organization/template/akaEdit.html',
                controller: 'EditAkaCtrl',
                controllerAs: "ctrl",
                params: {organizationId: null},
                data: {
                    permissions: "organization_read"
                }
            }).state('fd.organization.edit.basicInfo', {
                url: '/basicInfo',
                templateUrl: 'foundation-data/organization/template/organizationInfoEdit.html',
                controller: 'EditBasicInfoCtrl',
                controllerAs: "ctrl",
                params: {organizationId: null},
                data: {
                    permissions: "organization_read"
                }
            }).state('fd.organization.edit.customerRelationships', {
                url: '/customerRelationships',
                templateUrl: 'foundation-data/organization/template/customerRelationshipsEdit.html',
                controller: 'EditCustomerRelationshipsCtrl',
                controllerAs: "ctrl",
                params: {organizationId: null},
                data: {
                    permissions: "organization_read"
                }
            }).state('fd.organization.edit.title',{
                url:'/title',
                templateUrl: 'foundation-data/organization/template/titleEdit.html',
                controller: 'EditTitleCtrl',
                controllerAs: "ctrl",
                params: {organizationId: null},
                data: {
                    permissions: "organization_read"
                }
            }).state('fd.organization.edit.address',{
                url:'/address',
                templateUrl: 'foundation-data/organization/template/address.html',
                controller: 'EditAddressCtrl',
                controllerAs: "ctrl",
                params: {organizationId: null}
            }).state('fd.organization.edit.accounting',{
                url:'/accounting',
                templateUrl: 'foundation-data/organization/template/accounting.html',
                controller: 'EditAccountingCtrl',
                controllerAs: "ctrl",
                params: {organizationId: null}
            }).state('fd.organization.edit.material',{
                url:'/material',
                templateUrl: 'foundation-data/organization/template/materialEdit.html',
                controller: 'EditMaterialController',
                controllerAs: "ctrl",
                params: {organizationId: null}
            }).state('fd.organization.edit.manualBilling',{
                url:'/manualBilling',
                templateUrl: 'foundation-data/organization/template/manualBillingList.html',
                controller: 'ManualBillingListController',
                controllerAs: "ctrl",
                params: {organizationId: null}
            }).state('fd.organization.edit.shipping',{
                url:'/shipping',
                templateUrl: 'foundation-data/organization/template/shippingList.html',
                controller: 'ShippingListController',
                controllerAs: "ctrl",
                params: {organizationId: null}
            }).state('fd.organization.edit.documents',{
                url:'/documents',
                templateUrl: 'foundation-data/organization/template/documentsList.html',
                controller: 'DocumentsListController',
                controllerAs: "ctrl",
                params: {organizationId: null}
            });
        }])
        .controller("OrganizationListCtrl", organizationListCtrl)
        .controller("EditOrganizationCtrl", editOrganizationCtrl)
        .controller("EditAkaCtrl", editAkaCtrl)
        .controller("EditCustomerCtrl", editCustomerCtrl)
        .controller("EditBasicInfoCtrl", editBasicInfoCtrl)
        .controller("EditCustomerRelationshipsCtrl", editCustomerRelationshipsCtrl)
        .controller("EditTitleCtrl",editTitlePageController)
        .controller("EditAddressCtrl",editAddressCtrl)
        .controller("EditAccountingCtrl",editAccountingCtrl)
        .controller("EditMaterialController",editMaterialController)
        .controller("ManualBillingListController",manualBillingListController)
        .controller("ShippingListController",shippingListController)
        .controller("DocumentsListController",documentsListController);
});
