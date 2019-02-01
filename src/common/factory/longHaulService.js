'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('longHaulService', function ($resource) {
        var service = {};

        service.getLongHaulById = function (longHaulId) {
            return $resource("/bam/long-haul/:id").get({ id: longHaulId }).$promise;
        };

        service.updateLongHaulById = function (longHaulId, param) {
            return $resource("/fd-app/long-haul/:id", null, { "update": { method: 'PUT' } }).update({ id: longHaulId }, param).$promise;
        };

        service.addLongHaul = function (longHaul) {
            return $resource("/fd-app/long-haul").save(longHaul).$promise;
        };

        service.LongHaulSearch = function (param) {
            return $resource("/bam/long-haul/search", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };

        service.removeLongHaul = function (longHaulId) {
            return $resource("/fd-app/long-haul/:id").delete({ id: longHaulId }).$promise;
        };
        service.longHaulImport = function (params) {
            var entry = $resource("/fd-app/long-haul/batch-create", null, {
                'import': {
                    method: 'POST', isArray: true
                }
            });
            return entry.import(params).$promise;
        };

        service.lineHaulMonitor = function (longHaulParam) {
            return $resource("/bam/long-haul/dashboard", null, { "postQuery": { method: 'POST' } }).postQuery(longHaulParam).$promise;
        }

        return service;
    });
});
