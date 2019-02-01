'use strict';
define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope,  $http,  lincUtil, inventoryService) {
        $scope.search = {};

        $scope.searchReports = function () {
            $scope.loadContent();
        };

        $scope.loadContent = function () {
            $scope.loading = true;
            var param ={};
            param = angular.copy($scope.search);
            if(param.itemSpecIds) param.itemSpecIds = [param.itemSpecIds];
            if(param.timeTo) param.timeTo = param.timeTo.replace("00:00:00", "23:59:59");
            inventoryService.searchTurns(param).then(function (response) {
                $scope.loading = false;
                $scope.reportHead = response.results.head;
                $scope.reportData = response.results.data;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            });
        };

        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;
            var exportData = {};
            exportData = angular.copy($scope.search);
            if (exportData.timeTo) {
                exportData.timeTo = exportData.timeTo.replace("00:00:00", "23:59:59");
            }
            if(exportData.itemSpecIds) exportData.itemSpecIds = [exportData.itemSpecIds];
            $http.post('/report-center/inventory/turns/download', exportData, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, 'inventoryTurnsReport.xlsx');
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
