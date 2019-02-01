'use strict';

define(['angular'], function (angular) {
    var controller = function ($scope, $http, lincUtil, pickService) {

        $scope.export = function () {
            if (!$scope.pickStrategy || $scope.pickStrategy.length === 0) {
                lincUtil.errorPopup("Not data export");
                return;
            }
            if ($scope.exporting) return;
            $scope.exporting = true;

            var param = {};
            param.data = $scope.pickStrategy;
            param.head = ["location", "lpId", "taskId", "status", "orderId", "item", "uom", "qty", "assigneeUser", "createdWhen", "createdBy"];

            $http.post("/wms-app/report/export", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "pickStrategyReport.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        function init() {
            $scope.isLoading = true;
            pickService.getPickStrategyReport().then(function (data) {
                $scope.isLoading = false;
                $scope.pickStrategy = data;
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }
        init();
    };

    controller.$inject = ['$scope', '$http', 'lincUtil', 'pickService'];
    return controller;
});