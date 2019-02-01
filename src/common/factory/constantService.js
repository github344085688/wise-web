'use strict';

define([
    './factories'
], function (factories) {
    factories.factory('constantService', function () {
        var service = {};

        service.getOrderPlanItemLineGroupFields = function () {
            return [{key: "Pick Type", value: "pickType" },
                {key: "Location Group Type", value: "locationGroupType"},
                {label:"Order ID", name: "orderId"},
                {label:"Title", name: "titleId"},
                {label:"Item", name: "itemSpecId"},
                {label:"Virtural Location Group Name", name: "virturalLocationGroupName"},
                {label:"Location Group Type", name: "locationGroupType"},
                {label:"Location", name: "locationId"},
                {label:"LP", name: "lpId"},
                {label:"Pick Type", name: "pickType"},
                {label:"Item Line Weight", name: "itemWeight"},
                {label:"Carrier", name: "carrierId"}];
        };

        return service;
    });
});
