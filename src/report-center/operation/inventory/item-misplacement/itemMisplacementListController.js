'use strict';
define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope,  $http,  lincUtil, inventoryService) {
        $scope.search = {};
        $scope.pageSize = 10;
        var currentViewPage;
        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchReports();
            }
            $event.preventDefault();
        }

        $scope.searchReports = function () {
            $scope.loadContent(1);
        };

        $scope.loadContent = function (currentPage) {
            currentViewPage = currentPage;
            $scope.loading = true;
            var param ={}
            param.customerId=$scope.search.customerId;
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            inventoryService.itemErrorDistributed(param).then(function (response) {
                $scope.loading = false;
                $scope.paging = response.paging;
                $scope.reportHead = response.results.head;
                $scope.reportData = response.results.data;

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.export = function() {
            if ($scope.exporting) return;
            $scope.exporting = true;
            var exportData =angular.copy( $scope.search);
            $http.post("/report-center/inventory/item-error-distributed/download", exportData, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "itemMisplacement.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        function init() {
            $scope.loadContent(1);
        }
        init();
    };
    controller.$inject = ['$scope', '$http',  'lincUtil', 'inventoryService'];
    return controller;
});
