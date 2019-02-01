'use strict';

define([
    'angular',
    'lodash',
    './selectLocationController'
], function (angular, _, selectLocationController) {
    var controller = function ($scope, $mdDialog, $state, $stateParams, isAddAction, lincUtil, itemLocationService) {
        $scope.types = ['PIECE_PICK','CASE_PICK'];
        var CREATE_TITLE = "Add Item & Location";
        var EDIT_TITLE = "Edit Item & Location";

        $scope.locations = [];
        $scope.itemLocation = {};

        $scope.pageSize = 10;

        $scope.selectLocation = function (entry) {
            var templateUrl = 'company-facility/facility/resource/item-location/template/selectLocation.html';
            lincUtil.popupBodyPage(selectLocationController, templateUrl, null, {
            }).then(function (checkedLocations) {

                $scope.locations = _.unionBy($scope.locations, checkedLocations, 'id');
                $scope.loadContent(1);
            });
        };


        $scope.loadContent = function (currentPage) {
            $scope.locationsView = $scope.locations.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.locations.length ? $scope.locations.length : currentPage * $scope.pageSize);
        };

        $scope.submit = function () {

            if (validateFields()) {
                var itemLocationParam = angular.copy($scope.itemLocation);
                itemLocationParam.locationIds = _.map($scope.locations, "id");

                if (!isAddAction) {
                    updateItemLocation(itemLocationParam);
                }
                else {
                    addItemLocation(itemLocationParam);
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

        function addItemLocation(itemLocation) {
            $scope.loading = true;
            itemLocationService.addItemLocation(itemLocation).then(submitSuccessPopUp, submitFail);
        }


        function updateItemLocation(itemLocation) {
            $scope.loading = true;
            itemLocationService.updateItemLocation(itemLocation).then(submitSuccessPopUp, submitFail);
        }

        function submitSuccessPopUp(response) {
            $scope.loading = false;
            lincUtil.updateSuccessfulPopup(function () {
                $state.go('cf.facility.resource.itemAndLocation.list');
            });
        }

        function submitFail(error) {
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        $scope.cancel = function () {
            $state.go('cf.facility.resource.itemAndLocation.list');
        };


        $scope.delete = function (id) {

            _.remove($scope.locations, function (location) {
                return location.id === id;
            });
            $scope.loadContent(1);

        };


        function getItemLocationById() {
            itemLocationService.getItemLocationByIdFromBam($scope.itemLocationId).then(function (response) {
                $scope.itemLocation = response.itemLocation;
                $scope.locations = response.locations;
                $scope.loadContent(1);
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }


        function _init() {
            if (isAddAction) {
                $scope.formTitle = CREATE_TITLE;
                $scope.submitLabel = "Submit";
            } else {
                $scope.itemLocationId = $stateParams.itemLocationId;
                $scope.formTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                getItemLocationById();
            }
        }
        _init();

    };
    controller.$inject = ['$scope', '$mdDialog', '$state', '$stateParams',
        'isAddAction', 'lincUtil', 'itemLocationService'];

    return controller;
});


