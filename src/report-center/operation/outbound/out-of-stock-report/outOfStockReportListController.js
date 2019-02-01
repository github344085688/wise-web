'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $http, lincUtil, reportService) {
        $scope.search = {};

        $scope.searchReports = function () {
            $scope.loadContent();
        };

        $scope.loadContent = function () {
            $scope.loading = true;
            var param = {}
            _.forEach($scope.search, function (value, key) {
                if (value) {
                    param[key] = value;
                }
            });
            if (param.timeFrom) {
                param.timeFrom = lincUtil.fomateStartDate(new Date(param.timeFrom));
            }
            if (param.timeTo) {
                param.timeTo = lincUtil.fomateEndDate(new Date(param.timeTo));
            }
            reportService.searchOutOfStockReport(param).then(function (response) {
                $scope.loading = false;
                $scope.reportHead = response.results.head;
                $scope.reportData = response.results.data;

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });

        };

        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;
            var exportData = {}
            _.forEach($scope.search, function (value, key) {
                if (value) {
                    exportData[key] = value;
                }
            });
            if (exportData.timeFrom) {
                exportData.timeFrom = lincUtil.fomateStartDate(new Date(exportData.timeFrom));
            }
            if (exportData.timeTo) {
                exportData.timeTo = lincUtil.fomateEndDate(new Date(exportData.timeTo));
            }

            $http.post('/report-center/outbound/out-of-stock-report/download', exportData, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, 'outOfStockReport.xlsx');
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };


    };
    controller.$inject = ['$scope', '$http', 'lincUtil', 'reportService'];
    return controller;
});
