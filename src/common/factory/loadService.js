'use strict';

define([
    './factories',
    'lodash'
], function (factories, _) {
    factories.factory('loadsService', function ($resource,$q) {
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
        service.searchLoad = function (param) {
            return $resource("/bam/outbound/load/search", {}, resourceConfig).search(param).$promise;
        };
        service.searchLoadByPaging = function(param) {
            return $resource("/bam/outbound/load/search-by-paging", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        service.areAllTransload = function(loadIds) {
            var defer = $q.defer();
            if(loadIds && loadIds.length > 0) {
                   service.searchLoadByPaging({loadIds:loadIds, paging: { pageNo: 1, limit: 100}}).then(function(res){
                       defer.resolve(_.every(res.loads, "isTransload"));
                   }, function(err){
                       defer.resolve(false);
                   });
            } else {
                return defer.resolve(false);
            }
            return defer.promise;
        };

        service.getLoadStatus = function () {
            return $resource('../../data/fd/load-status.json').query().$promise;
        };
        service.getLoadTypes = function () {
            return $resource('../../data/fd/load-type.json').query().$promise;
        };

        service.createLoad = function (param) {
            return $resource("/wms-app/outbound/load").save(param).$promise;
        };

        service.createLoadWithOrderLine = function (param) {
            return $resource("/wms-app/outbound/load-with-order-line").save(param).$promise;
        };

        service.updateLoad = function (load) {
            return $resource("/wms-app/outbound/load/:loadId", { loadId: '@id' }, resourceConfig).update(load).$promise;
        };

        service.batchUpdateLoad = function (load) {
            return $resource("/wms-app/outbound/load/batch", null,resourceConfig).update(load).$promise;
        };

        service.updateLoadWithOrderLines = function (load) {
            return $resource("/wms-app/outbound/load-with-order-line/:loadId", { loadId: '@id' }, resourceConfig).update(load).$promise;
        };
        service.deleteLoad = function (loadId) {
            return $resource("/wms-app/outbound/load/:loadId", { loadId: loadId }).delete().$promise;
        };
        service.getLoad = function (loadId) {
            return $resource("/bam/outbound/load/:loadId", { loadId: loadId }).get().$promise;
        };

        service.addOrderLines = function (loadId, orderIds) {
            return $resource("/wms-app/outbound/load/" + loadId + "/order-line", null, { 'saveOrderLine': { method: 'POST', isArray: true } }).saveOrderLine({ orderIds: orderIds }).$promise;
        };

        service.searchOrderLine = function (param) {
            return $resource("/bam/outbound/load/order/search", {}, {
                'search': {
                    method: 'POST'
                }
            }).search(param).$promise;
        };

        service.deleteOrderLine = function (loadId, orderId) {
            return $resource("/wms-app/outbound/load/" + loadId + "/order-line/" + orderId).delete().$promise;
        };

        service.replaceOrderLines = function (loadId, orders) {
            return $resource("/wms-app/outbound/load/" + loadId + "/order-line", null, { 'replaceOrderLines': { method: 'PUT', isArray: true } }).replaceOrderLines(orders).$promise;
        };

        service.buildLoadOrderSearch = function (param) {
            return $resource("/bam/outbound/order/search-for-buildload", null, { 'search': { 'method': 'POST' } }).search(param).$promise;
        };

        service.searchTruckLoad = function (param) {
            return $resource("/bam/outbound/load/search-for-truck-load", {}, { 'search': { 'method': 'POST' } }).search(param).$promise;
        };

        service.getFileIdByShippingAddress = function (loadId, orderId) {
            return $resource("/wms-app/outbound/bol/:loadId/:orderId/bol-pdf-full-order-by-shipping-address",
                { loadId: loadId, orderId: orderId }).query().$promise;
        };

        service.getFileIdByLoadIdAndOrderId = function (loadId, orderId) {
            return $resource("/wms-app/outbound/bol/:loadId/:orderId/bol-pdf-full-order",
                { loadId: loadId, orderId: orderId }).query().$promise;
        };

        service.UpdateOrderBatch = function (param) {
            return $resource("/wms-app/outbound/order/batch/update", null,resourceConfig).update(param).$promise;
        };
        return service;
    });
});
