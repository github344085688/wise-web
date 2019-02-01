'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('itemService', function ($resource) {
        var service = {};

        service.getItemById = function (itemSpecId) {
            return $resource('/bam/item-spec/:id').get({ id: itemSpecId }).$promise;
        };

        service.itemFieldBatchUpdate = function (item) {
            return $resource("/fd-app/item-spec/batchUpdate", null, { "update": { method: 'PUT', isArray: true } }).update(item).$promise;
        };
        service.getItemByIdAndProductId = function (itemSpecId, productId, selectOptionsFromProducts, statuses) {
            var searchParam = {
                itemSpecId: itemSpecId,
                productId: productId,
                selectOptionsFromProducts: selectOptionsFromProducts,
                statuses: statuses
            };
            return $resource("/bam/item-spec/get-item-fields", {}, {
                'search': {
                    method: 'POST'
                }
            }).search(searchParam).$promise;
        };

        service.getItemsByIds = function (param) {
            return $resource("/fd-app/item-specs", {}, {
                'search': {
                    method: 'POST',
                    isArray: true
                }
            }).search({ ids: param }).$promise;
        };

        service.getItemByGroupType = function (type) {
            return $resource('/bam/item-spec/get-by-type/:type').query({ type: type }).$promise;
        };

        service.searchItemWithGroupType = function (param) {
            return $resource('/bam/item-spec/search-with-type', null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };

        service.itemSearch = function (param) {
            return $resource("/fd-app/item-spec/search", null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };
        
        service.itemBasicSearch = function (param) {
            return $resource("/bam/item-spec/basic-search", null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };

        service.combineEmptyCustomerSearch = function (param) {
            return $resource("/bam/item-spec/combine-empty-customer-search", null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };

        service.itemUpcCollectSearch = function (param) {
            return $resource("/fd-app/item-upc-collect/search", null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };

        service.itemUpcCollectApprove = function (upc) {
            return $resource("/fd-app/item-upc-collect/:id/approve", null, { "update": { method: 'PUT' } }).update({ id: upc.id }, upc).$promise;
        };
       
        service.itemDetailInfoSearch = function (param) {
            return $resource("/bam/item-spec/search", null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };

        service.itemDetailInfoSearchByPaging = function (param) {
            return $resource("/bam/item-spec/search-by-paging", null, { "postQuery": { method: 'POST'} }).postQuery(param).$promise;
        };

        service.addItemSpec = function (item) {
            return $resource("/fd-app/item-spec").save(item).$promise;
        };

        service.updateItemSpec = function (item) {
            return $resource("/fd-app/item-spec/:id", null, { "update": { method: 'PUT' } }).update({ id: item.id }, item).$promise;
        };

        service.createItemSNValidationRule = function (param) {
            return $resource("/fd-app/item-sn-validate-rule", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };

        service.searchItemSNValidationRule = function (param) {
            return $resource("/fd-app/item-sn-validate-rule/search", null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };

        service.updateItemSNValidationRule = function (item) {
            return $resource("/fd-app/item-sn-validate-rule/:id", null, { "update": { method: 'PUT' } }).update({ id: item.id }, item).$promise;
        };

        service.deleteItemSNValidationRule = function (itemSNValidationRule) {
            return $resource("/fd-app/item-sn-validate-rule/:id",{id:itemSNValidationRule.id}).delete().$promise;
        };

        /* Item AKA */
        service.getItemAkaByItemId = function (akaId) {
            return $resource("/fd-app/item-aka/:id").get({ id: akaId }).$promise;
        };

        service.updateItemAkaById = function (akaId, param) {
            return $resource("/fd-app/item-aka/:id", null, { "update": { method: 'PUT' } }).update({ id: akaId }, param).$promise;
        };
        service.addItemAka = function (itemAka) {
            return $resource("/fd-app/item-aka").save(itemAka).$promise;
        };
        service.itemAkaSearch = function (param) {
            return $resource("/bam/item-aka/search", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };
        service.removeItemAka = function (akaId) {
            return $resource("/fd-app/item-aka/:id").delete({ id: akaId }).$promise;
        };

        /*Item Unit*/
        service.getUnitsByCustomerId = function (orgId) {
            return $resource("/fd-app/item-unit/customer/:customerId").query({customerId: orgId}).$promise;
        };

        service.searchItemUnits = function (param) {
            return $resource("/bam/item-unit/search", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };

        service.searchKittingItems = function (param) {
            return $resource("/bam/kitting-item/search", null, { "postQuery": { method: 'POST' , isArray: true} }).postQuery(param).$promise;
        };

        service.updateItemUnit = function (unit) {
            return $resource("/fd-app/item-unit/:id", null, { "update": { method: 'PUT' } }).update({ id: unit.id }, unit).$promise;
        };

        service.addItemUnit = function (unit) {
            return $resource("/fd-app/item-unit").save(unit).$promise;
        };

        service.removeItemUnit = function (id) {
            return $resource("/fd-app/item-unit/:id").delete({ id: id }).$promise;
        };

        /*Item Unit Pick Setting*/

        service.searchItemUnitGroup  = function (param) {
            return $resource("/fd-app/pick-strategy/item-unit-group/search", null, { "postQuery": { method: 'POST',isArray:true } }).postQuery(param).$promise;
        };

        service.updateItemUnitGroup  = function (unit) {
            return $resource("/fd-app/pick-strategy/item-unit-group/:id", null, { "update": { method: 'PUT' } }).update({ id: unit.id }, unit).$promise;
        };

        service.createItemUnitGroup = function (unit) {
            return $resource("/fd-app/pick-strategy/item-unit-group").save(unit).$promise;
        };

        service.deleteItemUnitGroup  = function (id) {
            return $resource("/fd-app/pick-strategy/item-unit-group/:id").delete({ id: id }).$promise;
        };

        /*Replenishment*/
        service.getReplenishmentsByItemId = function (itemSpecId) {
            return $resource("/fd-app/item-replenishment/:id").get({ id: itemSpecId }).$promise;
        };


        service.updateReplenishments = function (replenishment) {
            return $resource("/fd-app/item-replenishment/:id", null, { "update": { method: 'PUT' } }).update({ id: replenishment.id }, replenishment).$promise;
        };

        /*LP Config*/

        service.getLPConfig = function(lpConfigId) {
            return $resource("/fd-app/item-lp/:id").get({ id: lpConfigId }).$promise;
        };

        service.searchLPConfigs = function (param) {
            return $resource("/bam/lp/search", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };
        service.searchLPConfiguration = function (param) {
            return $resource("/fd-app/item-lp/search", null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };
        service.addLPConfig = function (lpConfig) {
            return $resource("/fd-app/item-lp").save(lpConfig).$promise;
        };

        service.updateLPConfig = function (lpConfig) {
            return $resource("/fd-app/item-lp/:id", null, { "update": { method: 'PUT' } }).update({ id: lpConfig.id }, lpConfig).$promise;
        };

        service.removeLPConfig = function (id) {
            return $resource("/fd-app/item-lp/:id").delete({ id: id }).$promise;
        };
        /*Material Template*/

        service.searchItemMateriaTemplate = function (param) {
            return $resource("/bam/item/material-template/search", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };

        service.addItemMateriaTemplate = function (materialTemplate) {
            return $resource("/fd-app/item/material-template").save(materialTemplate).$promise;
        };

        service.updateItemMateriaTemplate = function (materialTemplate) {
            return $resource("/fd-app/item/material-template/:id", null, { "update": { method: 'PUT' } }).update({ id: materialTemplate.id }, materialTemplate).$promise;
        };

        service.removeItemMateriaTemplate = function (id) {
            return $resource("/fd-app/item/material-template/:id").delete({ id: id }).$promise;
        };
        service.getItemMateriaTemplate = function (id) {
            return $resource("/fd-app/item/material-template/:id", { id: id }).get().$promise;
        };
        /*end Material Template*/

        /*Bundle*/
        service.searchBundle = function (param) {
            return $resource("/bam/item-spec/search-diverse-item-bundle", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };

        service.getBundle = function (param) {
            return $resource("/bam/item-spec/get-bundle-by-id", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };

        service.addBundle = function (shippingRule) {
            return $resource("/fd-app/item-bundle").save(shippingRule).$promise;
        };

        service.updateBundle = function (bundle) {
            return $resource("/fd-app/item-bundle/:id", null, { "update": { method: 'PUT' } }).update({ id: bundle.id }, bundle).$promise;
        };

        service.removeBundle = function (id) {
            return $resource("/fd-app/item-bundle/:id").delete({ id: id }).$promise;
        };
        /*end bundle*/

        service.getItemSpecDefinition = function (id) {
            return $resource('/fd-app/diverse-item-spec-definition/:id', { id: id }).get().$promise;
        };

        service.searchOrUpadateDiverse = function (itemSpecId, propertyList) {
            var param = { itemSpecId: itemSpecId, diverseProperties: propertyList };
            return $resource('/bam/item-spec/diverse/search-or-update', null, { "searchOrUpdate": { method: 'POST' } }).searchOrUpdate(param).$promise;
        };

        service.getDiverseByItemSpec = function (itemSpecId) {
            return $resource('/bam/item-spec/diverse/:itemSpecId').get({ itemSpecId: itemSpecId }).$promise;
        };

        /*PICK RULE*/
        service.searchPickRules = function (param) {
            return $resource("/fd-app/item-pick/order-pick-rule/search", null,
                { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };

        service.addPickRule = function (pickRule) {
            return $resource("/fd-app/item-pick/order-pick-rule").save(pickRule).$promise;
        };

        service.updatePickRule = function (pickRule) {
            return $resource("/fd-app/item-pick/order-pick-rule/:id", null, {
                "update": { method: 'PUT' }
            }).update({ id: pickRule.id }, pickRule).$promise;
        };

        service.removePickRule = function (id) {
            return $resource("/fd-app/item-pick/order-pick-rule/:id").delete({ id: id }).$promise;
        };

        service.addDiverse = function (diverse) {
            return $resource("/fd-app/item-spec/diverse").save(diverse).$promise;
        };

        service.updateDiverse = function (diverse) {
            return $resource("/fd-app/item-spec/diverse/:id", null, { "update": { method: 'PUT' } }).update({ id: diverse.id }, diverse).$promise;
        };

        service.updateDiverseByItemSpecId = function (itemSpecId, diverse) {
            return $resource("/fd-app/item-spec/diverse/item-spec-id/:itemSpecId", null, { "update": { method: 'PUT' } }).update({ itemSpecId: itemSpecId }, diverse).$promise;
        };

        service.diverseSearch = function (param) {
            return $resource("/fd-app/item-spec/diverse/search", null,
                { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };

        /*Item Picture*/
        service.addItemPicture = function (itemPicture) {
            return $resource("/fd-app/item-picture").save(itemPicture).$promise;
        };

        service.removeItemPicture = function (id) {
            return $resource("/fd-app/item-picture/:id").delete({ id: id }).$promise;
        };

        service.searchItemPictures = function (param) {
            return $resource("/fd-app/item-picture/search", null, { "search": { method: 'POST', isArray: true } }).search(param).$promise;
        };

        /*Shipping rule*/
        service.searchShippingRules = function (param) {
            return $resource("/bam/item-spec/search-diverse-shipping-rule", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };

        service.addShippingRule = function (shippingRule) {
            return $resource("/fd-app/item-shipping-rule").save(shippingRule).$promise;
        };

        service.updateShippingRule = function (shippingRule) {
            return $resource("/fd-app/item-shipping-rule/:id", null, {
                "update": { method: 'PUT' }
            }).update({ id: shippingRule.id }, shippingRule).$promise;
        };

        service.removeShippingRule = function (id) {
            return $resource("/fd-app/item-shipping-rule/:id").delete({ id: id }).$promise;
        };

        service.getImportFields = function () {
            return $resource('/fd-app/item-import/get-field').get().$promise;
        };

        service.getImportRecord = function (customerId) {
            return $resource('/fd-app/item-import/get-record/:customerId', null, { 'getRecord': { method: 'get', isArray: true } }).getRecord({customerId:customerId}).$promise;
        };

        service.importItem = function (param) {
            return $resource('/fd-app/item-import').save(param).$promise;
        };

        service.revertItemImport = function (param) {
            return $resource("/fd-app/item-import/revert", null, { 'revert': { method: 'POST' } }).revert(param).$promise;
        };

        service.clearRecord = function () {
            return $resource('/fd-app/item-import/clear-record').get().$promise;
        };

        service.getCartonConfigById = function (id) {
            var entry = $resource("/fd-app/item-lp-multiple-configuration/:id");
            return entry.get({ id: id }).$promise;
        };

        service.removeCartonConfigById = function (id) {
            var entry = $resource("/fd-app/item-lp-multiple-configuration/:id");
            return entry.delete({ id: id }).$promise;
        };

        service.searchCartonConfigs = function (param) {
            var entry = $resource("/bam/item-lp-multiple-configuration/search", null, { 'postQuery': { method: 'POST' } });
            return entry.postQuery(param).$promise;
        };

        service.addCartonConfig = function (cartonConfig) {
            var entry = $resource("/fd-app/item-lp-multiple-configuration");
            return entry.save(cartonConfig).$promise;
        };

        service.updateCartonConfig = function (cartonConfig) {
            var entry = $resource("/fd-app/item-lp-multiple-configuration/:id", null, { 'update': { method: 'PUT' } });
            return entry.update({ id: cartonConfig.id }, cartonConfig).$promise;
        };

        /* Mapping Service*/
        service.searchMappingItem = function (param) {
            return $resource("/fd-app/item-import/mapping/search", {}, {
                'search': {
                    method: 'POST',
                    isArray:true
                }
            }).search(param).$promise;
        };

        service.addMappingItem = function (param) {
            return $resource("/fd-app/item-import/mapping", {}, {
                'save': {
                    method: 'POST',
                }
            }).save(param).$promise;
        };

        service.searchMappingKitting = function (param) {
            return $resource("/fd-app/kitting-import/mapping/search", {}, {
                'search': {
                    method: 'POST',
                    isArray:true
                }
            }).search(param).$promise;
        };

        service.addMappingKitting = function (param) {
            return $resource("/fd-app/kitting-import/mapping", {}, {
                'save': {
                    method: 'POST',
                }
            }).save(param).$promise;
        };

        return service;
    });
});
