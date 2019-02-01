'use strict';

define([
    './factories'
], function (factories) {
    factories.factory('androidFunctionPasswordService', function ($q, $resource) {
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

        service.searchAndroidFunctionPassword = function (params) {
            return $resource("/fd-app/facility/android-function-password/search", null, resourceConfig).search(params).$promise;
        };

        service.createAndroidFunctionPassword = function (params) {
            return $resource("/fd-app/facility/android-function-password/batch-create", null, { 'update': { 'method': 'POST'}}).save(params).$promise;
        };

        service.deleteAndroidFunctionPassword = function (ids) {
            return $resource("/fd-app/facility/android-function-password/batch-delete", null, { 'update': { 'method': 'POST'}}).update(ids).$promise;
        };

        service.updateAndroidFunctionPassword = function (params) {
            return $resource("/fd-app/facility/android-function-password/batch-update", null, { 'update': { 'method': 'PUT'}}).update(params).$promise;
        };

        return service;
    });
});
