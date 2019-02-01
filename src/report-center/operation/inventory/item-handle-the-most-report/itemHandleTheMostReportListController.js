'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $http, lincUtil, reportService) {
        $scope.search = {};
        $scope.pageSize = 10;

        $scope.searchReports = function () {
            $scope.loadContent();
        };

        $scope.search = function (currentPage) {
            $scope.reportDataView = $scope.reportData.slice((currentPage - 1) * $scope.pageSize, currentPage * $scope.pageSize > $scope.reportData.length ? $scope.reportData.length : currentPage * $scope.pageSize);
        };

        $scope.loadContent = function () {
            $scope.loading = true;
            var param = {}
            _.forEach($scope.search, function (value, key) {
                if (value) {
                    param[key] = value;
                }
            });
            if (param.timeTo) {
                param.timeTo = param.timeTo.replace("00:00:00", "23:59:59");
            }
            reportService.searchItemHandleTheMostReport(param).then(function (response) {
                $scope.loading = false;
                $scope.reportHead = response.results.head;
                $scope.reportData = response.results.data;
                $scope.search(1);
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
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
            if (exportData.timeTo) {
                exportData.timeTo = exportData.timeTo.replace("00:00:00", "23:59:59");
            }

            $http.post('/report-center/item-spec/handle-the-most/export', exportData, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, 'itemHandleTheMostReport.xlsx');
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
