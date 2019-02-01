'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $stateParams, $resource, addressService, conveyorService, smallParcelShipmentService, lincUtil) {

        //testdata
        $scope.lpList = ['CLP-791832', 'CLP-123321', 'CLP-123345', 'CLP-792572'];

        $scope.param = {};
        $scope.package = {};
        $scope.itemLineParam = { item: {} };
        $scope.isReady = false;
        $scope.enterEvent = function (e) {
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                getLpDetail($scope.param.clp);
            }
        };

        var orginData = [];
        function getLpDetail (clp) {
            $scope.isLoadingTable = true;
            conveyorService.getSmallParcelStationLpDetail(clp).then(function (response) {
                $scope.lpDetail = response;
                orginData = angular.copy(response);
                $scope.itemLines = angular.copy(orginData.inventories);
                getPackageWeight();
                $scope.itemLineParam = { item: {} };
                $scope.isLoadingTable = false;
                $scope.isReady = true;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isLoadingTable = false;
            });
        }


        function getPackageWeight () {
            smallParcelShipmentService.calculateItemWeight({ itemList: $scope.itemLines }).then(function (response) {
                $scope.package.weight = response.packageWeight;
            }, function (err) {
                lincUtil.processErrorResponse(err);
            });
        }

        $scope.getAddressInfo = function (addressObject) {
            return addressService.generageAddressData(addressObject, null);
        };

        $scope.sumPrintedQty = function (beenPrintedTrackingNos) {
            return _.sum(_.map(beenPrintedTrackingNos, 'qty'));
        };

        $scope.sumUnPrintedQty = function (item, beenPrintedTrackingNos) {
            return item.qty - (_.sum(_.map(beenPrintedTrackingNos, 'qty')));
        };

        $scope.remove = function (index) {
            $scope.itemLines.splice(index, 1);
            getPackageWeight();
        }

        $scope.add = function () {
            if(_.isEmpty($scope.itemLineParam.item)){
                lincUtil.messagePopup('Message', 'please select item');
                return;
            }
            if(!$scope.itemLineParam.qty && $scope.itemLineParam.qty!=0){
                lincUtil.messagePopup('Message', 'please input qty');
                return;
            }
            if($scope.itemLineParam.qty <= 0){
                lincUtil.messagePopup('Message', 'please set qty > 0');
                return;
            }
            var itemLineSum = _.keyBy(orginData.inventories, "itemSpecId");
            var qty = $scope.itemLineParam.qty;
            var itemLineParam = angular.copy($scope.itemLineParam);
            itemLineParam.item.qty = itemLineParam.qty;
            _.forEach($scope.itemLines, function (itemLine) {
                if (itemLineParam.item.itemSpecId == itemLine.itemSpecId) {
                    qty = qty + itemLine.qty;
                }
            });
            if (itemLineSum[itemLineParam.item.itemSpecId].qty >= qty) {
                $scope.itemLines.push(itemLineParam.item);
                getPackageWeight();
            } else {
                lincUtil.messagePopup('Message', 'All the ' + itemLineParam.item.itemSpecName + ' had been add to the packages ,  please help check');
            }
        }
























    }

    controller.$inject = ['$scope', '$stateParams', '$resource', 'addressService', 'conveyorService', 'smallParcelShipmentService', 'lincUtil'];
    return controller;
});