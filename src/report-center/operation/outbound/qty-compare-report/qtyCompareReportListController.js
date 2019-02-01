'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $http, lincUtil, reportService) {
        $scope.search = {};
        $scope.pageSize = 10;

        $scope.searchReports = function () {
            $scope.loadContent(1);
        };

        $scope.loadContent = function (currentPage) {
            $scope.loading = true;
            var param = angular.copy($scope.search);
            if (param.shippedTimeFrom) {
                param.shippedTimeFrom = lincUtil.fomateStartDate(new Date(param.shippedTimeFrom));
            }
            if (param.shippedTimeTo) {
                param.shippedTimeTo = lincUtil.fomateEndDate(new Date(param.shippedTimeTo));
            }
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            reportService.searchQtyCompareReport(param).then(function (response) {
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
            var exportData = angular.copy($scope.search);
            if (exportData.shippedTimeFrom) {
                exportData.shippedTimeFrom = lincUtil.fomateStartDate(new Date(exportData.shippedTimeFrom));
            }
            if (exportData.shippedTimeTo) {
                exportData.shippedTimeTo = lincUtil.fomateEndDate(new Date(exportData.shippedTimeTo));
            }

            $http.post('/report-center/outbound/qty-compare-report/download', exportData, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, 'qtyCompareReport.xlsx');
                $scope.exporting = false;

            }, function (error) {
                lincUtil.bufferErrorPopup(error);
                $scope.exporting = false;
            });
        };


    };
    controller.$inject = ['$scope', '$http', 'lincUtil', 'reportService'];
    return controller;
});
