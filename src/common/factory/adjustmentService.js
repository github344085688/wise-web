/**
 * Created by Giroux on 2016/9/28.
 */

'use strict';

define([
    './factories'
], function(factories) {
    factories.factory('adjustmentService', function($resource) {
        var services = {};

        services.createAdjustment = function(param) {
            return $resource('/wms-app/adjustment').save(param).$promise;
        };

        services.adjustmentMovement = function(param) {
            return $resource('/wms-app/adjustment/movement').save(param).$promise;
        };

        services.saveAdjustment = function (param, approve) {
            if (approve) {
                return services.adjustmentMovement(param);
            } else {
                return services.createAdjustment(param);
            }
        };

        services.searchAdjustments = function(searchParam) {
            return $resource('/bam/wms-app/adjustment/search', null, {'search': {method : 'POST', isArray: true}}).search(searchParam).$promise;
        };

        services.searchAdjustmentsByPaging = function(param) {
            return $resource("/bam/wms-app/adjustment/search-by-paging", null, {
                'postSearch': {
                    method: 'POST'
                }
            }).postSearch(param).$promise;
        };

        services.deleteAdjustment = function(id) {
            return $resource('/wms-app/adjustment/' + id).delete().$promise;
        };

        services.approveAdjustment = function(id) {
            return $resource('/wms-app/adjustment/approve/' + id).get().$promise;
        };

        services.adjustmentStatistics = function() {
            return $resource('/bam/wms-app/adjustment/statistics').get().$promise;
        };

        return services;
    });
});