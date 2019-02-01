'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('lpService', function ($resource) {
        var service = {};
        service.createLpWithLocationId = function (locationId,type) {
            return $resource('/wms-app/lp/single/' + locationId+'/'+type).get().$promise;
        };
        return service;
    });
});