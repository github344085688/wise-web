'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var orderSelectPageController = function ($scope, $state, loadOrderSelectService,
                                              loadsService, $stateParams, lincUtil, addressService,orderService) {

        $scope.pageSize = 10;

        $scope.add = function () {
            loadOrderSelectService.addOrderLines(angular.copy($scope.checkedOrders));
            loadOrderSelectService.fromSelect = true;
            if($state.current.name.indexOf("add") > -1 ) {
                $state.go('wms.outbound.load.add', null, {reload: true});
            }else {
                $state.go('wms.outbound.load.edit', null, {reload: true});
            }
        };

        $scope.cancel = function () {
            if($state.current.name.indexOf("add") > -1 ) {
                $state.go('wms.outbound.load.add');
            }else {
                $state.go('wms.outbound.load.edit');
            }
        };
        $scope.searchParam ={customerId: $stateParams.customerId};
        $scope.searchOrders = function (searchParam) {
            if (searchParam.confirmedLH) {
                searchParam.longHaulIds = _.map(searchParam.longHaul, 'id');
            }else{
                searchParam.longHaulNos = _.map(searchParam.longHaul, 'longHaulNo');
            }
            if($stateParams.customerId){
                searchParam.customerIds = [$stateParams.customerId];
            }
            if(searchParam.hasOwnProperty('customerId')){
                delete searchParam.customerId;
            }

            getOrders(searchParam, 1);
        };

        function getOrders(param,currentPage) {
            $scope.isLoading = true;
            $scope.searchInfo = param;
            param.excludeStatuses = ["Cancelled","Shipped"];
            param.excludeOrderIds =  loadOrderSelectService.getOrderIds();
            param.paging = {pageNo: currentPage, limit:$scope.pageSize};
            loadsService.buildLoadOrderSearch(param).then(function (response) {
                $scope.isLoading = false;
                $scope.orders = response.orders;
                $scope.paging = response.paging;
                $scope.orderItemLineMap = response.orderItemLineMap;
                $scope.itemMap = response.itemMap;
            },function(err){
                $scope.isLoading = false;
                lincUtil.errorPopup("Error:" + err.data.error);
            });
        }

        $scope.loadContent = function (currentPage) {
             getOrders($scope.searchInfo, currentPage);
        };

        $scope.selectAll = function () {
            if ($scope.checkedAll) {
                $scope.checkedOrders = [];
                $scope.checkedAll = false;
            } else {
                _.forEach($scope.orders, function (order) {
                    $scope.checkedOrders.push(order);
                    $scope.checkedOrders = _.uniqBy($scope.checkedOrders, 'id');
                    $scope.checkedAll = true;
                });
            }
            $scope.totalSelectWeight= orderService.calcOrderWeights($scope.checkedOrders);
        };
        
        $scope.isChecked = function (order) {
            return _.find($scope.checkedOrders, order);
        };

        $scope.checkOrUncheck = function (order) {
            var index = _.findIndex($scope.checkedOrders, function (item) {
                return item.id == order.id;
            });
            if (index > -1) {
                _.remove($scope.checkedOrders, function (checkedOrder) {
                    return checkedOrder.id === order.id;
                });
                $scope.checkedAll = false;
            } else {
                $scope.checkedOrders.push(order);
            }
            $scope.totalSelectWeight= orderService.calcOrderWeights($scope.checkedOrders);
        };

        $scope.viewOrCloseDetail = function (viewOrClose) {
            if (viewOrClose === 'View') {
                for (var i = 0; i < $scope.orders.length; i++)
                    $scope['in' + i] = 'in';
                $scope.viewOrClose = 'Close';
            } else {
                for (var j = 0; j < $scope.orders.length; j++)
                    $scope['in' + j] = '';
                $scope.viewOrClose = 'View';
            }
        };

        $scope.getIn = function (index) {
            return $scope['in' + index];
        };

        $scope.showIn = function (index) {
            if (typeof($scope['in' + index]) === 'undefined' || $scope['in' + index] === '') {
                $scope['in' + index] = 'in';
            } else {
                $scope['in' + index] = '';
            }
        };

        function _init() {
            $scope.order = {};
            if($stateParams.customerId)
            {
                $scope.order.customerId = $stateParams.customerId;
                getOrders({customerIds: [$stateParams.customerId]}, 1);
            }else {
                getOrders({},1);
            }
            $scope.viewOrClose = 'View';
            $scope.in = '';
            $scope.checkedOrders = loadOrderSelectService.getOrderLines();
            if ($scope.checkedOrders === undefined) {
                $scope.checkedOrders = [];
            }

            loadOrderSelectService.isLoadSelectOrdersEmpty = $scope.checkedOrders.length < 1;

        }

        $scope.getAddressInfo = function (addressObject) {
            return addressService.generageAddressData(addressObject, null);
        };

        _init();
    };

    orderSelectPageController.$inject = ['$scope', '$state', 'loadOrderSelectService',
        'loadsService', '$stateParams', 'lincUtil', 'addressService','orderService'];

    return orderSelectPageController;
});
