/**
 * Created by Giroux on 2016/11/2.
 */

'use strict';

define([
    'angular',
    'src/admin/service/item-import/upload/itemImportController'
], function(angular, controller) {
    angular.module('linc.admin.service.itemImport.upload', [])
        .controller('uploadItemImportController', controller);
});