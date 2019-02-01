'use strict';

define(['angular'], function(angular) {
    var controller = function($scope) {
        $scope.billTypes = ["Prebill", "Latebill"];
        $scope.frequencys = ["Daily", "Weely", "Bi-Weekly", "Semi-Monthly", "Monthly", "Yearly"];
        $scope.categorys = ["Storage", "Service", "Handling", "Material", "Freight", "Sales", "Others"];
        $scope.weak = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

        $scope.showDate = false;
        $scope.showDate2 = false;
        $scope.showTime = false;
        $scope.showWeak = false;

        $scope.requencyChange = function (frequency) {
            $scope.showDate = false;
            $scope.showDate2 = false;
            $scope.showTime = false;
            $scope.showWeak = false;

            if (frequency === "Daily") {
                $scope.showTime = true;
            }
            if (frequency === "Weely" || frequency === "Bi-Weekly") {
                $scope.showWeak = true;
            }
            if (frequency === "Semi-Monthly") {
                $scope.showDate = true;
                $scope.showDate2 = true;
            }
            if (frequency === "Monthly" || frequency === "Yearly") {
                $scope.showDate = true;
            }
        };
    };

    controller.$inject = ['$scope'];
    return controller;
});