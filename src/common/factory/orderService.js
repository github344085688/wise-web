'use strict';

define([
    './factories',
    'angular',
    'lodash'
], function(factories, angular, _) {
    factories.factory('orderService', function($resource, lincUtil) {
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
        service.searchOrder = function(param) {
            return $resource("/bam/outbound/order/search",{}, resourceConfig).search(param).$promise;
        };
        service.searchAutoCompleteOrder = function(param) {
            return $resource("/bam/outbound/order/fetch-orders-with-item-line/search",null, { 'search': {
                method: 'POST',
                isArray: false
            }}).search(param).$promise;
        };
     
        service.batchUpdateOrder = function(batchUpdateOrder) {
            return $resource("/wms-app/outbound/order/batch/update" ,{},{"batchUpdate": { method: 'PUT', isArray: true}}).batchUpdate(batchUpdateOrder).$promise;

        };
        
        service.searchOrderItemLine = function(param){
            return $resource('/bam/outbound/batch-order/order-item-line/search', null, { 'search': {
                method: 'POST',
                isArray: false
            }}).search(param).$promise;
        };

        service.searchOrderWithCustomer = function(param) {
            return $resource("/bam/outbound/order/fetch-orders-with-custmer-detail",{}, resourceConfig).search(param).$promise;
        };
        service.simpleSearchOrder = function (param) {
            return $resource("/bam/outbound/order/simple-search",{}, resourceConfig).search(param).$promise;
        };

        service.searchOrderByPaging = function(param) {
            return $resource("/bam/outbound/order/search-by-paging", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        service.fetchItemVelocity = function(param) {
            return $resource("/bam/outbound/order/order-item-line/statistics/velocity", null, {"search": { method: 'POST'}}).search(param).$promise;
        };

        service.searchOrderForCommitment = function(param) {
            return $resource("/bam/outbound/order/search-for-commitment", null, { 'search': { 'method': 'POST' } }).search(param).$promise;
        };

        service.searchOrderForOrderPlanning = function(param) {
            return $resource("/bam/outbound/order/search-for-orderPlanning", null, { 'search': { 'method': 'POST' } }).search(param).$promise;
        };

        service.createOrder = function(param) {
            return $resource("/wms-app/outbound/order").save(param).$promise;
        };

        service.updateOrder = function(orderId, updateOrder) {
            return $resource("/wms-app/outbound/order/:orderId" ,{orderId:orderId}, resourceConfig).update(updateOrder).$promise;

        };
        service.getOrder = function(orderId) {
            return $resource("/bam/outbound/order/:orderId", {orderId:orderId}).get().$promise;
        };

        service.closeOrder = function(orderId) {
            return $resource("/wms-app/outbound/order/:orderId/close" ,{orderId:orderId}, resourceConfig).update().$promise;
        };

        service.forceCloseOrder = function(orderId) {
            return $resource("/wms-app/outbound/order/:orderId/force-close" ,{orderId:orderId}, resourceConfig).update().$promise;
        };

        service.cancelOrder = function(orderId) {
            return $resource("/wms-app/outbound/order/:orderId/cancel" ,{orderId:orderId}, resourceConfig).update().$promise;
        };

        service.reopenOrder = function(orderId) {
            return $resource("/wms-app/outbound/order/:orderId/reopen" ,{orderId:orderId}, resourceConfig).update().$promise;
        };

        service.deleteOrder = function(orderId) {
            return $resource("/wms-app/outbound/order/:orderId", {orderId:orderId}).delete().$promise;
        };

        service.createOrderItemLine = function(orderId, itemLine) {
            return $resource("/wms-app/outbound/order/" + orderId + "/item-line").save(itemLine).$promise;
        };

        service.updateOrderItemLine = function(orderId, itemLineId, itemLine) {
            return $resource("/wms-app/outbound/order/" + orderId + "/item-line/" + itemLineId,
                {}, resourceConfig).update(itemLine).$promise;
        };

        service.deleteOrderItemLine = function(orderId, itemLineId) {
            return $resource("/wms-app/outbound/order/" + orderId + "/item-line/" + itemLineId).delete().$promise;
        };

        service.getOrderItemLine = function(orderId, itemLineId) {
            return $resource("/wms-app/outbound/order/" + orderId + "/item-line/" + itemLineId).get().$promise;
        };

        service.cloneOrder = function (orderId) {
            return $resource("/wms-app/outbound/order/:orderId/clone" ,{orderId:orderId},{ 'clone': {
                method: 'POST'
            }}).clone().$promise;
        };

        service.rollBackOrder = function (orderId, toStatus) {
            return $resource("/wms-app/outbound/order/:orderId/revert" ,{orderId:orderId},resourceConfig).update(toStatus).$promise;
        };

        service.getBatchCommitmentNos = function(param) {
            return $resource("/wms-app/outbound/order/batch-commitment-nos", null, {'search': { 'method': 'POST' }}).search(param).$promise;
        };

        service.separatePartialCommitmentOrders = function(orderIds) {
            return $resource("/wms-app/outbound/order/separate-order", null, {'post': { 'method': 'POST',  isArray: true }}).post(orderIds).$promise;
        };

        service.calcOrderWeights= function(checkedOrders) {
            var totalSelectWeight = "";
            var weightGroup = _.groupBy(checkedOrders, "weightUnit");
            _.forEach(weightGroup, function (weightList, uom) {
                var total = 0;
                _.forEach(weightList, function (weight) {
                    total += Number(weight.totalWeight);
                });
                total = total.toFixed(2);
                totalSelectWeight += total +" "+ uom + ".";
            });
            return totalSelectWeight;
        }

        service.getOrderItemTop = function() {
            return $resource("/bam/outbound/order-plan/order-item-top", null, {'getData': { 'method': 'GET',  isArray: true }}).getData().$promise;
        };

        service.createOrderItemTop = function(param) {
            return $resource("/wms-app/outbound/order-plan/calculate-top-item", null, resourceConfig).update(param).$promise;
        };

        service.deleteOrderItemTop = function(ids) {
            return $resource("/wms-app/outbound/order-plan/order-item-top/batch-delete", null, resourceConfig).update({orderIds: ids}).$promise;
        };

        service.createItemPreferedPickVLG = function(param) {
            return $resource("/wms-app/outbound/order-plan/item-prefered-pick-vlg", null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };

        service.getItemPreferedPickVLG = function() {
            return $resource("/bam/outbound/order-plan/item-prefered-pick-vlg", null, {'getData': { 'method': 'GET',  isArray: true }}).getData().$promise;
        };

        service.setUseVLG = function(flag) {
            return $resource("/wms-app/outbound/pick-strategy/config/use-virtual-location-group/"+ flag, null, resourceConfig).update().$promise;
        };

        service.ItemPreferedPickVLGConfiguration  = function() {
            return $resource("/bam/outbound/order-plan/item-prefered-pick-vlg/configuration", null, {'getData': { 'method': 'GET',  isArray: true }}).getData().$promise;
        };

        service.deleteItemPreferedPickVLGConfiguration = function(id) {
            return $resource("/wms-app/outbound/order-plan/item-prefered-pick-vlg/configuration/"+id).delete().$promise;
        };

        service.updateItemPreferedPickVLGConfiguration = function(ItemPreferedPickVLG) {
            return $resource("/wms-app/outbound/order-plan/item-prefered-pick-vlg/configuration/" + ItemPreferedPickVLG.id, null, resourceConfig).update(ItemPreferedPickVLG).$promise;
        };

        service.batchCloseOrder = function(orderIds) {
            return $resource("/bam/outbound/order/close/batch" ,{}, resourceConfig).update({orderIds:orderIds}).$promise;
        };

        service.searchOrderLineLpTemplate = function (param) {
            return $resource("/bam/order/item-line/lp-template/search", null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };  


        service.getPackingListShippingLabelTogetherByTrackingNo = function(trackingNo) {
            return $resource("/wms-app/outbound/order/packing-list/:trackingNo/print", {trackingNo: trackingNo}).get().$promise;
        };

        service.getPackingListOnlyFileIDByTrackingNo = function(trackingNo) {
            return $resource("/wms-app/outbound/order/packing-list-only/:trackingNo/print", {trackingNo: trackingNo}).get().$promise;
        };

        service.batchImportSyncOrderToHon = function(param) {
            return $resource("/bam/edi/outbound/order/batch-import/sync-order-to-hon",
                {}, resourceConfig).search(param).$promise;
        };

        service.singleSyncOrderToHon = function(orderId) {
            return $resource("/bam/edi/outbound/order/sync-order-to-hon",
                {}, resourceConfig).search({orderId:orderId}).$promise;
        };

        return service;
    });
});
