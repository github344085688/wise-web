'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('receiptService', function($resource, lincUtil) {
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
        service.searchReceipt = function(param) {
            return $resource("/bam/inbound/receipt/search",{}, resourceConfig).search(param).$promise;
        };
        service.searchReceipByPaging = function(param) {
            return $resource("/bam/inbound/receipt/search-by-paging", null, {"search": { method: 'POST'}}).search(param).$promise;
        };
        
        service.createReceipt = function(param) {
            return $resource("/wms-app/inbound/receipt").save(param).$promise;
        };

        service.updateReceipt = function(receipt) {
            return $resource("/wms-app/inbound/receipt/:receiptId",{receiptId:receipt.id}, resourceConfig).update(receipt).$promise;
        };

        service.getReceipt = function(receiptId) {
            return $resource("/bam/inbound/receipt/:receiptId", {receiptId:receiptId}).get().$promise;
        };

        service.getReceiptPhotos = function(receiptId) {
            return $resource("/bam/inbound/receipt/:receiptId/photos", {receiptId:receiptId}).get().$promise;
        };

        service.deleteReceipt = function(receiptId) {
            return $resource("/wms-app/inbound/receipt/:receiptId", {receiptId:receiptId}).delete().$promise;
        };

        service.createReceiptItemLine = function(receiptId, itemLine) {
            return $resource("/wms-app/inbound/receipt/" + receiptId + "/item-line").save(itemLine).$promise;
        };

        service.updateReceiptItemLine = function(receiptId, itemLineId, itemLine) {
            return $resource("/wms-app/inbound/receipt/" + receiptId + "/item-line/" + itemLineId,
                {}, resourceConfig).update(itemLine).$promise;
        };

        service.updateReceiptItemLineSNDetail = function(receiptId, itemLineId, snDetails) {
            return $resource("/wms-app/inbound/receipt/" + receiptId + "/item-line/" + itemLineId + "/sn-detail",
                {}, resourceConfig).update(snDetails).$promise;
        };

        service.deleteReceiptItemLine = function(receiptId, itemLineId) {
            return $resource("/wms-app/inbound/receipt/" + receiptId + "/item-line/" + itemLineId).delete().$promise;
        };

        service.getReceiptItemLine = function(receiptId, itemLineId) {
            return $resource("/wms-app/inbound/receipt/" + receiptId + "/item-line/" + itemLineId).get().$promise;
        };

        service.forceCloseReceipt = function (receiptId, resonInfo) {
            return $resource("/wms-app/inbound/receipt/:receiptId/force-close", {receiptId: receiptId}, resourceConfig).update(resonInfo).$promise;
        };
        
        service.reopenReceipt = function (receiptId) {
            return $resource("/wms-app/inbound/receipt/:receiptId/reopen", {receiptId: receiptId}, resourceConfig).update().$promise;
        };

        service.cancelReceipt = function(receiptId, resonInfo) {
            return $resource("/wms-app/inbound/receipt/:receiptId/cancel", {receiptId:receiptId}, resourceConfig).update(resonInfo).$promise;
        };

        service.closeReceipt = function (receiptId) {
            return $resource("/wms-app/inbound/receipt/:receiptId/close", {receiptId: receiptId}, resourceConfig).update().$promise;
        };

        service.getFieldEditableSet = function (receiptStatus, isItemLineLevel, cbFun){
            $resource('../../data/wms/editable-setting-for-receipt.json').get().$promise.then(function (obj) {
                var isDisabledMap = lincUtil.organizationFieldIsDisabledMap(obj, receiptStatus, isItemLineLevel)
                cbFun(isDisabledMap);
            });
        };

        
        service.batchImportSyncReceiptToHon = function(param) {
            return $resource("/bam/edi/inbound/receipt/batch-import/sync-receipt-to-hon",
                {}, resourceConfig).search(param).$promise;
        };

        service.singleSyncReceiptToHon = function(receiptId) {
            return $resource("/bam/edi/inbound/receipt/sync-receipt-to-hon ",
                {}, resourceConfig).search({receiptId:receiptId}).$promise;
        };

        
        return service;
    });
});
