'use strict';

define(['angular', 'lodash', 'moment'], function (angular, _, moment) {
    var controller = function ($scope, lincUtil, reportService, $http, lincResourceFactory) {

        $scope.searchInfo = {};

        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;
            $scope.param = angular.copy($scope.searchInfo);
            if($scope.param.timeTo) $scope.param.timeTo = $scope.param.timeTo.replace("00:00:00", "23:59:59");
            if($scope.param.receivedTimeTo) $scope.param.receivedTimeTo = $scope.param.receivedTimeTo.replace("00:00:00", "23:59:59");
            if($scope.param.shippedTimeTo) $scope.param.shippedTimeTo = $scope.param.shippedTimeTo.replace("00:00:00", "23:59:59");
            $http.post("/report-center/activity/activity-report/download", $scope.param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "activityReoport.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.bufferErrorPopup(error);
                $scope.exporting = false;
            });
        };

       
    };
    controller.$inject = ['$scope', 'lincUtil', 'reportService', '$http', 'lincResourceFactory'];
    return controller;
});