'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, locationService, lincResourceFactory, lincUtil) {

        $scope.locationTypes = ["ZONE", "LOCATION", "STAGING", "PARKING", "DOCK", "BASE", "SORTING", "OTHER", "PICK"];
        $scope.checkedLocations = [];
        $scope.searchInfo = {};
         $scope.selectCount =0;
        $scope.pageSize = 10;
        function searchLocationGroup() {
            locationService.searchLocationGroup({}).then(function (data) {
                $scope.locationGroups = data;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });

        }


        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.ok = function () {

            $mdDialog.hide($scope.checkedLocations);
        };

        $scope.isChecked = function (location) {
            var isChecked = false;
            _.forEach($scope.checkedLocations, function (item) {
                if (item.id === location.id) {
                    isChecked = true;
                    return;
                }
            });
            return isChecked;

        };

        $scope.checkLocation = function ($event, location) {
            $event.stopPropagation();
            if ($scope.isChecked(location)) {
                _.remove($scope.checkedLocations, function (item) {
                    return item.id == location.id;
                });
            } else {
                $scope.checkedLocations.push(location);
            }
            $scope.selectCount = $scope.checkedLocations.length;
        };

        $scope.toggleAll = function () {
            if (!$scope.locationLists) return;
            if ($scope.selectAllIsChecked()) {
                $scope.checkedLocations = [];
            } else {
                $scope.checkedLocations = angular.copy($scope.locationLists);
            }
            $scope.selectCount = $scope.checkedLocations.length;

        };

        $scope.selectAllIsChecked = function () {
            if (!$scope.locationLists) return;
            if (!$scope.checkedLocations || $scope.checkedLocations.length == 0) return false;
            if ($scope.checkedLocations.length === $scope.locationLists.length) {
                return true;
            } else {
                return false;
            }
        };



        function searchLocation() {
            $scope.searchLocationCompleted = true;
            var param = angular.copy($scope.searchInfo);
            locationService.searchLocation(param).then(function (response) {
                $scope.searchLocationCompleted = false;
                $scope.locationLists = response;
                $scope.loadContent(1);
            }, function () {
                $scope.searchLocationCompleted = false;
            });
        };

        $scope.loadContent = function (currentPage) {
            $scope.locationListsView = $scope.locationLists.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.locationLists.length ? $scope.locationLists.length : currentPage * $scope.pageSize);
        };

        $scope.search = function () {
            searchLocation();
        };

        function getZone() {
            locationService.getZones().then(function (data) {
                $scope.zones = data;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.getPickTypes = function () {
            return lincResourceFactory.getPickTypes().then(function (response) {
                $scope.pickTypes = response;
            });
        };


        function init() {
            searchLocationGroup();
            getZone();

        }
        init();

    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'locationService', 'lincResourceFactory', 'lincUtil'];
    return controller;
});
