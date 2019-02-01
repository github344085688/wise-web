'use strict';
define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope,  $http,  lincUtil, inventoryService) {
        $scope.search = {};
        $scope.pageSize = 10;

        $scope.searchReports = function () {
            $scope.loadContent(1);
        };

        $scope.loadContent = function (currentPage) {
            $scope.loading = true;
            $scope.search.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            inventoryService.legacyInventoryMakePalletReport($scope.search).then(function (response) {
                $scope.loading = false;
                $scope.reportHead = response.results.head;
                $scope.reportData = response.results.data;
                $scope.paging = response.paging;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            });
        };

        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;
            $http.post('/report-center/legacy-inventory/make-pallet-adjustment-report/download', $scope.search, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength === 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, 'legacyInventoryMakePalletReport.xlsx');
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };


    };
    controller.$inject = ['$scope', '$http',  'lincUtil', 'inventoryService'];
    return controller;
});
