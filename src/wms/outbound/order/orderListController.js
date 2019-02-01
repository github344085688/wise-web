'use strict';

define([
    'angular',
    'lodash',
    './setUpBatchOrderItemLinePrintController',
    './syncOrderToHonController'
], function (angular, _ ,setUpBatchOrderItemLinePrintController,syncOrderToHonController) {
    var controller = function ($document, $scope, $resource, orderService, organizationService, lincUtil,
        $state, lincResourceFactory, $mdDialog, $http,$stateParams) {
        var SORT_DEFAULT = "default";
        var SORT_ASC = "asc";
        var SORT_DESC = "desc";
        var currentViewPage;
        $scope.pageSize = 10;
        var searchInfo = $stateParams.searchInfo||{};
        $scope.searchParam = $stateParams.searchInfo||{};
        var checkOrderIds = [];

        $scope.columnDefs = [
            { headerName: "Order ID", field: "id", sort: true },
            { headerName: "Entry ID", field: "entryId" },
            { headerName: "Order Plan ID", field: "orderPlanId" },
            { headerName: "Status", field: "status", sort: true },
            { headerName: "Type", field: "orderType", sort: true },
            { headerName: "Load", field: "loadNo" },
            { headerName: "Customer", field: "customerName" },
            { headerName: "Ship To ID", field: "shipToId" },
            { headerName: "Ship To", field: "addressName" },
            { headerName: "Reference", field: "referenceNo", sort: true },
            { headerName: "Purchase Order No.", field: "poNo", sort: true },
            { headerName: "Customer Sales Order No.", field: "soNos", sort: true },
            { headerName: "Delivery Request Date", field: "mabd", sort: true },
            // { headerName: "Schedule Date", field: "scheduleDate"},
            { headerName: "Carrier", field: "carrierName" },
            { headerName: "Retailer", field: "retailerName" },
            { headerName: "Freight Term", field: "freightTerm", sort: true },
            { headerName: 'Sync To Hon', field: 'syncStatu'},
            { headerName: "Is Rush", field: "isRush", sort: true },
            { headerName: "Attempted Commit Date", field: "attemptedCommitDate", sort: true },
            { headerName: "Date Created", field: "createdWhen", sort: true },
            { headerName: "Date Updated", field: "updatedWhen", sort: true }
        ];

        function initSorts() {
            $scope.sorts = [];
            var len = $scope.columnDefs.length;
            for (var i = 0; i < len; i++) {
                $scope.sorts.push(SORT_DEFAULT);
            }
            $scope.sortsClass = {
                default: 'order-sorting',
                asc: 'order-sorting order-sorting-asc',
                desc: 'order-sorting order-sorting-desc'
            };
        }
        $scope.getSortClass = function (index) {
            if ($scope.columnDefs[index].sort) {
                return $scope.sortsClass[$scope.sorts[index]];
            }
        };

        $scope.sortClick = function (index) {
            if (!$scope.columnDefs[index].sort) {
                return;
            }
            var sort = $scope.sorts[index];
            var sortField = $scope.columnDefs[index].field;
            switch (sort) {
                case SORT_DEFAULT:
                    sortDefault(index);
                    orderByOrders(sortField, 1);
                    break;
                case SORT_ASC:
                    $scope.sorts[index] = SORT_DESC;
                    orderByOrders(sortField, -1);
                    break;
                case SORT_DESC:
                    $scope.sorts[index] = SORT_ASC;
                    orderByOrders(sortField, 1);
                    break;
            }
        };

        function orderByOrders(fieldName, sort) {
            searchInfo.sortingFields = [fieldName];
            searchInfo.sortingOrder = sort;
            $scope.loadContent(currentViewPage);
        }

        $scope.getShipTo = function (item) {
            if (item.shipToId) {
                return _.split(item.shipTo, "\n", 1)[0];
            } else if (item.shipTo) {
                return _.split(item.shipTo, "\n", 1)[0];
            } else {
                return "";
            }
        };

        function sortDefault(index) {
            angular.forEach($scope.sorts, function (value, key) {
                $scope.sorts[key] = (key === index) ? SORT_ASC : SORT_DEFAULT;
            });
        }

        $scope.searchOrders = function (searchParam) {
           
            if (searchParam.confirmedLH) {
                searchParam.longHaulIds = _.map(searchParam.longHaul, 'id');
            }else{
                searchParam.longHaulNos = _.map(searchParam.longHaul, 'longHaulNo');
            }
            searchInfo = searchParam;
            $scope.loadContent(1, true);
        };

        $scope.loadContent = function (currentPage, isSearch){
            checkOrderIds = [];
            currentViewPage = currentPage;
            if (isSearch) {
                $scope.searchLoading = true;
            }
            $scope.isLoading = true;
            $scope.orders = [];
            var param = angular.copy(searchInfo);
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            orderService.searchOrderByPaging(param).then(function (response) {
                $scope.isLoading = false;
                if (isSearch) {
                    $scope.searchLoading = false;
                }
                $scope.orders = response.orders;
                $scope.paging = response.paging;
            }, function () {
                $scope.isLoading = false;
                if (isSearch) {
                    $scope.searchLoading = false;
                }
            });
        };

        $scope.reopen = function (orderId) {
            var confirm = $mdDialog.confirm()
                .title('Confirm')
                .textContent('Would you like to reopen this order?')
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function () {
                angular.forEach($scope.orders, function (item, key) {
                    if (item.orderId === orderId) {
                        $scope.orders[key].status = "reopen";
                    }
                });
            });
        };

        $scope.addOrder = function () {
            $state.go('wms.outbound.order.add');
        };
        $scope.editOrder = function (id) {
            $state.go('wms.outbound.order.edit', { orderId: id });
        };

        $scope.deleteOrder = function (orderId) {
            lincUtil.deleteConfirmPopup('Would you like to remove the this  order?', function () {
                orderService.deleteOrder(orderId).then(function () {
                    angular.forEach($scope.orders, function (item, key) {
                        if (item.id === orderId) {
                            $scope.orders.splice(key, 1);
                        }
                    });

                    angular.forEach($scope.orderView, function (item1, key1) {
                        if (item1.id === orderId) {
                            $scope.orderView.splice(key1, 1);
                        }
                    });
                }, function (error) {
                    lincUtil.errorPopup('Delete Error! ' + error.data.error);
                });
            });
        };

        $scope.export = function (searchParam) {
            if (searchParam.confirmedLH) {
                searchParam.longHaulIds = _.map(searchParam.longHaul, 'id');
            }else{
                searchParam.longHaulNos = _.map(searchParam.longHaul, 'longHaulNo');
            }
            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/report-center/outbound/order/export", searchParam, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "order.xls");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        $scope.longHaul = function () {
            var searchParam = angular.copy($scope.searchParam);
            if (!searchParam.longHaul) {
                var url = $state.href('wms.outbound.order.lineLaul', {
                    longHaulNo: null,
                    fromDate: searchParam.mabdFrom,
                    fromTo: searchParam.mabdTo
                });
                window.open(url);
                return;
            }
            _.forEach(searchParam.longHaul, function (lh) {
                var url = $state.href('wms.outbound.order.lineLaul', {
                    longHaulNo: lh.longHaulNo,
                    fromDate: searchParam.mabdFrom,
                    fromTo: searchParam.mabdTo
                });
                window.open(url);
            });
        };

        $scope.checkAllOrders = function () {
            var currentPageItemIds = _.map($scope.orders, 'id');
            if ($scope.selectAllIsChecked()) {
                checkOrderIds = [];
            } else {
                checkOrderIds = currentPageItemIds;
            }
        };

        $scope.selectAllIsChecked = function () {
            if(!$scope.orders) return;
            if(!checkOrderIds || checkOrderIds.length == 0) return false;
            if(checkOrderIds.length === $scope.orders.length) {
                return true;
            }else {
                return false;
            }
        };

        $scope.checkOrder = function (order) {
            if (_.indexOf(checkOrderIds, order.id) > -1) {
                _.remove(checkOrderIds, function (orderId) {
                    return order.id == orderId;
                })
            } else {
                checkOrderIds.push(order.id);
            }
        };

        $scope.isChecked = function (order) {
            return _.indexOf(checkOrderIds, order.id) > -1;
        };
        
        $scope.batchCloseOrder = function () {
            if(checkOrderIds.length == 0) {
                lincUtil.messagePopup("Info", "Please select one order at least!");
            }else {
                $scope.isBatchClosing = true;
                orderService.batchCloseOrder(checkOrderIds).then(function () {
                    $scope.isBatchClosing=false;
                    lincUtil.messagePopup("Info", "Batch close order successful.");
                    $scope.loadContent(currentViewPage);
                }, function (error) {
                    $scope.isBatchClosing=false;
                    lincUtil.processErrorResponse(error)
                });
            }
        };

        $scope.batchPrePrintShippingLabel = function() {
            if(checkOrderIds.length == 0) {
                lincUtil.messagePopup("Info", "Please select one order at least!");
            }else {
                $mdDialog.show({
                    templateUrl: 'wms/outbound/order/template/setUpBatchOrderItemLinePrint.html',
                    locals: {
                        orderIds: checkOrderIds,
                        itemSpecId: searchInfo.itemSpecId
                    },
                    autoWrap: true,
                    controller: setUpBatchOrderItemLinePrintController
                }).then(function () { }, function () { }); 
            }
          
        }
        $scope.aysnToHonLoads ={};
        $scope.singleAsynOrderToHon =function(item,index){
            $scope.aysnToHonLoads[index] = true;
             orderService.singleSyncOrderToHon(item.id).then(function(res){
                lincUtil.messagePopup("Message", "Sync Order To Hon Successful.");
                $scope.aysnToHonLoads[index] = false;
                item.syncStatu = true;
             }, function (error) {
                    $scope.aysnToHonLoads[index] = false;
                    lincUtil.processErrorResponse(error)
                });
        };

        $scope.batchUpdateOrder = function(){

            if(checkOrderIds.length == 0) {
                lincUtil.messagePopup("Info", "Please select one order at least!");
            }else {
                $state.go('wms.outbound.order.batchUpdate',{ orderIds: checkOrderIds,searchInfo: searchInfo })
            }
        };

        $scope.syncedToHon = function (item) {
            var form = {
                templateUrl: 'wms/outbound/order/template/syncOrderToHon.html',
                autoWrap: true,
                controller: syncOrderToHonController
            };
            $mdDialog.show(form).then(function (response) {
                init();
            });
        };

        function init() {
            initSorts();
            $scope.loadContent(1);
        }

        init();

    };
    controller.$inject = ['$document', '$scope', '$resource', 'orderService', 'organizationService', 'lincUtil',
        '$state', 'lincResourceFactory', '$mdDialog', '$http','$stateParams'];
    return controller;
});