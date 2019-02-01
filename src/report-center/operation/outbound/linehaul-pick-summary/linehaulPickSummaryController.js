'use strict';

define(['angular', 'lodash', 'moment'], function (angular, _, moment) {
    var controller = function ($scope, $http, lincUtil) {
        $scope.deliveryDates = ["MondayAM", "MondayPM", "TuesdayAM", "TuesdayPM", "WednesdayAM", "WednesdayPM",
            "ThursdayAM", "ThursdayPM", "FridayAM", "SundayPM"];

        $scope.deliveryDateMaps = [];

        function getDeliveryDates() {
            var dayFrom = moment();
            var weekDay = dayFrom.format("dddd");
            if (weekDay === "Monday") {
                dayFrom = dayFrom.add(-3, 'days');
            } else {
                dayFrom = dayFrom.add(-2, 'days');
            }

            var weekDayMap = {};
            for (var i = 0; i < 7; i++) {
                weekDay = dayFrom.format("dddd");
                weekDayMap[weekDay+"AM"] = dayFrom.format("YYYY-MM-DD");
                weekDayMap[weekDay+"PM"] = dayFrom.format("YYYY-MM-DD");
                dayFrom.add(1, 'days');
            }

            _.forEach($scope.deliveryDates, function (day) {
                $scope.deliveryDateMaps.push({
                    key: day,
                    val: day + "(" + weekDayMap[day] + ")"
                });
            })
        }
        getDeliveryDates();

        $scope.search = {};
        $scope.export = function () {
            if (!$scope.search.customerId || !$scope.search.deliveryDate) {
                lincUtil.messagePopup("Tip", "Please choose customer and weekDate.");
                return;
            }
            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/wms-app/outbound/export-linehaul-pick-summary", $scope.search, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "linehaulPickSummary.xls");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup("No data!");
                $scope.exporting = false;
            });
        };
    };

    controller.$inject = ['$scope', '$http', 'lincUtil'];
    return controller;
});