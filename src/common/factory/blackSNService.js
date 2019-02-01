'use strict';

define([
    './factories',
], function(factories) {
    factories.factory('blackSNService', function($resource) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: false
            }
        };
        var service = {};
        service.searchItemBlackByPaging = function(param) {
            return $resource("/bam/item-black-list/search-by-paging",{}, resourceConfig).search(param).$promise;
        };

        service.batchDelete = function(ids) {
            return $resource("/fd-app/item-black-list/batch-delete", null, {"batchDelete": { method: 'POST'}}).batchDelete(ids).$promise;
        };

        service.batchCreate = function(itemSNs) {
            return $resource("/fd-app/item-black-list/batch-create", null, {"batchCreate": { method: 'POST'}}).batchCreate(itemSNs).$promise;
        };

        return service;
    });
});
