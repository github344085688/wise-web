'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, inventoryService, lincUtil, itemService,$http) {

        $scope.summary_page_Size = 10;
        $scope.detail_page_Size = 10;
        $scope.lock_page_Size = 10;

 
        $scope.search = {};



        $scope.searchInventories = function () {

            var searchParam = angular.copy($scope.search);

            if (searchParam) {
                $scope.loading = true;
                var diverseProperties = organizationDiverseProperties();
                if (diverseProperties.length > 0)
                    searchParam.diverseProperties = diverseProperties

                $scope.searchInventorParam = angular.copy(searchParam);
             

                $scope.loadContent(1);

            }
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
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

        $scope.clearQuery = function () {
            $scope.search = {};
        };

        $scope.itemSpecIdOnSelect = function (itemSpecId) {
            if (itemSpecId) {
                itemService.getItemByIdAndProductId(itemSpecId, null, true).then(function (response) {
                    $scope.diverseFields = response.diverseFields;
                });
            } else {
                $scope.diverseFields = null;
            }
        };

        $scope.loadContent = function (currentPage) {
            if(!$scope.searchInventorParam.includeUomConversion) {
                delete $scope.searchInventorParam.conversionUOM;
            }
            delete $scope.searchInventorParam.includeUomConversi
            $scope.searchInventorParam.paging = { pageNo: Number(currentPage), limit: Number($scope.detail_page_Size) };
            inventoryService.searchByPaging($scope.searchInventorParam).then(function (response) {
                $scope.inventories = response.inventories;
                $scope.itemSpecMap = response.itemSpecMap;
                $scope.diverseMap = response.diverseMap;
                $scope.unitMap = response.unitMap;
                $scope.lpMap = response.lpMap;
                $scope.paging = response.paging;
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

         function checkExportingSearchParam(param) {
             if(!param.statuses && !param.orderIds && !param.receiptIds && !param.sn && !param.lpIds && !param.itemSpecId) {
                 return {error: true, message: 'Empty search filter is not allowed, please fill at least one field in  LP/SN/Order ID/Receipt ID/Inventory Status'}
             }
             return {error: false}
         }

        $scope.exporting = false;
        $scope.export = function () {
            if (!$scope.inventories || $scope.inventories.length === 0) {
                lincUtil.errorPopup("Not data, please search first");
                return;
            }
            if ($scope.exporting) return;

            $scope.searchInventorParam = angular.copy($scope.search);
            if(!$scope.searchInventorParam.includeUomConversion) {
                delete $scope.searchInventorParam.conversionUOM;
            }
            $scope.searchInventorParam.paging = {};
            var checkResult = checkExportingSearchParam($scope.searchInventorParam);
            if(checkResult.error) {
                lincUtil.errorPopup(checkResult.message);
                return;
            }
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

        $scope.searchUomByCustomerId = function (org) {
            $scope.search.conversionUOM = null;
            itemService.getUnitsByCustomerId(org.id).then(function (response) {
                $scope.convertToUomOptions = response;
            });
        };

        function _init(){
            $scope.searchInventorParam ={};
            $scope.loadContent(1);
         }
    
        _init();
    };

   
    controller.$inject = ['$scope', 'inventoryService', 'lincUtil', 'itemService','$http'];
    return controller;
});