'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $resource, orderService,
                               $mdDialog, $state, itemLine,orderId,carrierId,smallParcelShipmentService) {
        $scope.ifProductExit = true;
        initSet();
        function initSet() {
            $scope.shipments=
                {
                    carrierId:carrierId,
                    trackingNo:"",
                    itemLineDetails:[],
                    isShippingLabelPrinted: true
                };

            searchOrderItemLine();
        }
        function  searchOrderItemLine() {
            orderService.searchOrderItemLine({orderIds:[orderId]}).then(function (response) {
                $scope.itemSpecs=response.orderItemLines;
            }, function (error) {

            });

        }
        $scope.changeItemLineDetail = function(itemLine,selected){
            itemLine.unitId=selected.unitId;
            itemLine.unit=selected.unit;
            itemLine.itemSpecDesc=selected.itemSpecDesc;
            itemLine.itemSpecName=selected.itemSpecName;
            itemLine.orderId=selected.orderId;
            itemLine.shortDescription=selected.shortDescription;
        };

        $scope.addItemLineDetails = function(){
            $scope.shipments.itemLineDetails.push({
                itemSpecId:null,
                qty:null
            });
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
            if($scope.shipments.trackingNo){
                smallParcelShipmentService.searchSmallParcelShipmentDetail({trackingNo:$scope.shipments.trackingNo}).then(function (response) {
                    $scope.shipmentsTrackingNoOrderIds=_.difference(_.map(response,'orderId'), [orderId]);
                  if($scope.shipmentsTrackingNoOrderIds.length > 0) {
                      $scope.shipmentsTrackingNo=$scope.shipments.trackingNo;
                      $scope.isTrackingNoHasOrder=true;
                      return false;
                  }
                    $scope.isTrackingNoHasOrder=false;
                    if($scope.shipments.itemLineDetails.length>0){
                        $mdDialog.hide($scope.shipments);
                    }
                });
            }

        };
    };
    controller.$inject = ['$scope', '$resource','orderService',
        '$mdDialog', '$state', 'itemLine','orderId','carrierId','smallParcelShipmentService'];
    return controller;
});