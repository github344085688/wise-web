'use strict';

define(['angular', 'lodash'], function(angular, _) {
    return angular.module('wms.outbound.loadOrderSelectService', []).factory('loadOrderSelectService', function() {
        var service = {};
        var _orderLines = [];
        var _load = {};
        service.getLoad = function(){
            return _load;
        };

        service.setLoad = function(load){
            _load = load;
            _orderLines = load.orderLines ? load.orderLines : [];
        };

        service.setOrderLines = function(orderLines) {
            _orderLines = orderLines === undefined ? [] : orderLines;
        };

        service.getOrderLines = function() {
            return _orderLines;
        };

        service.getOrderIds = function() {
           return _.map(_orderLines, "id");
        };

        service.addOrderLines = function(orderLines) {
            service.fromSelect = true;
           _orderLines = _.uniqBy(_.concat(_orderLines, orderLines), 'id');
        };

        service.removeOrderLine = function(id) {
            _.remove(_orderLines, function(o){ return o.id === id;});
        };

        return service;


    });


});
