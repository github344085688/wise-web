'use strict';

define(['angular', 'lodash', './inventoryCountViewController', './importResultController'], function (angular, _, inventoryCountViewCtrl, importResultCtrl) {
    var controller = function ($scope, $http, inventoryService, lincUtil, orderPlanService, inventoryCountService) {

        $scope.page = { pageSize: 10 };
        $scope.currentPage = 1;
        $scope.exportParam = { useBlindCount: false };
        $scope.search = { varianceSource: 'UNIS' };
        $scope.compareStatuLists = ['Acknowledged', 'Confirmed', 'Pending'];
        $scope.varianceStatus = ['Positive', 'Negative', 'Zero'];
        $scope.varianceSources = ['UNIS', 'BevMo'];
        $scope.acknowledgeSingleClickObj = {};
        $scope.unAcknowledgeSingleClickObj = {};
        $scope.singleClickComfirmObj = {};
        $scope.isDisabledAck = true;
        $scope.isDisabledUnAck = true;
        $scope.isDisabledComfirm = true;

        var SORT_DEFAULT = "default";
        var SORT_ASC = "asc";
        var SORT_DESC = "desc";
        $scope.sortsClass = {
            default: 'order-sorting',
            asc: 'order-sorting order-sorting-asc',
            desc: 'order-sorting order-sorting-desc'
        };

        $scope.sorts = [];
        $scope.colDefs = [
            { headerName: 'SKU', field: 'itemSpecId', sort: true },
            { headerName: 'Qty', field: 'countQty', sort: true },
            { headerName: 'Uom.', sort: false },
            { headerName: 'Count Time', field: 'countTime', sort: true },
            { headerName: 'Qty', field: 'inventoryQty', sort: true },
            { headerName: 'Variance', field: 'inventoryVariance', sort: true },
            { headerName: 'Qty', field: 'bevmoQty', sort: true },
            { headerName: 'Variance', field: 'bevmoVariance', sort: true }
        ];
        initSorts();
        function initSorts() {
            var len = $scope.colDefs.length;
            for (var i = 0; i < len; i++) {
                $scope.sorts.push(SORT_DEFAULT);
            }
        }

        $scope.getSortClass = function (index) {
            if ($scope.colDefs[index].sort) {
                return $scope.sortsClass[$scope.sorts[index]];
            }
        }

        $scope.sortClick = function (index) {
            if (!$scope.colDefs[index].sort) {
                return;
            }
            var sort = $scope.sorts[index];
            var sortKey = $scope.colDefs[index].field;

            switch (sort) {
                case SORT_DEFAULT:
                    sortDefault(index);
                    sortSummary(sortKey, 'Asc');
                    break;
                case SORT_ASC:
                    $scope.sorts[index] = SORT_DESC;
                    sortSummary(sortKey, 'Desc');
                    break;
                case SORT_DESC:
                    $scope.sorts[index] = SORT_ASC;
                    sortSummary(sortKey, 'Asc');
                    break;
            }
        };

        function sortDefault(index) {
            angular.forEach($scope.sorts, function (value, key) {
                $scope.sorts[key] = (key === index) ? SORT_ASC : SORT_DEFAULT;
            });
        }

        function sortSummary(field, value) {
            var querySorts = [];
            var querySort = { sortKey: field, action: value }
            querySorts.push(querySort);
            $scope.search.querySorts = querySorts;
            if ($scope.summaryViews && $scope.summaryViews.length > 0) {
                $scope.searchSkuCount(1);
            }
        }

        $scope.searchSkuCount = function (currentPage) {
            $scope.summaryViews = {};
            $scope.checkedSummarys = [];
            if ($scope.loading) {
                return;
            }
            $scope.loading = true;
            $scope.currentPage = currentPage;
            var searchParam = angular.copy($scope.search);
            searchParam.summaryType = "By SKU";
            if (!searchParam.compareStatus) {
                searchParam.compareStatus = "Pending";
            }
            searchParam.paging = { pageNo: Number(currentPage), limit: Number($scope.page.pageSize) };

            return inventoryCountService.searchCompareData(searchParam).then(function (response) {
                if (searchParam.compareStatus == "Pending") {
                    $scope.isDisabledAck = true;
                    $scope.isDisabledUnAck = false;
                    $scope.isDisabledComfirm = true;
                }
                if (searchParam.compareStatus == "Confirmed") {
                    $scope.isDisabledAck = false;
                    $scope.isDisabledUnAck = false;
                    $scope.isDisabledComfirm = false;
                }
                if (searchParam.compareStatus == "Acknowledged") {
                    $scope.isDisabledAck = false;
                    $scope.isDisabledUnAck = true;
                    $scope.isDisabledComfirm = true;
                }

                $scope.summaryViews = response.compareViews;
                $scope.paging = response.paging;
                $scope.loading = false;

            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchSkuCount(1);
            }
            $event.preventDefault();
        };

        $scope.isChecked = function (summaryView) {
            var isChecked = false;
            _.forEach($scope.checkedSummarys, function (item) {
                if (item.itemSpecId === summaryView.itemSpecId) {
                    isChecked = true;
                    return;
                }
            });
            return isChecked;

        };

        $scope.checkSummary = function ($event, summaryView) {
            $event.stopPropagation();
            if ($scope.isChecked(summaryView)) {
                _.remove($scope.checkedSummarys, function (item) {
                    return item.itemSpecId == summaryView.itemSpecId;
                });
            } else {
                $scope.checkedSummarys.push(summaryView);
            }
        };

        $scope.toggleAll = function () {
            if (!$scope.summaryViews) return;
            if ($scope.selectAllIsChecked()) {
                $scope.checkedSummarys = [];
            } else {
                $scope.checkedSummarys = angular.copy($scope.summaryViews);
            }

        };

        $scope.selectAllIsChecked = function () {
            if (!$scope.summaryViews) return;
            if (!$scope.checkedSummarys || $scope.checkedSummarys.length == 0) return false;
            if ($scope.checkedSummarys.length === $scope.summaryViews.length) {
                return true;
            } else {
                return false;
            }
        };

        $scope.importData = function () {
            $scope.isImporting = true;
            inventoryCountService.importInventoryCount().then(function (response) {
               
                $scope.isImporting = false;
                if (response && response.length > 0) {
                    downLoad(response);
                    importResult(response);
                } else {
                    lincUtil.updateSuccessfulPopup();
                }

            }, function (error) {
                $scope.isImporting = false;
                lincUtil.processErrorResponse(error);
            });

        };

        function importResult(importData) {
            var templateUrl = 'inventory/inventorycount/template/inventoryImportResultView.html';
            lincUtil.popupBodyPage(importResultCtrl, templateUrl, null, {
                importLists: importData
            }).then(function () {

            });
        }

        $scope.compareData = function () {
            compareResultData();
            $scope.searchSkuCount(1);
        };

        $scope.exportCountSheet = function () {
            $scope.exportCounting = true;
            var itemSpecIds = _.map($scope.checkedSummarys, 'itemSpecId');
            var param = angular.copy($scope.exportParam);
            if (itemSpecIds.length > 0) {
                param.itemSpecIds = itemSpecIds;
            }
            param.summaryType = "By SKU";
            $http.post("/wms-app/inventory-count/export", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exportCounting = false;
                    return;
                }
                lincUtil.exportFile(res, "countSheetBySKU.xlsx");
                $scope.exportCounting = false;

            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.exportCounting = false;
            });

        };

        $scope.acknowledgeSelected = function () {
            $scope.isAckSelecting = true;
            var itemSpecIds = _.map($scope.checkedSummarys, 'itemSpecId');
            if (itemSpecIds.length > 0) {
                var param = { ids: itemSpecIds };
                inventoryCountService.acknowledgeBySKU(param).then(function (response) {
                    lincUtil.updateSuccessfulPopup(function () {
                        $scope.isAckSelecting = false;
                        $scope.searchSkuCount(1);
                    });

                }, function (error) {
                    lincUtil.processErrorResponse(error);
                    $scope.isAckSelecting = false;
                });
            } else {
                lincUtil.errorPopup("Please select Item first");
                $scope.isAckSelecting = false;
            }

        }

        $scope.unAcknowledgeSelected = function () {
            $scope.isUnAckSelecting = true;
            var itemSpecIds = _.map($scope.checkedSummarys, 'itemSpecId');
            if (itemSpecIds.length > 0) {
                var param = { ids: itemSpecIds };
                inventoryCountService.unAcknowledgeBySKU(param).then(function (response) {
                    lincUtil.updateSuccessfulPopup(function () {
                        $scope.isUnAckSelecting = false;
                        $scope.searchSkuCount(1);
                    });

                }, function (error) {
                    lincUtil.processErrorResponse(error);
                    $scope.isUnAckSelecting = false;
                });
            } else {
                lincUtil.errorPopup("Please select Item first");
                $scope.isUnAckSelecting = false;
            }

        };

        $scope.confirmSelected = function () {
            $scope.isConfirming = true;
            var itemSpecIds = _.map($scope.checkedSummarys, 'itemSpecId');
            if (itemSpecIds.length > 0) {

                var param = { ids: itemSpecIds };
                lincUtil.confirmPopupPromise("Comfirm Message", "Are you sure to Batch cofirm this record?").then(function () {
                    inventoryCountService.confirmBySKU(param).then(function (response) {
                        lincUtil.updateSuccessfulPopup(function () {
                            $scope.isConfirming = false;
                            $scope.searchSkuCount(1);
                        });

                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                        $scope.isConfirming = false;
                    });
                }, function () {
                    $scope.isConfirming = false;
                });

            } else {
                lincUtil.errorPopup("Please select Item first");
                $scope.isConfirming = false;
            }


        };

        $scope.setSingleAcknowledge = function (summaryView, index) {
            $scope.acknowledgeSingleClickObj[index] = true;
            var param = { ids: [summaryView.itemSpecId] };
            inventoryCountService.acknowledgeBySKU(param).then(function (response) {
                lincUtil.updateSuccessfulPopup(function () {
                    $scope.acknowledgeSingleClickObj[index] = false;
                    $scope.searchSkuCount(1);

                });

            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.acknowledgeSingleClickObj[index] = false;
            });

        };

        $scope.setSingleUnAcknowledge = function (summaryView, index) {
            $scope.unAcknowledgeSingleClickObj[index] = true;
            var param = { ids: [summaryView.itemSpecId] };
            inventoryCountService.unAcknowledgeBySKU(param).then(function (response) {
                lincUtil.updateSuccessfulPopup(function () {
                    $scope.unAcknowledgeSingleClickObj[index] = false;
                    $scope.searchSkuCount(1);
                });

            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.unAcknowledgeSingleClickObj[index] = false;
            });

        };

        $scope.setSingleConfirm = function (summaryView, index) {
            $scope.singleClickComfirmObj[index] = true;
            var param = { ids: [summaryView.itemSpecId] };
            lincUtil.confirmPopupPromise("Comfirm Message", "Are you sure to cofirm this record?").then(function () {
                inventoryCountService.confirmBySKU(param).then(function (response) {
                    lincUtil.updateSuccessfulPopup(function () {
                        $scope.singleClickComfirmObj[index] = false;
                        $scope.searchSkuCount(1);
                    });

                }, function (error) {
                    lincUtil.processErrorResponse(error);
                    $scope.singleClickComfirmObj[index] = false;
                });

            }, function () {
                $scope.singleClickComfirmObj[index] = false;
            });

        };

        $scope.countTimeView = function (summaryView) {
            var templateUrl = 'inventory/inventorycount/template/inventoryCountView.html';
            lincUtil.popupBodyPage(inventoryCountViewCtrl, templateUrl, null, {
                itemSpecId: summaryView.itemSpecId,
                locationId: null,
                type: 'SKU'
            }).then(function () {

            });
        };

        $scope.inventoryCountRefreshSummaryData = function(){
            $scope.refreshing = true;
            inventoryCountService.inventoryCountRefreshSummaryData().then(function(){
                $scope.refreshing = false;
                lincUtil.messagePopup("Message", "Refresh Successful.");
            },function(error){
                $scope.refreshing = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function compareResultData() {
            $scope.isComparing = true;
            inventoryCountService.compareResultData({ summaryType: 'By SKU' }).then(function (response) {
                $scope.compareResult = response;
                $scope.isComparing = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isComparing = false;
            });
        }

        function downLoad(data) {
            var param = {
                data: [],
                head: ["textIndex", "locationName", "fileName"]
            };
            _.forEach(data, function (item) {
                var obj = {};
                obj.lpId = item.textIndex;
                obj.locationName = item.locationName;
                obj.itemSpecName = item.fileName;
                param.data.push(obj);
            })

            $http.post("/wms-app/report/export", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "importBySku.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        }


    };
    controller.$inject = ['$scope', '$http', 'inventoryService', 'lincUtil', 'orderPlanService', 'inventoryCountService'];
    return controller;
});