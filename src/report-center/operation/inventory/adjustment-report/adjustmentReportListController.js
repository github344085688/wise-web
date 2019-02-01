'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, adjustmentService, lincUtil, itemService,$http) {

        $scope.adjustmentSearch = {};
        $scope.adjustmentType = ["Adjust Location", "Adjust LP", "Adjust Status",
            "Adjust QTY", "Adjust Item", "Adjust UOM", "Adjust Customer", "Adjust Title",
            "Adjust Pallet", "Adjust Material"];
        $scope.adjustmentSource = ["Cycle count", "Manual", "Picking"];
        $scope.adjustmentStatus = ["Temp adjust", "True adjust"];
        $scope.adjustmentProgress = ["New", "Complete", "Exception"];
        $scope.adjustmentKind = ["Item", "LP", "Customer", "Title", "Pallet", "Material"];

        $scope.pageSize = 10;
        $scope.total = 0;

        $scope.clearQuery = function () {
            $scope.adjustmentSearch = {};
        }

        $scope.search = function (currentPage) {
            $scope.isSearching = true;
            fomatSearch();
            var param = angular.copy($scope.adjustmentSearch);
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };

            adjustmentService.searchAdjustmentsByPaging(param).then(function(response) {
                $scope.isSearching = false;
                $scope.paging = response.paging;
                $scope.adjustments = response.adjustments;

            }, function (error) {
                $scope.isSearching = false;
                lincUtil.errorPopup(error);
            });
        }

        function fomatSearch() {
            if ($scope.adjustmentSearch.itemSpecId != null && $scope.adjustmentSearch.itemSpecId.length === 0) {
                $scope.adjustmentSearch.itemSpecId = null;
            }
            if ($scope.adjustmentSearch.lpId != null && $scope.adjustmentSearch.lpId.length === 0) {
                $scope.adjustmentSearch.lpId = null;
            }
            $scope.adjustmentSearch.lpIds = null;
            if ($scope.adjustmentSearch.lpId != null) {
                $scope.adjustmentSearch.lpIds = [];
                $scope.adjustmentSearch.lpIds.push($scope.adjustmentSearch.lpId);
            }
            if ($scope.adjustmentSearch.progress != null && $scope.adjustmentSearch.progress.length === 0) {
                $scope.adjustmentSearch.progress = null;
            }
            if ($scope.adjustmentSearch.type != null && $scope.adjustmentSearch.type.length === 0) {
                $scope.adjustmentSearch.type = null;
            }
            if ($scope.adjustmentSearch.status != null && $scope.adjustmentSearch.status.length === 0) {
                $scope.adjustmentSearch.status = null;
            }
            if ($scope.adjustmentSearch.source != null && $scope.adjustmentSearch.source.length === 0) {
                $scope.adjustmentSearch.source = null;
            }
            if ($scope.adjustmentSearch.customerId != null && $scope.adjustmentSearch.customerId.length === 0) {
                $scope.adjustmentSearch.customerId = null;
            }
            if ($scope.adjustmentSearch.titleId != null && $scope.adjustmentSearch.titleId.length === 0) {
                $scope.adjustmentSearch.titleId = null;
            }
        }


        $scope.exporting = false;
        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/wms-app/adjustment/export", $scope.adjustmentSearch, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                $scope.exporting = false;
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    return;
                }
                lincUtil.exportFile(res, "adjustment.xls");

            }, function (error) {
                lincUtil.errorPopup("No data!");
                $scope.exporting = false;
            });
        }

        function init() {
            $scope.search(1);
        }
        init();
    };


    controller.$inject = ['$scope', 'adjustmentService', 'lincUtil', 'itemService' ,'$http' ];
    return controller;
});