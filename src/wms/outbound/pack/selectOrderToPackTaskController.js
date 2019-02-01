'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var selectOrderToPackTaskController = function($scope, packService, $state, $stateParams,
                                                   loadsService, lincUtil, addressService, longHaulService) {

        $scope.pageSize = 10;
        var checkedOrders = [];
        $scope.search = function() {
            $scope.searchCompleted = false;
            $scope.order.statuses = ['Picking', 'Picked','Planned'];
            packService.searchPackOrder($scope.order).then(function(response) {
                $scope.searchCompleted = true;
                $scope.orders = response;
                generateShipToAddressStr($scope.orders);
                $scope.loadContent(1);
            },function(err){
                $scope.searchCompleted = true;
                lincUtil.errorPopup("Error:" + err.data.error);
            });
        };

        $scope.loadContent = function (currentPage) {
            $scope.ordersView = $scope.orders.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.orders.length ? $scope.orders.length : currentPage * $scope.pageSize);
        };

        $scope.batchCreateTaskByShipTo = function () {
            if(!isSelectAnyOrder()) {
                lincUtil.messagePopup("Tip","Please select at least one order to pack.");
                return;
            }
            var ordersGroupByShipTo = _.groupBy(checkedOrders, 'shipToAddressStr');
            var batchTaskOrderIds = [];

            _.forIn(ordersGroupByShipTo, function(orders, key) {
                var orderIds = _.map(orders, "id");
                batchTaskOrderIds.push(orderIds);
            });
            $state.go('wms.task.packTask.batchAdd', {batchTaskOrderIds: batchTaskOrderIds});
        };

        $scope.createPackTask = function() {
            if(isSelectAnyOrder()) {
                var shipToIsSame = validateShipToIsSame(checkedOrders);
                if(!shipToIsSame) {
                    lincUtil.messagePopup("Tip","Please make sure the all selected orders have the same ship to address!");
                }else {
                    var orderIds = _.map(checkedOrders, "id");
                    $state.go('wms.task.packTask.general.add', {orderIds: orderIds});
                }
            }else {
                lincUtil.messagePopup("Tip","Please select at least one order to pack.");
            }
        };

        function validateShipToIsSame(orders) {
            if(orders.length == 1)  {
                return true;
            }
            var shipToAddressStrs =  _.map(orders, "shipToAddressStr");
            var shipToAddressStrs1 = _.uniq(shipToAddressStrs);
            return shipToAddressStrs1.length == 1 ? true : false;
        }

        function generateShipToAddressStr(orders) {
            angular.forEach(orders, function (order) {
                order.shipToAddressStr = addressService.generageAddressData(order.shipToAddress, null);
            });
        }

        function isSelectAnyOrder() {
            return  checkedOrders && checkedOrders.length > 0
        };

        $scope.toggleAll = function($event) {
            // $event.stopPropagation();
            if(!$scope.orders) return;
            if ($scope.selectAllIsChecked()) {
                checkedOrders = [];
            } else {
                checkedOrders = angular.copy($scope.orders);
            }
        };

        $scope.selectAllIsChecked = function () {
            if(!$scope.orders) return;
            if(!checkedOrders || checkedOrders.length == 0) return false;
            if(checkedOrders.length === $scope.orders.length) {
                return true;
            }else {
                return false;
            }
        };

        $scope.isChecked = function(order) {
            var index = _.findIndex(checkedOrders, function (checkedOrder) {
                return checkedOrder.id == order.id;
            });
            return index > -1 ;
        };

        $scope.toggle = function(order) {
            var index = _.findIndex(checkedOrders, function(checkedOrder) {
                return checkedOrder.id === order.id;
            });
            if (index > -1) {
                checkedOrders.splice(index, 1);
            } else {
                checkedOrders.push(order);
            }
        };

        $scope.getItemName = function(itemSpecId) {
            if ($scope.itemSpecMap[itemSpecId])
                return $scope.itemSpecMap[itemSpecId].name;
            return "";
        };

        $scope.getItemUnit = function(unitId) {
            if ($scope.itemUnitMap[unitId])
                return $scope.itemUnitMap[unitId].name;
            return "";
        };

        $scope.groupOrderByShipTo = function () {
            $scope.orders = _.orderBy( $scope.orders, ['shipToAddressStr'], ['asc']);
            $scope.loadContent(1);
        };

        $scope.getLongHaulList = function(keyword){
            longHaulService.LongHaulSearch({regexLongHaulNo: keyword}).then(function(response){
                $scope.longHauls = response.milkRuns;
            });
        };

        function _init() {
            checkedOrders = [];
            $scope.order = {statuses:['Picking', 'Picked']};
            $scope.pickTypes = ['Bulk Pick', 'Pallet Pick', 'Piece/Case Pick'];
            $scope.pickWays = ['Order Pick', 'Batch Pick', 'Wave Pick(By Order)', 'Wave Pick(By Item)'];
            $scope.orderStatuses = ['Picking', 'Picked','Planned'];
            $scope.search();
        }
        _init();
    };

    selectOrderToPackTaskController.$inject = ['$scope', 'packService', '$state', '$stateParams',
        'loadsService', 'lincUtil', 'addressService', 'longHaulService'];
    return selectOrderToPackTaskController;
});
