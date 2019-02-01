'use strict';

define([
    'angular',
    'lodash',
    'src/wms/task/pick-task/setUpBatchPickTaskController'
], function (angular, _, setUpBatchPickTaskController) {
    var controller = function ($scope, $state, $resource, $mdDialog, lincUtil, orderService, orderIds, addressService) {


        $scope.pageSize = 10;

        function _init() {
            searchOrderItemLine();
        }

        function searchOrderItemLine() {
            var param = {
                orderIds: orderIds
            };
            $scope.isLoadingTable = true;
            orderService.searchOrderItemLine(param).then(function (response) {
                $scope.orderPlan = response;
                $scope.orderPlan.orderItemLines = _.sortBy(response.orderItemLines, function (item) {
                    return Number(item.orderId.split('-')[1]);
                });
                $scope.UnitKeyByUnitId ={};
                if(response.orderItemLines.length>0){
                    $scope.UnitKeyByUnitId = _.keyBy(_.flattenDeep(_.map(response.orderItemLines,'itemUnits')),'id');
                }
                $scope.orderItemLinesGroupByOrderId = _.groupBy(response.orderItemLines, 'orderId');
                transforPrintAndUnPrintQtyToItemQtyWithSameUnit(response.orderItemLines);
                $scope.unPrintShippingDetails = response.unPrintShippingDetails;
                $scope.orderKeyById = _.keyBy(response.orders, 'id');
          
                $scope.isLoadingTable = false;
                $scope.loadContent(1);
                getSmallParcelItemListSource();

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

         $scope.tranforQtyToCurrentUnit = function (trackingNoItem,itemLine) {

            if(trackingNoItem.itemLineDetail.unitId === itemLine.unitId) {
                var trackingNoUnitId = trackingNoItem.itemLineDetail.unitId;
                var trackingNoUnit = $scope.UnitKeyByUnitId[trackingNoUnitId];
                return trackingNoItem.trackingNo + "(" + trackingNoItem.qty + trackingNoUnit.name + ")";
            }
        }

       $scope.singleAndMixItems = [];

        function getSmallParcelItemListSource() {
            _.forEach($scope.orderItemLinesGroupByOrderId, function (itemLines, orderId) {
                var mixItem = [];
                _.forEach(itemLines, function (itemLine) {
                    //设置了cartonConfig
                    var itemTotalQty = getNeedToPrintedItemTotalQty(itemLine);
                    var configBaseQty, printCount, restItemQty;
                    if (itemLine.cartonConfig) {
                        //统一换算成carton中baseQty数量
                        configBaseQty = (_.find(itemLine.itemUnits, {
                            id: itemLine.cartonConfig.unitId
                        })).baseQty;
                        printCount = Math.floor(itemTotalQty / (itemLine.cartonConfig.qty * configBaseQty));
                        restItemQty = itemTotalQty - (itemLine.cartonConfig.qty * configBaseQty * printCount);
                        getItemListFromConfig(itemLine, mixItem, printCount, restItemQty, null);
                    } else {
                        //未设置cartonConfig，设置了customer级别
                        var customerLevelConfig = $scope.orderKeyById[itemLine.orderId].customer.smallParcelPackConfig;
                        if (!itemLine.cartonConfig && customerLevelConfig && customerLevelConfig.qty) {
                            var defaultBaseQty = (_.find(itemLine.itemUnits, 'isDefaultUnit')).baseQty;
                            printCount = Math.floor(itemTotalQty / (customerLevelConfig.qty * defaultBaseQty));
                            restItemQty = itemTotalQty - (customerLevelConfig.qty * defaultBaseQty * printCount);
                            getItemListFromConfig(itemLine, mixItem, printCount, restItemQty, customerLevelConfig);
                        } else {
                            restItemQty = itemTotalQty;
                            getItemListFromConfig(itemLine, mixItem, 0, restItemQty, null);
                        }
                    }
                });

                if (mixItem.length > 0) {
                    $scope.singleAndMixItems.push(mixItem);
                }

            });

        }

        function getItemListFromConfig(itemLine, mixItem, printCount, restItemQty, customerLevelConfig) {

            if (restItemQty > 0) {
                var  itemBaseQty =  (_.find(itemLine.itemUnits,{id:itemLine.unitId})).baseQty;
                if (itemLine.allowMixedPackagingForSmallParcel) {
                    mixItem.push({
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": itemLine.unitId,
                        "qty": restItemQty / itemBaseQty,
                        "packageWeight": itemLine.itemWeight * (restItemQty / itemBaseQty)
                    })
                } else {
                    $scope.singleAndMixItems.push([{
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": itemLine.unitId,
                        "qty": restItemQty / itemBaseQty,
                        "packageWeight": itemLine.itemWeight * (restItemQty / itemBaseQty)
                    }]);
                }
            }

            for (var i = 0; i < printCount; i++) {
                //customer级别设置 取default Unit 里面
                var printItem;
                if (customerLevelConfig) {
                    var defaulUnit = (_.find(itemLine.itemUnits, 'isDefaultUnit'));
                    printItem = [{
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": defaulUnit.id,
                        "qty": customerLevelConfig.qty,
                        "packageWeight": defaulUnit.weight * customerLevelConfig.qty
                    }]
                } else {
                    //item carton config 级别上的
                    var weight = (_.find(itemLine.itemUnits, {
                        id: itemLine.cartonConfig.unitId
                    })).weight;
                    printItem = [{
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": itemLine.cartonConfig.unitId,
                        "qty": itemLine.cartonConfig.qty,
                        "packageWeight": weight * itemLine.cartonConfig.qty
                    }]
                }
                $scope.singleAndMixItems.push(printItem);
            }

        }

        //全部转换成基本单位的总数
        function getNeedToPrintedItemTotalQty(itemLine) {

            var itemUnitsKeyBy = _.keyBy(itemLine.itemUnits, 'id');

            var printedTrackingNoQty = _.sumBy(itemLine.beenPrintedTrackingNos, function (item) {
                return itemUnitsKeyBy[item.itemLineDetail.unitId].baseQty * item.qty;
            });

            var unprintedTrackingNoQty = _.sumBy(itemLine.unPrintedTrackingNos, function (item) {
                return itemUnitsKeyBy[item.itemLineDetail.unitId].baseQty * item.qty;
            });
            var itemTotalQty = (itemLine.qty * itemUnitsKeyBy[itemLine.unitId].baseQty) - printedTrackingNoQty - unprintedTrackingNoQty;
            return itemTotalQty;
        }

        function transforPrintAndUnPrintQtyToItemQtyWithSameUnit(orderItemLines){
            _.forEach(orderItemLines,function(orderItemLine){
                _.forEach(orderItemLine.beenPrintedTrackingNos,function(beenPrintedTrackingNo){

                    var itemLineDetail=  beenPrintedTrackingNo.itemLineDetail;
                    var itemLineUnitId = orderItemLine.unitId;
                    var trackingNoUnit = $scope.UnitKeyByUnitId[itemLineDetail.unitId];
                    var itemLineUnit = $scope.UnitKeyByUnitId[itemLineUnitId];
                 
                   if(itemLineUnit && trackingNoUnit){
                     beenPrintedTrackingNo.itemQty = trackingNoUnit.baseQty*itemLineDetail.qty/itemLineUnit.baseQty;
                    }
                
                })
                
            });
      
        }

        $scope.sumPrintedQty = function (beenPrintedTrackingNos) {
   
       
            return _.sum(_.map(beenPrintedTrackingNos, 'itemQty'));
        };

        $scope.sumUnPrintedQty = function (item, beenPrintedTrackingNos) {
            return item.qty - (_.sum(_.map(beenPrintedTrackingNos, 'itemQty')));
        };

        $scope.loadContent = function (currentPage) {
            $scope.orderItemLinesView = $scope.orderPlan.orderItemLines.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.orderPlan.orderItemLines.length ?
                $scope.orderPlan.orderItemLines.length : currentPage * $scope.pageSize);
        };



        $scope.getAddressInfo = function (addressObject) {
            return addressService.generageAddressData(addressObject, null);
        };

        $scope.reprintFailedShippingLabel = function () {
            $mdDialog.show({
                templateUrl: 'wms/task/pick-task/template/setUpBatchPickTaskPrint.html',
                locals: {
                    taskIds: null,
                    orderIds: orderIds
                },
                autoWrap: true,
                controller: setUpBatchPickTaskController
            }).then(function () {}, function () {});
        };

        $scope.repack = function (orderId) {
            var url = $state.href('wms.task.pickTask.prePrintShippingLabel', {
                taskId: orderId
            });
            window.open(url);
        }

        _init();
        $scope.loadingComplete = false;
        $scope.cancel = function () {
            $mdDialog.hide();
        };

    };

    controller.$inject = ['$scope', '$state', '$resource', '$mdDialog', 'lincUtil', 'orderService', 'orderIds', 'addressService'];

    return controller;
});