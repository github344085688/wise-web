'use strict';

define(["lodash"], function (_) {
    var $scope = function ($scope, uomPickTypeService, itemService, uomDefinitionService, lincUtil) {
        $scope.pageSize = 10;
        $scope.searchInfo = {};
        $scope.pickTypes = ['Bulk Pick', 'Pallet Pick', 'Piece Pick', 'Case Pick', 'None'];

        function searchUomPickType(searchParam) {
            $scope.loading = true;
            if (!$scope.searchInfo.customerId) {
                delete $scope.searchInfo.customerId;
            }
            if (!$scope.searchInfo.itemSpecId) {
                delete $scope.searchInfo.itemSpecId;
            }
            searchParam.isSearchAll = true
            uomPickTypeService.searchUomPickType(searchParam).then(function (data) {
                $scope.loading = false;
                $scope.uomPickTypes = data;
                $scope.loadContent(1);
            }, function () {});
        }

        $scope.search = function () {
            searchUomPickType($scope.searchInfo);
        };

        $scope.onSelect = function () {
            $scope.searchInfo.referenceUnit = null;
            if (!$scope.searchInfo.customerId || !$scope.searchInfo.itemSpecId) {
                $scope.units = [];
                $scope.searchInfo.itemSpecId = null;
             
            }
            if ($scope.searchInfo.itemSpecId) {
                itemService.searchItemUnits({
                    itemSpecId: $scope.searchInfo.itemSpecId
                }).then(function (response) {
                    $scope.units = response.units;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            } else {
                searchUomDefinition({
                    customerId: $scope.searchInfo.customerId
                });
            }


        };

        function searchUomDefinition(param) {
            uomDefinitionService.searchUomDefinition(param).then(function (response) {
                if (!$scope.searchInfo.customerId) {
                    $scope.units = _.filter(response.uomDefinitions, function (uomDefini) {
                        return !uomDefini.customerIds || uomDefini.customerIds.length === 0;
                    });
                } else {
                    $scope.units = response.uomDefinitions;
                }

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.uomPickTypeView = $scope.uomPickTypes.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.uomPickTypes.length ? $scope.uomPickTypes.length : currentPage * $scope.pageSize);
        };



        $scope.delete = function (id) {
            lincUtil.confirmPopup("Delete Uom Pick Type", "Are you sure to delete this uom pick type?", function () {

                uomPickTypeService.deleteUomPickType(id).then(function () {
                    searchUomPickType({});
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.search();
            }
            $event.preventDefault();
        };

        function _init() {
            searchUomPickType({});
            searchUomDefinition({});
        }

        _init();
    };
    $scope.$inject = ['$scope', 'uomPickTypeService', 'itemService', 'uomDefinitionService', 'lincUtil'];
    return $scope;
});