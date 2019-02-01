'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $mdDialog, $state, $stateParams, isAddAction, lincUtil, locationService) {

        var CREATE_TITLE = "Add  Virtual Location Group";
        var EDIT_TITLE = "Edit Virtual Location Group";

        $scope.locations = [];
        $scope.virtualLocationGroup = {};
        $scope.groupTypes = ['Weight', 'Zone','Replenish'];

        $scope.pageSize = 10;

        $scope.getVirturalTags = function (name) {
            var param = {};
            if (name) {
                param.regexName = name;
            }
            locationService.searchLocationTag(param).then(function (response) {
                $scope.virturalTags = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        };
 
        $scope.submit = function () {

            var virtualLocationGroupParam = angular.copy($scope.virtualLocationGroup);
            virtualLocationGroupParam.locationIds = _.map($scope.locations, "id");

            if (!isAddAction) {
                editVirtualLocationGroup(virtualLocationGroupParam);
            }
            else {
                addVirtualLocationGroup(virtualLocationGroupParam);
            }

        };

        function addVirtualLocationGroup(param) {
            $scope.loading = true;
            locationService.addVirtualLocationGroup(param).then(submitSuccessPopUp, submitFail);
        }


        function editVirtualLocationGroup(param) {
            $scope.loading = true;
            locationService.updateVirtualLocationGroup($scope.groupId, param).then(submitSuccessPopUp, submitFail);
        }

        function submitSuccessPopUp(response) {
            $scope.loading = false;
            lincUtil.updateSuccessfulPopup(function () {
                $state.go('cf.facility.resource.virtualLocationGroup.groupManagement.list');
            });
        }

        function submitFail(error) {
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        $scope.cancel = function () {
            $state.go('cf.facility.resource.virtualLocationGroup.groupManagement.list');
        };

        $scope.delete = function (id) {

            _.remove($scope.locations, function (location) {
                return location.id === id;
            });
            $scope.loadContent(1);

        };

        $scope.onSelectType = function (type) {
            if (type === "Weight") {
                $scope.isSelectWeight = true;
            }
            else {
                $scope.isSelectWeight = false;
                if ($scope.virtualLocationGroup.pickStrategyWeight) {
                    delete $scope.virtualLocationGroup.pickStrategyWeight;
                }

            }

        }

        function getLocationGroupById() {
            locationService.getVirtualLocationGroupById($scope.groupId).then(function (response) {
                $scope.virtualLocationGroup = response;
                if ($scope.virtualLocationGroup.virtualLocationGroupType === 'Weight') {
                    $scope.isSelectWeight = true;
                }
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
                $scope.groupId = $stateParams.groupId;
                $scope.formTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                getLocationGroupById();
            }
        }
        _init();

    };
    controller.$inject = ['$scope', '$mdDialog', '$state', '$stateParams',
        'isAddAction', 'lincUtil', 'locationService'];

    return controller;
});

