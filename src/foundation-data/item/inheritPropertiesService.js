'use strict';

define(['angular'], function(angular) {
    var inheritPropertiesFactory = function(itemService, customerService, itemPropertyService) {
        var service = {};
        service.inheritPropertiesFromCustomerByCustomerId = function(obj, customerId){
            customerService.getCustomerByOrgId(customerId).then(function (customer) {
                service.inheritPropertiesFromCustomer(obj, customer);
            });
        };

        service.inheritPropertiesFromCustomer = function(obj, customer) {
            obj.lpConfigurationTemplateId = customer.defaultLpConfigurationTemplateId;
            obj.hasSerialNumber = customer.hasSerialNumber? true : false;
            obj.isAllowKitting = customer.isAllowKitting? true : false;
            obj.shippingRule = customer.shippingRule;
            obj.locationGroupId = customer.locationGroupId;
            obj.allowOverWriteItem = customer.allowOverWriteItem;

            obj.requireCollectLotNoOnReceive = customer.requireCollectLotNoOnReceive? true : false;
            obj.requireCollectExpirationDateOnReceive = customer.requireCollectExpirationDateOnReceive? true : false;
            obj.requireCollectMfgDateOnReceive = customer.requireCollectMfgDateOnReceive? true : false;
            obj.requireCollectShelfLifeDaysOnReceive = customer.requireCollectShelfLifeDaysOnReceive? true : false;
        };


        service.inheritPropertiesFromGroupByGroupId = function(obj, groupId){
            itemPropertyService.getItemPropertyGroupById(groupId).then(function (group) {
                service.inheritPropertiesFromGroup(obj,  group);
            });
        };

        service.inheritPropertiesFromGroup = function(obj, group) {
            obj.tags = group.tags;
            obj.commodityDescription = group.commodityDescription;
            obj.nmfc = group.nmfc;
            obj.freightClass = group.freightClass;
            obj.grade = group.grade;
            obj.bundle = group.bundle? true : false;
            obj.hasSerialNumber = group.hasSerialNumber? true : false;
            obj.serialNoLength = group.serialNoLength;
            obj.validationInboundSerialNo = group.validationInboundSerialNo? true : false;
            obj.validationOutboundSerialNo = group.validationOutboundSerialNo? true : false;
            obj.validatedOutboundSerialNoAgainstInbound = group.validatedOutboundSerialNoAgainstInbound? true : false;
            obj.serialNoScanLotNoCheck = group.serialNoScanLotNoCheck? true : false;

            obj.requireCollectLotNoOnReceive = group.requireCollectLotNoOnReceive? true : false;
            obj.requireCollectExpirationDateOnReceive = group.requireCollectExpirationDateOnReceive? true : false;
            obj.requireCollectMfgDateOnReceive = group.requireCollectMfgDateOnReceive? true : false;
            obj.requireCollectShelfLifeDaysOnReceive = group.requireCollectShelfLifeDaysOnReceive? true : false;

            obj.allowOverWriteItem = group.allowOverWriteItem;
            obj.shippingRule = group.shippingRule;
            obj.locationGroupId = group.locationGroupId;
            
            obj.labels = group.labels;
            obj.isHazardousMaterial = group.isHazardousMaterial? true : false;
            obj.countryOrigin = group.countryOrigin;
        };

        return service;
    }
    inheritPropertiesFactory.$inject = ['itemService', 'customerService', 'itemPropertyService'];
    return inheritPropertiesFactory;
});
