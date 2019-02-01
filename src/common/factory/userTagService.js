'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('userTagService', function($resource) {

        var service = {};

        service.queryAll = function() {
            return $resource('/idm-app/tag/all').query().$promise;
        };

        service.remove = function(tagId) {
            return $resource("/idm-app/tag/:tagId").delete({ tagId: tagId }).$promise;
        };

        service.add = function(tag) {
            return $resource('/idm-app/tag').save(tag).$promise;
        };
        
        return service;
    });
});
