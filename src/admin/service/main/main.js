'use strict';

define([
    'angular',
    'src/admin/service/import/address-import/addressImportController',
    'src/admin/service/import/longhaul-import/longhaulImportController',
    'src/admin/service/import/organization-import/organizationImportController',
    'src/admin/service/import/location-import/locationImportController',
    'src/admin/service/import/tracking-number-import/trackingNumberImportController',
    'src/admin/service/import/inventory-import/inventoryImportController',
    'src/admin/service/import/load-import/loadImportController',
    'src/admin/service/ps/main/main',
    'src/admin/service/item-import/main/main',
    'src/admin/service/template-manage/main/main'
], function (angular, addressImportController, longhaulImportController, organizationImportController, locationImportController,trackingNumberImportController, inventoryImportController, loadImportController) {
    angular.module('linc.admin.service', ['linc.admin.service.ps', 'linc.admin.service.itemImport', 'linc.admin.service.templateManagement'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('admin.service.ps', {
                url: '/ps',
                template: '<ui-view></ui-view>',
            })
            .state('admin.service.itemImport', {
                    url: '/item-import',
                    template: '<ui-view></ui-view>',
            })
            .state('admin.service.templateManagement', {
                url: '/template-management',
                template: '<ui-view></ui-view>',
            })
            .state('admin.service.organizationImport', {
                url: '/organization-import',
                templateUrl: 'admin/service/import/organization-import/template/organizationImport.html',
                controller: 'OrganizationImportController',
                data: {
                    title: "Import Organization",
                    permissions: "service::import_write"
                }
            })
            .state('admin.service.addressImport', {
                url: '/address-import',
                templateUrl: 'admin/service/import/address-import/template/addressImport.html',
                controller: 'AddressImportController',
                data: {
                    title: "Import Address",
                    permissions: "service::import_write"
                }
            })
            .state('admin.service.longHaulImport', {
                url: '/longhaul-import',
                templateUrl: 'admin/service/import/longhaul-import/template/longhaulImport.html',
                controller: 'LonghaulImportController',
                data: {
                    title: "Import LongHaul",
                    permissions: "service::import_write"
                }
            })
            .state('admin.service.locationImport', {
                url: '/location-import',
                templateUrl: 'admin/service/import/location-import/template/locationImport.html',
                controller: 'LocationImportController',
                data: {
                    title: "Import Location",
                    permissions: "service::import_write"
                }
            }).state('admin.service.trackingNumberImport', {
                url: '/trackingNumber-import',
                templateUrl: 'admin/service/import/tracking-number-import/template/trackingNumberImport.html',
                controller: 'TrackingNumberImportController',
                data: {
                    title: "Import tracking#",
                    permissions: "service::import_write"
                }
            }).state('admin.service.inventoryImport', {
                url: '/inventory-import',
                templateUrl: 'admin/service/import/inventory-import/template/inventoryImport.html',
                controller: 'InventoryImportController',
                data: {
                    title: "Import Inventory",
                    permissions: "service::import_write"
                }
            }).state('admin.service.loadImport', {
                url: '/load-import',
                templateUrl: 'admin/service/import/load-import/template/loadImport.html',
                controller: 'LoadImportController',
                data: {
                    title: "Import Load",
                    permissions: "service::import_write"
                }
            });
        }])
        .controller('AddressImportController', addressImportController)
        .controller('LonghaulImportController', longhaulImportController)
        .controller('LocationImportController', locationImportController)
        .controller('TrackingNumberImportController', trackingNumberImportController)
        .controller('OrganizationImportController', organizationImportController)
        .controller('InventoryImportController', inventoryImportController)
        .controller('LoadImportController', loadImportController);
});


