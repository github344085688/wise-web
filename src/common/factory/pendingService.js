'use strict';

define([
    './factories',
    'lodash',
    'angular'
], function(factories, _, angular) {

    factories.factory('pendingService', function($q, $resource) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };
        var service = {};

        service.getPendingById = function(pendingId) {
            var entry = $resource("/fd-app/data-channel/:id");
            return entry.get({
                id: pendingId
            }).$promise;
        };

        service.remove = function(pendingId) {
            var entry = $resource("/fd-app/data-channel/:id");
            return entry.delete({
                id: pendingId
            }).$promise;
        };

        service.close = function (pendingId) {
            var entry = $resource("/fd-app/data-channel/close/:id", null, {'enable': {method: 'PUT'}});
            return entry.enable({id: pendingId}, null).$promise;
        };

        service.getPending = function(params) {
            var entry = $resource("/fd-app/data-channel/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            });
            return entry.postSearch(params).$promise;
        };

        return service;
    });

});
