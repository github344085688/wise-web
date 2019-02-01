'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, types, isEdit) {
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.ok = function () {
            var entryTicket = {};
            entryTicket.checkedEntryActions = $scope.checkedEntryActions;

            $mdDialog.hide(entryTicket);
        };

        $scope.isChecked = function (action) {
            return _.indexOf($scope.checkedEntryActions, action) > -1;
        };

        $scope.checkEntry = function ($event, action) {
            $event.stopPropagation();
            if (_.indexOf($scope.checkedEntryActions, action) > -1) {
                _.remove($scope.checkedEntryActions, function (entryAction) {
                    return entryAction == action;
                });
            } else {
                $scope.checkedEntryActions.push(action);
            }


        };

        function init() {
            $scope.entryActionList = ["Load", "Delivery", "Pickup Container", "Parking", "Visitor", "Other"];
            if (!types) {
                types = [];
            }
            $scope.title = "Create Entry";
            if (isEdit) {
                $scope.title = "Edit Entry";
            }
            $scope.checkedEntryActions = angular.copy(types);

        }
        init();

    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'types', 'isEdit'];
    return controller;
});
