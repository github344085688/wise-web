'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, locationService, lincUtil, lincResourceFactory) {

        $scope.pageSize = 10;
        $scope.searchInfo = {};
        $scope.LocationGroupTypes = ["Cold", "Dry", "Lock"];
        $scope.supportEquipments = ["Forklift", "Pallet Jack"];

        searchLocationGroup({});

        $scope.search = function () {
            searchLocationGroup($scope.searchInfo);
        };

        function searchLocationGroup(param) {
            $scope.searchLocationCompleted = false;
            locationService.searchLocationGroupFromBam(param).then(function (data) {
                $scope.locationGroups = data.locationGroupLists;
                $scope.locationGroupIsMap = data.locationMap;
                $scope.loadContent(1);
                $scope.searchLocationCompleted = true;
            }, function (error) {
                $scope.searchLocationCompleted = true;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.locationGroupView = $scope.locationGroups.slice((currentPage - 1) * $scope.pageSize, currentPage * $scope.pageSize > $scope.locationGroups.length ? $scope.locationGroups.length : currentPage * $scope.pageSize);
        };

        $scope.remove = function (locationGroup) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                locationService.deleteLocationGroup(locationGroup.id).then(function () {
                    searchLocationGroup({});
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.getPickTypes = function () {
            return lincResourceFactory.getPickTypes().then(function (response) {
                $scope.pickTypes = response;
            });
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.search();
            }
            $event.preventDefault();
        };
    };
    controller.$inject = ['$scope', '$mdDialog', 'locationService', 'lincUtil', 'lincResourceFactory'];
    return controller;
});
