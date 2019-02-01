/**
 * Created by Giroux on 2016/11/2.
 */

'use strict';

define([
    'angular',
    'src/admin/service/item-import/config/itemImportController'
], function (angular, controller) {
    angular.module('linc.admin.service.itemImport.config', [])
        .controller('ItemImportConfigController', controller);
});