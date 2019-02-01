'use strict';

define([
    'angular',
    'lodash',
    './selectLocationController'
], function (angular, _, selectLocationController) {
    var controller = function ($scope, $mdDialog, $state, $stateParams, isAddAction, lincUtil, locationService) {

        var CREATE_TITLE = "Add Location Tag";
        var EDIT_TITLE = "Edit Location Tag";

        $scope.locations = [];
        $scope.locationTag = {};
        var originLocations;
        $scope.pageSize = 10;

        $scope.selectLocation = function (entry) {
            var templateUrl = 'company-facility/facility/resource/location-tag/template/selectLocation.html';
            lincUtil.popupBodyPage(selectLocationController, templateUrl, null, {
            }).then(function (checkedLocations) {

                $scope.locations = _.unionBy($scope.locations, checkedLocations, 'id');
                originLocations=angular.copy($scope.locations);
                $scope.loadContent(1);
            });
        };

        $scope.selectLocationName = function (locationName) {
            if (originLocations && originLocations.length > 0) {
                $scope.locations = _.filter(originLocations, function (location) {
                    return location.name.toLowerCase().indexOf(locationName.toLowerCase()) > -1;
                });
                $scope.loadContent(1);
            }
        }

        $scope.loadContent = function (currentPage) {
            $scope.locationsView = $scope.locations.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.locations.length ? $scope.locations.length : currentPage * $scope.pageSize);
        };

        $scope.submit = function () {

            if (validateFields()) {
                var locationTagParam = angular.copy($scope.locationTag);
                locationTagParam.locationIds = _.map($scope.locations, "id");

                if (!isAddAction) {
                    editLocationTag(locationTagParam);
                }
                else {
                    addLocationTag(locationTagParam);
                }
            }
        };

        function validateFields() {
            if ($scope.locations.length === 0) {
                lincUtil.messagePopup("Tip", "At least one location is required");
                return false;
            } else
                return true;
        }

        function addLocationTag(param) {
            $scope.loading = true;
            locationService.addLocationTag(param).then(submitSuccessPopUp, submitFail);
        }


        function editLocationTag(param) {
            $scope.loading = true;
            locationService.updateLocationTag($scope.tagId, param).then(submitSuccessPopUp, submitFail);
        }

        function submitSuccessPopUp(response) {
            $scope.loading = false;
            lincUtil.updateSuccessfulPopup(function () {
                $state.go('cf.facility.resource.locationTag.list');
            });
        }

        function submitFail(error) {
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        $scope.cancel = function () {
            $state.go('cf.facility.resource.locationTag.list');
        };

        $scope.delete = function (id) {

            _.remove($scope.locations, function (location) {
                return location.id === id;
            });
            $scope.loadContent(1);

        };

        $scope.deleteAllLocation = function () {
            $scope.locations = [];
            $scope.locationsView = [];
        }

        function getLocationGroupTagById() {
            locationService.getLocationTagByIdFromBam($scope.tagId).then(function (response) {
                $scope.locationTag = response.virtualTag;
                $scope.locations = response.locations;
                originLocations = angular.copy(response.locations);
                $scope.loadContent(1);
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }


        function _init() {
            $scope.isAddAction = isAddAction;
            if (isAddAction) {
                $scope.formTitle = CREATE_TITLE;
                $scope.submitLabel = "Submit";
            } else {
                $scope.tagId = $stateParams.tagId;
                $scope.formTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                getLocationGroupTagById();
            }
        }
        _init();

    };
    controller.$inject = ['$scope', '$mdDialog', '$state', '$stateParams',
        'isAddAction', 'lincUtil', 'locationService'];

    return controller;
});

