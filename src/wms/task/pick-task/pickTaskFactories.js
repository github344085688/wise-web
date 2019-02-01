'use strict';

define(['angular', 'lodash',  'src/common/factory/factories'
], function(angular, _, factories) {
    factories.factory('pickTaskFactory', ['orderService', 'pickService', function(orderService, pickService) {
        var service = {};

        service.organizationSummaryByOrderId = function (orderIds, cbFun, ifHasTask) {
             pickService.searchOrdersForPickTask({orderIds: orderIds}).then(function(orders) {
                  var summary = service.organizationSummary(orders, ifHasTask);
                  cbFun(summary);
             },function(error){
                lincUtil.processErrorResponse(error);
             });
        };

        service.organizationSummary = function (orders, ifHasTask) {
             var summary = {orderIds: [], pickedItems:[]};
             var pickStrategies = [];
             summary.pickType = orders[0].pickType;
             summary.pickWay = orders[0].pickWay;
             angular.forEach(orders, function (order) {
                 summary.orderIds.push(order.id);
                 if(order.strategies) {
                     pickStrategies = _.concat(pickStrategies, order.strategies);
                 }
             });
             pickStrategies = combineStategiesSameLocation(pickStrategies);
             organizationPickItems(pickStrategies, summary, ifHasTask);
             return summary;
        };

        service.organizationOrderPickItemLines = function (order) {
            var pickItemLines = [];
            var strategies =order.strategies;
            angular.forEach(strategies, function (stragety) {
                var pickItemLine =service.createPickItemLine(stragety, stragety.baseQty);
                pickItemLines.push(pickItemLine);
            });
            return pickItemLines;
        }

        function combineStategiesSameLocation(pickStrategies) {
            var pickStrategies1 = angular.copy(pickStrategies);
            var groupStrategies = _.groupBy(pickStrategies1, function (o) {
                return o.itemSpecId + "_" +  o.unitId + "_" + o.productId + o.locationId;
            });
            _.forIn(groupStrategies, function(locationStrategies, key) {
                if(locationStrategies.length > 1)
                {
                    var baseQty = _.reduce(locationStrategies, function (baseQty, locationStrategy) {
                        return locationStrategy.baseQty + baseQty;
                    }, 0);
                    locationStrategies[0].baseQty = baseQty;
                    groupStrategies[key] = [locationStrategies[0]];
                }
            });

            var strategies1 = [];
            _.forIn(groupStrategies, function(arr) {
                strategies1 = _.concat(strategies1, arr);
            });
            return strategies1;
        }

        function organizationPickItems(pickStrategies, summary, ifHasTask) {
            var totalQtyMap = {};
            if(pickStrategies.length > 0)
            {
                var groupStrategies = _.groupBy(pickStrategies, function (o) {
                    return o.itemSpecId + "_" +  o.unitId + "_" + o.productId;
                });
                _.forIn(groupStrategies, function(strategies) {
                        var baseQty = 0;
                        var pickedItem = angular.copy(strategies[0]);
                        _.forEach(strategies, function(strategy) {
                            baseQty = baseQty + strategy.baseQty;
                            // _.forEach(strategies, function(strategy) {
                            var qtyMapKey = service.getKey(strategy);
                            totalQtyMap[qtyMapKey] =  strategy.baseQty;
                            if(ifHasTask) strategy.remainQty = 0;
                            else strategy.remainQty = strategy.baseQty;
                            // });
                        });
                        pickedItem.baseQty = baseQty;
                        pickedItem.strategies = strategies;
                        summary.strategies = pickStrategies;
                        // pickedItem.totalPickBaseQty = pickedItem.strategies.reduce(function(qty, strategy) {return qty + strategy.baseQty;}, 0);
                        summary.pickedItems.push(pickedItem);
                        summary.totalQtyMap = totalQtyMap;
                });
            }
        }

        service.createSubTaskByRemainQty = function(sumarry, remainQtyMap, cbFun) {
            var subTask = {};
            var pickItemLines = [];
            var itemNum = sumarry.pickedItems.length;
            angular.forEach(sumarry.pickedItems, function (pickedItem, key1) {
                var locationNum = pickedItem.strategies.length;
                angular.forEach(pickedItem.strategies, function(strategy, key2) {
                    var key = service.getKey(strategy);
                    var remainQty = remainQtyMap[key];
                    if(remainQty > 0)
                    {
                        var pickItemLine = service.createPickItemLine(strategy, remainQty);
                        pickItemLines.push(angular.copy(pickItemLine));
                    }
                    if(key1 == itemNum - 1 && key2 == locationNum - 1)
                    {
                        subTask.pickItemLines = pickItemLines;
                        cbFun(subTask);
                    }
                });
            });
        };

        service.organizationDireceCreateTaskItemLines= function(itemLines, cbFun) {
            var pickItemLines = [];
            var itemNum = itemLines.length;
            angular.forEach(itemLines, function (itemLine, key1) {
                var locationNum = itemLine.locations.length;
                angular.forEach(itemLine.locations, function(location, key2) {
                    var pickItemLine = organizationDireceCreateTaskItemLine(itemLine, location);
                    pickItemLines.push(pickItemLine);
                    if(key1 == itemNum - 1 && key2 == locationNum - 1)
                    {
                        cbFun(pickItemLines);
                    }
                });
            });
        };
        
        function organizationDireceCreateTaskItemLine(itemLine, location) {
            var pickItemLine = {};
            pickItemLine.orderItemLineId = itemLine.orderItemLineId;
            pickItemLine.orderId = itemLine.orderId;
            pickItemLine.baseQty = location.assignedQty;
            pickItemLine.titleId = itemLine.titleId;
            if(location) pickItemLine.locationId = location.locationId;
            pickItemLine.unitId = itemLine.unitId;
            pickItemLine.productId = itemLine.productId;
            pickItemLine.itemSpecId = itemLine.itemSpecId;
            return pickItemLine;
        }

        service.createPickItemLine = function(strategy, remainQty)
        {
            var pickItemLine = {};
            pickItemLine.baseQty = remainQty;
            pickItemLine.titleId = strategy.titleId;
            pickItemLine.locationId = strategy.locationId;
            pickItemLine.unitId = strategy.unitId;
            pickItemLine.productId = strategy.productId;
            pickItemLine.itemSpecId = strategy.itemSpecId;
            pickItemLine.orderId = strategy.orderId;
            pickItemLine.orderItemLineId = strategy.orderItemLineId;
            return pickItemLine;
        }

        service.updateQtyMap = function(totalQtyMap, subTasks)
        {
            var pickItemLines = [];
            var remainQtyMap = {};
            angular.forEach(subTasks, function (subTask) {
                pickItemLines = _.concat(subTask.pickItemLines, pickItemLines);
            });
            var qtyMap = {};
            angular.forEach(pickItemLines,function (pickItemLine) {
                var key = service.getKey(pickItemLine);
                if(qtyMap[key]) qtyMap[key] = qtyMap[key] + pickItemLine.baseQty;
                else qtyMap[key] = pickItemLine.baseQty;
            });
            _.forIn(totalQtyMap, function(value, key) {
                if(qtyMap[key]) remainQtyMap[key] = totalQtyMap[key] - qtyMap[key];
                else remainQtyMap[key] = totalQtyMap[key];
            });
            return remainQtyMap;
        };

        service.getRemainQtyMap = function(totalQtyMap, ifHasTask)
        {
            var remainQtyMap = {};
            _.forIn(totalQtyMap, function(value, key) {
                if(ifHasTask)  remainQtyMap[key] = 0;
                else remainQtyMap[key] = totalQtyMap[key];
            });
            return remainQtyMap;
        }
        
        service.getKey = function(object) {
            if(object.productId)
                 return object.itemSpecId + "_" + object.productId + "_" + object.unitId + "_" + object.locationId;
            else
                return object.itemSpecId + "__" + object.unitId + "_" + object.locationId;
        }
        return service;
    }]);
});
