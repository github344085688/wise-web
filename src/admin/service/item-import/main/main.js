'use strict';

define([
    'angular',
    'src/admin/service/item-import/config/itemImport',
    'src/admin/service/item-import/upload/itemImport',
], function (angular, controller) {

    angular.module('linc.admin.service.itemImport', ['linc.admin.service.itemImport.config', 'linc.admin.service.itemImport.upload',
    ])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('admin.service.itemImport.config', {
                    url: '/config',
                    templateUrl: 'admin/service/item-import/config/template/itemImport.html',
                    controller: 'ItemImportConfigController',
                    data: {
                        permissions: "service::import_write",
                        title: "Import Item Config"
                    }
                })
                .state('admin.service.itemImport.upload', {
                    url: '/upload',
                    templateUrl: 'admin/service/item-import/upload/template/itemImport.html',
                    controller: 'uploadItemImportController',
                    data: {
                        permissions: "service::import_write",
                        title: "Import Item Upload"
                    }
                });
        }]);
});
