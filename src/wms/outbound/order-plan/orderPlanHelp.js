'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var orderPlanHelp = function () {
        var service = {};
        var _orderLines
        var _orderPlan;

        service.setOrderLines = function(orderLines) {
            _orderLines = orderLines === undefined ? [] : orderLines;
        };

        service.getOrderLines = function() {
            return _orderLines;
        };

        service.setOrderPlan = function(orderPlan) {
            _orderPlan = orderPlan;
        };

        service.getOrderPlan = function() {
            return _orderPlan;
        };

        return service;
    };
    return orderPlanHelp;
});
