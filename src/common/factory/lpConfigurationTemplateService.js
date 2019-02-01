'use strict';

define([
    './factories',
    'lodash'
], function(factories, _) {
    factories.factory('lpConfigurationTemplateService', function($resource) {

        var service = {};
        service.getLpConfigurationSingleTemplateById = function (id) {
            var entry = $resource("/fd-app/single-lp-template/:id");
            return entry.get({id: id}).$promise;
        };

        service.removeLpConfigurationSingleTemplateById = function (id) {
            var entry = $resource("/fd-app/single-lp-template/:id");
            return entry.delete({id: id}).$promise;
        };

        service.searchLpConfigurationSingleTemplate = function (param) {
            var entry = $resource("/bam/lp-template/single/search", null, {
                'postQuery': {
                    method: 'POST',
                    isArray: true
                }
            });
            return entry.postQuery(param).$promise;
        };

        service.addLpConfigurationSingleTemplate = function (lpConfigurationSingleTemplate) {
            var entry = $resource("/fd-app/single-lp-template");
            return entry.save(lpConfigurationSingleTemplate).$promise;
        };

        service.updateLpConfigurationSingleTemplate = function (lpConfigurationSingleTemplate) {
            var entry = $resource("/fd-app/single-lp-template/:id", null, {'update': {method: 'PUT'}});
            return entry.update({id: lpConfigurationSingleTemplate.id}, lpConfigurationSingleTemplate).$promise;
        };

        service.getLpConfigurationMultipleTemplateById = function (id) {
            var entry = $resource("/fd-app/multiple-lp-template/:id");
            return entry.get({id: id}).$promise;
        };

        service.removeLpConfigurationMultipleTemplateById = function (id) {
            var entry = $resource("/fd-app/multiple-lp-template/:id");
            return entry.delete({id: id}).$promise;
        };

        service.searchLpConfigurationMultipleTemplate = function (param) {
            var entry = $resource("/bam/lp-template/multiple/search", null, {'postQuery': {method: 'POST',isArray:true} });
            return entry.postQuery(param).$promise;
        };

        service.addLpConfigurationMultipleTemplate = function (lpConfigurationMultipleTemplate) {
            var entry = $resource("/fd-app/multiple-lp-template");
            return entry.save(lpConfigurationMultipleTemplate).$promise;
        };

        service.updateLpConfigurationMultipleTemplate = function (lpConfigurationMultipleTemplate) {
            var entry = $resource("/fd-app/multiple-lp-template/:id", null, {'update': {method: 'PUT'}});
            return entry.update({id: lpConfigurationMultipleTemplate.id}, lpConfigurationMultipleTemplate).$promise;
        };

        return service;
    });
});
