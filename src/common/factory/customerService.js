'use strict';

define([
    './factories'
], function (factories) {

    factories.factory('customerService', function ($q, $resource) {
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

        service.getCustomerDetailByOrgId = function (orgId) {
            var url = linc.config.contextPath + "/shared/bam/customer/:orgId";
            return $resource(url).get({
                orgId: orgId
            }).$promise;
        };

        service.getCustomerByOrgId = function (orgId) {
            return $resource('/fd-app/customer/:orgId').get({
                orgId: orgId
            }).$promise;
        };

        service.searchCustomer = function (params) {
            return $resource("/fd-app/customer/search", null, resourceConfig).search(params).$promise;
        };

        service.updateCustomer = function (customer) {
            return $resource("/fd-app/customer/:orgId", { orgId: customer.orgId }, resourceConfig).update(customer).$promise;
        };

        service.createCustomer = function (customer) {
            return $resource("/fd-app/customer", {}, resourceConfig).save(customer).$promise;
        };

        service.deleteCustomer = function (orgId) {
            return $resource("/fd-app/customer/:orgId", { orgId: orgId }).delete().$promise;
        };

        service.getReceiptItemLineDynamicFields = function (orgId) {
            return $resource("/fd-app/customer/:orgId/receipt-item-line-dynamic-fields",
                { orgId: orgId }).get().$promise;
        };

        service.getOrderItemLineDynamicFields = function (orgId) {
            return $resource("/fd-app/customer/:orgId/order-item-line-dynamic-fields",
                { orgId: orgId }).get().$promise;
        };

        service.getOrderDynamicFields = function (orgId) {
            return $resource("/fd-app/customer/:orgId/order-dynamic-fields",
                { orgId: orgId }).get().$promise;
        };

        service.getReceiptDynamicFields = function (orgId) {
            return $resource("/fd-app/customer/:orgId/receipt-dynamic-fields",
                { orgId: orgId }).get().$promise;
        };

        return service;
    });
});
