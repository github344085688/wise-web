'use strict';
define([], function () {
    var controller = function ($scope, $state, $stateParams, lincUtil, isAddAction, locationService, lincResourceFactory) {

        $scope.LocationGroupTypes = ["Cold", "Dry", "Lock"];
        $scope.PickScenarios = ["Dry Case Pick", "Dry Each Pick", "Wet Case pick", "Wet Each Pick"];
        $scope.supportEquipments = ["Forklift", "Pallet Jack"];

        function init() {
            getAllLocationGroup();
            $scope.isAddAction = $stateParams.locationGroupId ? false : true;
            if ($scope.isAddAction) {
                $scope.submitLabel = "Save";
                $scope.locationGroup = {};

            } else {
                $scope.submitLabel = "Update";
                locationService.getLocationGroupById($stateParams.locationGroupId).then(function (response) {
                    $scope.locationGroup = response;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }

        }

        init();


        $scope.addOrUpdateLocation = function () {
            $scope.loading = true;
            if ($scope.isAddAction && !$scope.locationGroup.id) {
                locationService.addLocationGroup($scope.locationGroup).then(function (response) {
                    $scope.loading = false;
                    if (response.error) {
                        lincUtil.processErrorResponse(error);
                        return;
                    }
                    $scope.locationGroup.id = response.id;
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go("fd.location-group.list");
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            } else {
                locationService.updateLocationGroup($scope.locationGroup).then(function () {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go("fd.location-group.list");
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        };

        $scope.getPickTypes = function() {
            return lincResourceFactory.getPickTypes().then(function(response) {
                $scope.pickTypes = response;
            });
        };

        $scope.cancelEditLocation = function () {
            $state.go("fd.location-group.list");
        };
        
        $scope.onSelect = function (propertyName) {
            if($scope.locationGroup && $scope.locationGroup.id) {
                if(!$scope.locationGroup[propertyName]) {
                    $scope.locationGroup[propertyName] = null;
                }
            }
        };

        $scope.onSelectParentGroup = function (parentGroup) {
            if(isAddAction &&$scope.locationGroup && parentGroup) {
                $scope.locationGroup.locationGroupType = parentGroup.locationGroupType;
                $scope.locationGroup.supportPickType = parentGroup.supportPickType;
                $scope.locationGroup.supportEquipments = parentGroup.supportEquipments;
            }

            $scope.onSelect("parentId");
        };

        function getAllLocationGroup() {
            locationService.searchLocationGroup({}).then(function (data) {
                $scope.locationGroups = data;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }
        

    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'isAddAction', 'locationService', 'lincResourceFactory'];

    return controller;
});
