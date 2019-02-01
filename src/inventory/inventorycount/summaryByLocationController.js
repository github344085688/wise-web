'use strict';

define(['angular', 'lodash', './inventoryCountViewController'], function (angular, _, inventoryCountViewCtrl) {
    var controller = function ($scope, $http, locationService, lincUtil, orderPlanService, inventoryCountService) {

        $scope.page = { pageSize: 10 };
        $scope.currentPage = 1;
        $scope.search = {};
        $scope.exportParam = { useBlindCount: false };
        $scope.compareStatuLists = ['Acknowledged', 'Confirmed', 'Pending'];
        $scope.varianceStatus = ['Positive', 'Negative', 'Zero'];
        $scope.acknowledgeSingleClickObj = {};
        $scope.unAcknowledgeSingleClickObj = {};
        $scope.isDisabledAck = true;
        $scope.isDisabledUnAck = true;

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
            { headerName: 'Location', field: 'locationId', sort: true },
            { headerName: 'Qty.', field: 'countQty', sort: true },
            { headerName: 'Uom', sort: false },
            { headerName: 'Count Time', field: 'countTime', sort: true },
            { headerName: 'Qty', field: 'inventoryQty', sort: true },
            { headerName: 'Variance', field: 'inventoryVariance', sort: true }
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
            var sortField = $scope.colDefs[index].field;
            switch (sort) {
                case SORT_DEFAULT:
                    sortDefault(index);
                    sortInventoryByLocation(sortField, "Asc")
                    break;
                case SORT_ASC:
                    $scope.sorts[index] = SORT_DESC;
                    sortInventoryByLocation(sortField, "Desc")
                    break;
                case SORT_DESC:
                    $scope.sorts[index] = SORT_ASC;
                    sortInventoryByLocation(sortField, "Asc")
                    break;
            }
        };

        function sortDefault(index) {
            angular.forEach($scope.sorts, function (value, key) {
                $scope.sorts[key] = (key === index) ? SORT_ASC : SORT_DEFAULT;
            });
        }

        function sortInventoryByLocation(field, value) {
            var querySorts = [];
            var querySort = { sortKey: field, action: value }
            querySorts.push(querySort);
            $scope.search.querySorts = querySorts;
            if ($scope.locationLevelViews && $scope.locationLevelViews.length > 0) {
                $scope.searchLocationCount(1);
            }
        }

        $scope.searchLocationCount = function (currentPage) {
            $scope.locationLevelViews = {};
            $scope.checkedLocationLevels = [];
            if ($scope.loading) {
                return;
            }
            $scope.loading = true;
            $scope.currentPage = currentPage;
            var searchParam = angular.copy($scope.search);
            searchParam.summaryType = "By LOC";
            if (!searchParam.compareStatus) {
                searchParam.compareStatus = "Pending";
            }
            searchParam.paging = { pageNo: Number(currentPage), limit: Number($scope.page.pageSize) };

            inventoryCountService.searchCompareData(searchParam).then(function (response) {
                if (searchParam.compareStatus == "Pending") {
                    $scope.isDisabledAck = true;
                    $scope.isDisabledUnAck = false;

                }
                if (searchParam.compareStatus == "Confirmed") {
                    $scope.isDisabledAck = false;
                    $scope.isDisabledUnAck = false;

                }
                if (searchParam.compareStatus == "Acknowledged") {
                    $scope.isDisabledAck = false;
                    $scope.isDisabledUnAck = true;

                }
                $scope.loading = false;
                $scope.paging = response.paging;
                $scope.locationLevelViews = response.compareViews;
                addIndexToLocationLevelViews($scope.locationLevelViews);
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        function addIndexToLocationLevelViews(locationLevelViews) {
            _.forEach(locationLevelViews, function (obj, key) {
                obj.index = key;
            })
        }

        $scope.getLocations = function (searchName) {
            locationService.locationSearchByPaging({ regexName: searchName, paging: { pageNo: 1, limit: 10 } }).then(function (response) {
                $scope.locationList = response.locations;
            });
        };

        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchLocationLevel();
            }
            $event.preventDefault();
        };

        $scope.isChecked = function (locationLevelView) {
            var isChecked = false;
            _.forEach($scope.checkedLocationLevels, function (item) {
                if (item.index === locationLevelView.index) {
                    isChecked = true;
                    return;
                }
            });
            return isChecked;

        };

        $scope.checkSummary = function ($event, locationLevelView) {
            $event.stopPropagation();
            if ($scope.isChecked(locationLevelView)) {
                _.remove($scope.checkedLocationLevels, function (item) {
                    return item.index == locationLevelView.index;
                });
            } else {
                $scope.checkedLocationLevels.push(locationLevelView);
            }
        };

        $scope.toggleAll = function () {
            if (!$scope.locationLevelViews) return;
            if ($scope.selectAllIsChecked()) {
                $scope.checkedLocationLevels = [];
            } else {
                $scope.checkedLocationLevels = angular.copy($scope.locationLevelViews);
            }

        };

        $scope.selectAllIsChecked = function () {
            if (!$scope.locationLevelViews) return;
            if (!$scope.checkedLocationLevels || $scope.checkedLocationLevels.length == 0) return false;
            if ($scope.checkedLocationLevels.length === $scope.locationLevelViews.length) {
                return true;
            } else {
                return false;
            }
        };

        $scope.exportCountSheet = function () {
            $scope.exportCounting = true;
            var itemSpecIds = _.map($scope.checkedLocationLevels, 'itemSpecId');
            var locationIds = _.map($scope.checkedLocationLevels, 'locationId');
            var param = angular.copy($scope.exportParam);
            if (itemSpecIds.length > 0) {
                param.itemSpecIds = itemSpecIds;
            }
            if (locationIds.length > 0) {
                param.locationIds = locationIds;
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
                lincUtil.exportFile(res, "countSheetByLocation.xlsx");
                $scope.exportCounting = false;

            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.exportCounting = false;
            });
        };

        $scope.acknowledgeSelected = function () {
            $scope.isAckSelecting = true;
            var locationIds = _.map($scope.checkedLocationLevels, "locationId");
            if (locationIds.length > 0) {
                var param = { ids: locationIds };
                inventoryCountService.acknowledgeByLocation(param).then(function (response) {
                    lincUtil.updateSuccessfulPopup(function () {
                        $scope.isAckSelecting = false;
                        $scope.searchLocationCount(1);
                    });

                }, function (error) {
                    lincUtil.processErrorResponse(error);
                    $scope.isAckSelecting = false;
                });
            } else {
                lincUtil.errorPopup("Please select Item first");
                $scope.isAckSelecting = false;
            }

        };

        $scope.unAcknowledgeSelected = function () {
            $scope.isUnAckSelecting = true;
            var locationIds = _.map($scope.checkedLocationLevels, "locationId");
            if (locationIds.length > 0) {
                var param = { ids: locationIds };
                inventoryCountService.unAcknowledgeByLocation(param).then(function (response) {
                    lincUtil.updateSuccessfulPopup(function () {
                        $scope.isUnAckSelecting = false;
                        $scope.searchLocationCount(1);
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

        $scope.setSingleAcknowledge = function (locationLevelView, index) {
            $scope.acknowledgeSingleClickObj[index] = true;
            var param = { ids: [locationLevelView.locationId] };
            inventoryCountService.acknowledgeByLocation(param).then(function (response) {
                lincUtil.updateSuccessfulPopup(function () {
                    $scope.acknowledgeSingleClickObj[index] = false;
                    $scope.searchLocationCount(1);
                });

            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.acknowledgeSingleClickObj[index] = false;
            });
        };

        $scope.setSingleUnAcknowledge = function (locationLevelView, index) {
            $scope.unAcknowledgeSingleClickObj[index] = true;
            var param = { ids: [locationLevelView.locationId] };

            inventoryCountService.unAcknowledgeByLocation(param).then(function (response) {
                lincUtil.updateSuccessfulPopup(function () {
                    $scope.unAcknowledgeSingleClickObj[index] = false;
                    $scope.searchLocationCount(1);
                });

            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.unAcknowledgeSingleClickObj[index] = false;
            });

        };

        $scope.countTimeView = function (locationLevelView) {
            var templateUrl = 'inventory/inventorycount/template/inventoryCountView.html';
            lincUtil.popupBodyPage(inventoryCountViewCtrl, templateUrl, null, {
                itemSpecId: null,
                locationId: locationLevelView.locationId,
                type: 'LOC'
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
            inventoryCountService.compareResultData({ summaryType: 'By LOC' }).then(function (response) {
                $scope.compareResult = response;
                $scope.isComparing = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isComparing = false;
            });
        }

      
        // _init();
        // function _init() {
        //     compareResultData();
        // }

    };
    controller.$inject = ['$scope', '$http', 'locationService', 'lincUtil', 'orderPlanService', 'inventoryCountService'];
    return controller;
});