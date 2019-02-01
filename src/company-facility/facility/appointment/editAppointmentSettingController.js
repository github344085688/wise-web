'use strict';

define(['angular'], function (angular) {
    var controller = function ($scope, $state, lincUtil, session, facilityService) {

        var facility = {};
        var facilityId = session.getCompanyFacility().facilityId;
        var originalHourlyAppointmentCapacities;
        init();
        function init() {
            $scope.submitLabel = "Save";
            facilityService.getFacilityByOrgId(facilityId).then(function (response) {
                facility = response;
                $scope.hourlyAppointmentCapacities = response.hourlyAppointmentCapacities;
                if(!$scope.hourlyAppointmentCapacities || ($scope.hourlyAppointmentCapacities
                    && $scope.hourlyAppointmentCapacities.length < 24)) {
                    initHourlyAppointmentCapacities();
                }
                originalHourlyAppointmentCapacities = angular.copy($scope.hourlyAppointmentCapacities);
            }, function (error) {
                initHourlyAppointmentCapacities();
                originalHourlyAppointmentCapacities = angular.copy($scope.hourlyAppointmentCapacities);
            });
        }

        function initHourlyAppointmentCapacities() {
            $scope.hourlyAppointmentCapacities = [{hour: 0}, {hour: 1}, {hour: 2}, {hour: 3}, {hour: 4},
                {hour: 5}, {hour: 6},
                {hour: 7}, {hour: 8}, {hour: 9}, {hour: 10}, {hour: 11}, {hour: 12}, {hour: 13},
                {hour: 14}, {hour: 15}, {hour: 16}, {hour: 17}, {hour: 18}, {hour: 19}, {hour: 20},
                {hour: 21}, {hour: 22}, {hour: 23}
            ];
        }

        $scope.saveFacility = function () {
            $scope.loading = true;
            facility.hourlyAppointmentCapacities = $scope.hourlyAppointmentCapacities;
            facilityService.createAndUpdateFacility(facilityId, facility).then(function (res) {
                $scope.loading = false;
                $scope.submitLabel = "Update";
                lincUtil.saveSuccessfulPopup();
            }, function () {
                $scope.loading = false;
                lincUtil.messagePopup("Error Found");
            });
        };
    };
    controller.$inject = ['$scope', '$state', 'lincUtil', 'session', 'facilityService'];

    return controller;
});
