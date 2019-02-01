'use strict';

define([
    'angular',
    'lodash',
    './selectLocationController'
], function (angular, _, selectLocationController) {
    var controller = function ($scope, $state, $stateParams, isAddAction, lincUtil, locationItemService,$q) {
        var CREATE_TITLE = "Add Location & Item";

        $scope.locations = [];
        $scope.locationItem = {};

        $scope.pageSize = 10;

        $scope.selectLocation = function () {
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
                addLocationItem();
                
            }
        };

        function validateFields() {
            if ($scope.locations.length === 0) {
                lincUtil.messagePopup("Tip", "At least one location is required");
                return false;
            } else
                return true;
        }

        function addLocationItem() {
            $scope.loading = true;
            var locationItemParam = angular.copy($scope.locationItem);
            var locationIds = _.map($scope.locations, "id");
            var promises =[];
            
            _.forEach(locationIds,function(locationId){
                promises.push(locationItemService.addLocationItem({locationId:locationId,itemSpecId:locationItemParam.itemSpecId}));
            });
            $q.all(promises).then(submitSuccessPopUp, submitFail);
            // locationItemService.addLocationItem(locationItem).then(submitSuccessPopUp, submitFail);
        }


        function submitSuccessPopUp(response) {
            $scope.loading = false;
            lincUtil.saveSuccessfulPopup(function () {
                $state.go('cf.facility.resource.locationItem.list');
            });
        }

        function submitFail(error) {
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        $scope.cancel = function () {
            $state.go('cf.facility.resource.locationItem.list');
        };


        $scope.delete = function (id) {

            _.remove($scope.locations, function (location) {
                return location.id === id;
            });
            $scope.loadContent(1);

        };

        function _init() {
            if (isAddAction) {
                $scope.formTitle = CREATE_TITLE;
                $scope.submitLabel = "Submit";
            } 
        }
        _init();

    };
    controller.$inject = ['$scope','$state', '$stateParams','isAddAction', 'lincUtil', 'locationItemService','$q'];

    return controller;
});


