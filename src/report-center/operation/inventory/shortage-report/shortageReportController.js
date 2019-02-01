'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, lincUtil,$http) {

        $scope.param = {};
        $scope.exporting = false;
        $scope.export = function () {
            if (!$scope.param.customerId) {
                lincUtil.errorPopup("Please select a customer!");
                return;
            }

            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/wms-app/shortage-report/export", $scope.param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                $scope.exporting = false;
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    return;
                }
                lincUtil.exportFile(res, "shortage-report.xlsx");

            }, function (error) {
                lincUtil.errorPopup("No data!");
                $scope.exporting = false;
            });
        };

    };

    controller.$inject = ['$scope', 'lincUtil','$http'];
    return controller;
});