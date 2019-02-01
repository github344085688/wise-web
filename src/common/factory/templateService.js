/**
 * Created by Giroux on 2016/9/28.
 */

'use strict';

define([
    './factories'
], function (factories) {
    factories.factory('templateService', function ($resource) {
        var services = {};
        services.searchTemplates = function (searchParam) {
            return $resource('/print-app/template/search', null, {
                'search': {
                    method: 'POST',
                    isArray: true
                }
            }).search(searchParam).$promise;
        };

        return services;
    });


});