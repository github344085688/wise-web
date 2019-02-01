'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('orderPlanService', function($resource) {
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

        service.searchOrderPlan = function(param) {
            return $resource("/bam/outbound/order-plan/search",{}, resourceConfig).search(param).$promise;
        };

        service.searchOrderPlanByPaging = function(param) {
            return $resource("/bam/outbound/order-plan/search-by-paging", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        service.createOrderPlan = function(orderPlan) {
            return $resource("/wms-app/outbound/order-plan").save(orderPlan).$promise;
        };

        service.pickStrategies = function(orderPlanId) {
            return $resource("/wms-app/outbound/order-plan/:id/suggest",{id: orderPlanId}, resourceConfig).update().$promise;
        };

        service.updateOrderPlan = function(orderPlan) {
            return $resource("/wms-app/outbound/order-plan/:id",{id :orderPlan.id}, resourceConfig).update(orderPlan).$promise;
        };

        service.getOrderPlan = function(id) {
            return $resource("/bam/outbound/order-plan/:id", {id: id}).get().$promise;
        };

        service.checkOrderPlan = function(id) {
            return $resource("/bam/outbound/order-plan/:id/pick-strategy/validate", {id: id}).get().$promise;
        };

        service.deleteOrderPlan = function(id) {
            return $resource("/wms-app/outbound/order-plan/:id", {id: id}).delete().$promise;
        };

        service.createTask = function(id, groupItemLines) {
            return $resource("/wms-app/outbound/order-plan/:id/task/create", {id: id}, resourceConfig).update(groupItemLines).$promise;
        };

        service.createTaskDirectly = function(id, groupItemLines) {
            return $resource("/wms-app/outbound/order-plan/:id/task/create/directly", {id: id}, resourceConfig).update(groupItemLines).$promise;
        };
        service.schedule = function(id, time) {
            return $resource("/wms-app/outbound/order-plan/:id/schedule", {id: id}, resourceConfig).update(time).$promise;
        };

        service.rollback = function(id, time) {
            return $resource("/wms-app/outbound/order-plan/:id/rollback", {id: id}, resourceConfig).update(time).$promise;
        };

        service.release = function(id) {
            return $resource("/wms-app/outbound/order-plan/:id/release", {id: id}, resourceConfig).update().$promise;
        };

        service.searchPickStrategy = function(param) {
            return $resource("/bam/outbound/pick/strategy/search", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        
        return service;
    });
});
