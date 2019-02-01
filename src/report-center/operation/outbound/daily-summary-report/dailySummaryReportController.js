'use strict';

define(['angular'], function (angular) {
    var controller = function ($scope, $http, lincUtil) {
        $scope.deliveryDate = ["MondayAM", "MondayPM", "TuesdayAM", "TuesdayPM", "WednesdayAM", "WednesdayPM",
            "ThursdayAM", "ThursdayPM", "Friday", "Saturday", "Sunday"];

        $scope.search = {};
        $scope.export = function () {
            //if (!$scope.search.customerId || !$scope.search.deliveryDate) {
            if (!$scope.search.customerId) {
                //lincUtil.messagePopup("Tip", "Please choose customer and deliveryDate.");
                lincUtil.messagePopup("Tip", "Please choose customer.");
                return;
            }
            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/wms-app/outbound/export-daily-summary", $scope.search, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "LongHaul Daily Summary Report.xls");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };
    };

    controller.$inject = ['$scope', '$http', 'lincUtil'];
    return controller;
});