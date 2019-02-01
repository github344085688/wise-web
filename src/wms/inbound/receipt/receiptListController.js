'use strict';

define([
    'angular',
    'lodash',
    './syncReceiptToHonController'
], function(angular, _,syncReceiptToHonController) {
    var controller = function($scope, $resource, lincResourceFactory, receiptService,
                              organizationService, lincUtil, $state,  $http,$mdDialog) {
        var SORT_DEFAULT = "default";
        var SORT_ASC = "asc";
        var SORT_DESC = "desc";
        $scope.pageSize = 10;
        $scope.receipt = {};
        var searchInfo = {};
        var currentViewPage;
        $scope.colDefs = [
            {headerName: 'Receipt ID', field: 'id', sort: true},
            {headerName: 'Entry', field: 'entryId'},
            {headerName: 'Status', field: 'status', sort: true},
            {headerName: 'Type', field: 'receiptType', sort: true},
            {headerName: 'Customer', field: 'customerName'},
            {headerName: 'Title', field: 'titleName'},
            {headerName: 'Carrier', field: 'carrierName'},
            {headerName: 'CTNR', field: 'containerNo', sort: true},
            {headerName: 'BOL', field: 'bolNo', sort: true},
            {headerName: 'Reference', field: 'referenceNo', sort: true},
            {headerName: 'Purchase Order No.', field: 'poNo', sort: true},
            {headerName: 'Seal', field: 'sealNo', sort: true},
            {headerName: 'SN Count', field: 'snCount', sort: true},
            {headerName: 'RC Sent', field: 'rcSent', sort: true },
            {headerName: 'Sync To Hon', field: 'syncStatu'},
            {headerName: 'Expiration Date', field: 'expirationDate', sort: true},
            {headerName: 'Created Time', field: 'createdWhen', sort: true},
            {headerName: "Date Updated", field: "updatedWhen", sort: true},
            {headerName: "Devanned Time", field: "devannedTime", sort: true}
        ];

        function initSorts() {
            $scope.sorts = [];
            var len = $scope.colDefs.length;
            for (var i = 0; i < len; i++) {
                $scope.sorts.push(SORT_DEFAULT);
            }
            $scope.sortsClass = {
                default: 'order-sorting',
                asc: 'order-sorting order-sorting-asc',
                desc: 'order-sorting order-sorting-desc'
            };
        }

        $scope.getSortClass = function(index) {
            if($scope.colDefs[index].sort) {
               return $scope.sortsClass[$scope.sorts[index]];
            }
        }

        $scope.syncedToHon = function (item) {
            var form = {
                templateUrl: 'wms/inbound/receipt/template/syncReceiptToHon.html',
                autoWrap: true,
                controller: syncReceiptToHonController
            };
            $mdDialog.show(form).then(function (response) {
                init();
            });
        };

        $scope.sortClick = function(index) {
            if(!$scope.colDefs[index].sort) {
                return;
            }
            var sort = $scope.sorts[index];
            var sortField = $scope.colDefs[index].field;
            switch (sort) {
                case SORT_DEFAULT:
                    sortDefault(index);
                    orderByReceipts(sortField, 1);
                    break;
                case SORT_ASC:
                    $scope.sorts[index] = SORT_DESC;
                    orderByReceipts(sortField, -1);
                    break;
                case SORT_DESC:
                    $scope.sorts[index] = SORT_ASC;
                    orderByReceipts(sortField, 1);
                    break;
            }
        };

        function orderByReceipts(fieldName, sort) {
            searchInfo.sortingFields = [fieldName];
            searchInfo.sortingOrder = sort;
            $scope.loadContent(currentViewPage);
        }

        function sortDefault(index) {
            angular.forEach($scope.sorts, function(value, key) {
                $scope.sorts[key] = (key === index) ? SORT_ASC : SORT_DEFAULT;
            });
        }

        $scope.searchReceipts = function (searchParam) {
            searchInfo = searchParam;
            $scope.loadContent(1, true);
        };

        $scope.loadContent = function (currentPage, isSearch) {
            currentViewPage = currentPage;
            $scope.isLoading = true;
            if(isSearch) {
                $scope.searchLoading = false;
            }
            var param = angular.copy(searchInfo);
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageSize)};
            receiptService.searchReceipByPaging(param).then(function (response) {
                $scope.isLoading = false;
                if(isSearch) {
                    $scope.searchLoading = false;
                }
                $scope.receipts = response.receipts;
                $scope.paging = response.paging;
                $scope.dockMapByEntry=response.dockMapByEntry;
            }, function () {
                $scope.isLoading = false;
                if(isSearch) {
                    $scope.searchLoading = false;
                }
            });
        };

        $scope.addReceipt = function() {
            $state.go('wms.inbound.receipt.add');
        };

        $scope.editReceipt = function(receiptId) {
            $state.go('wms.inbound.receipt.edit', { receiptId: receiptId });
        };

        $scope.deleteReceipt = function(receiptId) {
            lincUtil.deleteConfirmPopup('Would you like to remove the this receipt order?', function()
            {
                receiptService.deleteReceipt(receiptId).then(function (){
                    angular.forEach($scope.receipts, function(item, key) {
                        if (item.id === receiptId)
                        {
                            $scope.receipts.splice(key, 1);
                        }
                    });
                    angular.forEach($scope.receiptView, function(item1, key1) {
                        if (item1.id === receiptId)
                        {
                            $scope.receiptView.splice(key1, 1);
                        }
                    });
                },function(error)
                {
                    lincUtil.errorPopup('Delete Error! ' + error.data.error);
                });
            });
        };

        $scope.aysnToHonLoads ={};
        $scope.singleAsynReceiptToHon =function(item,index){
            $scope.aysnToHonLoads[index] = true;
            receiptService.singleSyncReceiptToHon(item.id).then(function(res){
                lincUtil.messagePopup("Message", "Sync Receipt To Hon Successful.");
                $scope.aysnToHonLoads[index] = false;
                item.syncStatu = true;
             }, function (error) {
                    $scope.aysnToHonLoads[index] = false;
                    lincUtil.processErrorResponse(error)
                });
        }

        $scope.export = function (searchParam) {
            if ($scope.exporting) return;
            $scope.exporting = true;
            $http.post("/wms-app/inbound/receipt/export", searchParam, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "receipt.xls");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.bufferErrorPopup(error);
                $scope.exporting = false;
            });
        };

        function init() {
            initSorts();
            $scope.loadContent(1);
        }

        init();

    };
    controller.$inject = ['$scope', '$resource', 'lincResourceFactory',
        'receiptService', 'organizationService', 'lincUtil', '$state', '$http','$mdDialog'];
    return controller;
});
