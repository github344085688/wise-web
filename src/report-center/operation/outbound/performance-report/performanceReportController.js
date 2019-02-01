'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $http, lincUtil) {
        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;
            var exportData = {}
            _.forEach($scope.search, function (value, key) {
                if (value) {
                    exportData[key] = value;
                }
            });
            if (exportData.dateFrom) {
                exportData.dateFrom = lincUtil.fomateStartDate(new Date(exportData.dateFrom));
            }
            if (exportData.dateTo) {
                exportData.dateTo = lincUtil.fomateEndDate(new Date(exportData.dateTo));
            }

            $http.post("/report-center/warehouse-performance/download", exportData, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "performanceReport.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };
        $scope.onSelectUser = function (user) {
            $scope.search.userName=user.username;
        };
    };
    controller.$inject = ['$scope', '$http', 'lincUtil'];
    return controller;
});
