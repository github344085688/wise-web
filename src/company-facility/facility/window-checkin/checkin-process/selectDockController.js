'use strict';

define(['lodash'], function(_) {
    var selectDockController = function($scope, $state, $mdDialog, lincUtil, locationService, task) {

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.save = function() {
            $mdDialog.hide($scope.selectedDock);
        };

        $scope.isSelectDock = function(dock) {
            return $scope.selectedDock === dock;
        };

        $scope.selectDock = function(dock) {
            $scope.selectedDock = dock;
        };

        $scope.getStatus = function(dock) {
            if (!dock || !dock.name) {
                return;
            }
            if (dock.occupyEntryId && dock.occupyEntryId !== "") {
                return "Occupied";
            }
            if (dock.reserveEntryId && dock.reserveEntryId !== "") {
                return "Reserved";
            }
            return "Available";
        };

        $scope.isLoadingComplete = true;
        $scope.getDockLists = function() {
            $scope.isLoadingComplete = false;
            locationService.getLocationList({ type: 'DOCK' }).then(function(response) {
                $scope.isLoadingComplete = true;
                if (response.error) {
                    lincUtil.errorPopup("Error:" + response.error);
                    return;
                }
                $scope.docks = response;
            }, function(error) {
                $scope.isLoadingComplete = true;
                lincUtil.processErrorResponse(error);
            });
        };

        function _init() {
            $scope.getDockLists();
            $scope.task = task;
        }

        _init();

    };

    selectDockController.$inject = ['$scope', '$state', '$mdDialog', 'lincUtil', 'locationService', 'task'];
    return selectDockController;

});
