'use strict';

define([
    'angular',
    'moment',
    'lodash'
], function(angular, moment, _) {
    var controller = function($scope, $resource, $mdDialog, $state, $stateParams, isAddAction) {
        var CREATE_TITLE = "Add Parking";
        var EDIT_TITLE = "Edit Parking";
        var NEW_ENTRY = {
            parkingGroups: [
                {}
            ]
        };

        function initSet()
        {
            if(!isAddAction)
            {
                $scope.submitLabel = "Update";
                $scope.formTitle = EDIT_TITLE;
                getParking($stateParams.parkingId);
            }
            else
            {
                $scope.submitLabel = "Save";
                $scope.formTitle = CREATE_TITLE;
                $scope.parking  = angular.copy(NEW_ENTRY);
            }
        }
        initSet();
        function getParking(parkingId) {
            var entry = $resource("/data/admin/parking_by_id.json");
            entry.get(function(parking){

                $scope.parking = parking;
            });
        }
        
        $scope.removeGroup = function (index) {
            $scope.parking.parkingGroups.splice(index, 1);
        };
        $scope.addGroup = function () {
            $scope.parking.parkingGroups.push({});
        };

        $scope.submit = function() {
            var confirm = $mdDialog.confirm()
                .title('Confirm')
                .textContent('Save Success!')
                .ok('Yes');
            $mdDialog.show(confirm).then(function()
            {
            });
        };

        $scope.cancel = function(form) {
            $state.go('admin.parking.list');
            // if (!$stateParams.receiptId && form.$dirty) {
            //     var confirm = $mdDialog.confirm()
            //         .title('Confirm')
            //         .textContent('Would you like to cancel your modification?')
            //         .ok('Yes')
            //         .cancel('No');
            //
            //     $mdDialog.show(confirm).then(function() {
            //         resetForm(form);
            //     });
            // } else {
            //     resetForm(form);
            // }
        };

        var resetForm = function(form) {
            $scope.formTitle = CREATE_TITLE;

            form.$setPristine();
            form.$setUntouched();

            $scope.order = angular.copy(NEW_ENTRY);
            $scope.itemLineList = {};
        };
    };
    controller.$inject = ['$scope', '$resource', '$mdDialog',  '$state', '$stateParams', 'isAddAction'];

    return controller;
});