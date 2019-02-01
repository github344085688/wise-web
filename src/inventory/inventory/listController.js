'use strict';

define(['angular', 'lodash', './releaseLockQtyController'], function (angular, _, releaseLockQtyController) {
    var controller = function ($scope, $http, inventoryService, lincUtil, itemService, $mdDialog) {

        $scope.summary_page_Size = 10;
        $scope.detail_page_Size = 10;
        $scope.lock_page_Size = 10;

        $scope.searchInventoriesCompleted = true;
        $scope.inventoryStatus = ['Receiving', 'Available', 'Damage', 'Picked', 'Packed', 'Loaded', 'Shipped', 'UnShipped', 'OnHold', 'Reserved'];
        $scope.search = {};
        $scope.activetab = "summary";
        $scope.searchInventories = function () {
            var searchParam = angular.copy($scope.search);
            if (searchParam) {
                if(!searchParam.sn){
                    delete searchParam.sn;
                }
                var diverseProperties = organizationDiverseProperties();
                if (diverseProperties.length > 0) {
                    searchParam.diverseProperties = diverseProperties;
                }
                var searchInventorParam = angular.copy(searchParam);
                if (searchParam.status && searchParam.status === 'UnShipped') {
                    delete searchInventorParam.status;
                    searchInventorParam.statuses = ['Available', 'Loaded', 'Packed', 'Picked', 'Damage', 'OnHold']
                }
                $scope.searchSummerParam = angular.copy(searchInventorParam);
                $scope.searchInventorParam = angular.copy(searchInventorParam);
                $scope.searchLockParam = angular.copy(searchParam);

                $scope.loadSummaryContent(1);
                $scope.loadContent(1);
                $scope.loadInventoryLockContent(1);
            }
        };

        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchInventories();
            }
            $event.preventDefault();
        };

        function organizationDiverseProperties() {
            var proList = [];
            if ($scope.search.itemSpecId) {
                angular.forEach($scope.diverseFields, function (field) {
                    if (field.selectedProduct) {
                        proList.push({
                            propertyId: field.propertyId, propertyName: field.itemProperty.name, value: field.selectedProduct.value,
                            unit: field.selectedProduct.unit
                        });
                    }
                });
            }
            return proList;
        }

   
        $scope.itemSpecIdOnSelect = function (itemSpecId) {
            $scope.isLoading=true;
            if (itemSpecId) {
                itemService.getItemByIdAndProductId(itemSpecId, null, true).then(function (response) {
                    $scope.diverseFields = response.diverseFields;
                    $scope.notDiverseFields=_.orderBy(response.notDiverseFields,'dynamicName');
                    $scope.isLoading=false;
                });
            } else {
                $scope.diverseFields = null;
                $scope.notDiverseFields=null;
                $scope.isLoading=false;
            }
        }

        $scope.changeTab = function (tab) {
            $scope.activetab = tab;
        };

        $scope.loadContent = function (currentPage) {
            $scope.searchInventorParam.paging = { pageNo: Number(currentPage), limit: Number($scope.detail_page_Size) };
            inventoryService.searchByPaging($scope.searchInventorParam).then(function (response) {
                $scope.inventories = response.inventories;
                $scope.itemSpecMap = response.itemSpecMap;
                $scope.diverseMap = response.diverseMap;
                $scope.unitMap = response.unitMap;
                $scope.lpMap = response.lpMap;
                $scope.paging = response.paging;
            }, function (error) {
                $scope.searchInventoriesCompleted = true;
                lincUtil.errorPopup(error.data.error);
            });
        };

        $scope.loadInventoryLockContent = function (currentPage) {
            if (($scope.searchLockParam.lpIds && $scope.searchLockParam.lpIds.length > 0) || ($scope.searchLockParam.locationIds && $scope.searchLockParam.locationIds.length > 0)) {
                clearInventoryLock();
                return;
            }
            $scope.searchLockParam.paging = { pageNo: Number(currentPage), limit: Number($scope.lock_page_Size) };
            inventoryService.searchInventoryLocksByPaging($scope.searchLockParam).then(function (response) {
                $scope.inventoryLock = response.inventories;
                $scope.inventoryLockItemSpecMap = response.itemSpecMap;
                $scope.inventoryLockDiverseMap = response.diverseMap;
                $scope.inventoryLockUnitMap = response.unitMap;
                $scope.inventoryLockOrganizaitonMap = response.organizaitonMap;
                $scope.inventoryLockPaging = response.paging;
            }, function (error) {
                $scope.searchInventoriesCompleted = true;
                lincUtil.errorPopup(error.data.error);
            });
        };

        function clearInventoryLock() {
            $scope.inventoryLock = {};
            $scope.inventoryLockItemSpecMap = {};
            $scope.inventoryLockDiverseMap = {};
            $scope.inventoryLockUnitMap = {};
            $scope.inventoryLockOrganizaitonMap = {};
            $scope.inventoryLockPaging = {};
        }

        $scope.loadSummaryContent = function (currentPage) {
            $scope.loading = true;
            $scope.searchInventoriesCompleted = false;
            $scope.searchSummerParam.paging = { pageNo: Number(currentPage), limit: Number($scope.summary_page_Size) };
            inventoryService.searchSummaryByPaging($scope.searchSummerParam).then(function (response) {
                $scope.loading = false;
                $scope.searchInventoriesCompleted = true;
                $scope.inventorySum = response.inventories;
                $scope.itemSpecMapSum = response.itemSpecMap;
                $scope.diverseMapSum = response.diverseMap;
                $scope.unitMapSum = response.unitMap;
                $scope.pagingSum = response.paging;
            }, function (error) {
                $scope.loading = false;
                $scope.searchInventoriesCompleted = true;
                lincUtil.errorPopup(error.data.error);
            });
        };


        $scope.export = function () {
            if (!$scope.inventories || $scope.inventories.length === 0) {
                lincUtil.errorPopup("Not data, please search first");
                return;
            }
            if ($scope.exporting) return;

            $scope.exporting = true;
            $http.post("/wms-app/inventory/export", $scope.searchInventorParam, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                $scope.exporting = false;
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    return;
                }
                lincUtil.exportFile(res, "inventory.xlsx");

            }, function (error) {
                $scope.exporting = false;
                lincUtil.errorPopup("No data!");

            });
        };

        $scope.getLocations = function (keyword) {
            var param = { regexName: keyword, scenario: 'Auto Complete' };
            locationService.getLocationList(param).then(function (response) {
                $scope.locations = response;
            });
        };

        $scope.releaseQty = function (inventory) {
            var form = {
                templateUrl: 'inventory/inventory/template/releaseLockQty.html',
                locals: {
                    inventory: inventory,
                    inventoryLockItemSpecMap: $scope.inventoryLockItemSpecMap
                },
                autoWrap: true,
                controller: releaseLockQtyController
            };
            $mdDialog.show(form).then(function(){
                $scope.searchInventories();
            });
        }

    };
    controller.$inject = ['$scope', '$http', 'inventoryService', 'lincUtil', 'itemService', '$mdDialog'];
    return controller;
});