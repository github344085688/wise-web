'use strict';

define([
    './factories',
    'lodash',
    'angular'
], function(factories, _, angular) {

    factories.factory('sopService', function($q, $resource) {
        var service = {};

        service.getSopById = function(sopId) {
            var entry = $resource("/fd-app/handlingsop/:id");
            return entry.get({ id: sopId }).$promise;
        };

        service.remove = function(sopId) {
            var entry = $resource("/fd-app/handlingsop/:id");
            return entry.delete({ id: sopId }).$promise;
        };

        service.getSops = function(param) {
            var entry = $resource("/bam/handlingsop/search", null, {
                'postQuery': {
                    method: 'POST',
                }
            });
            return entry.postQuery(param).$promise;
        };

        service.addSop = function(sop) {
            var entry = $resource("/fd-app/handlingsop");
            return entry.save(sop).$promise;
        };

        service.updateSop = function(sop) {
            var entry = $resource("/fd-app/handlingsop/:id", null, {
                'update': {
                    method: 'PUT'
                }
            });
            return entry.update({ id: sop.id }, sop).$promise;
        };


        return service;
    });

});
