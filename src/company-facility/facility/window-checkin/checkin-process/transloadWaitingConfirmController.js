'use strict';

define(['lodash', 'moment'], function (_, moment) {
    var waitingConfirmController = function ($scope, $state, $mdDialog, $interval, locationService, task) {
        $scope.errorMsg = "";

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        
        $scope.closeErrorAlert = function () {
            $scope.hasErrorMessage = false;
        };

        $scope.confirm = function () {
            $scope.errorMsg = "";
            var locationIds = [];
            _.forEach(task.steps, function (step) {
                if(!step.isCurrentEntryStep) {
                    return;
                }
                if(!step.subscribeDocks || step.subscribeDocks.length == 0) {
                    $scope.errorMsg = "please select subscribe docks for every step!";
                }
                locationIds = _.union(locationIds, step.subscribeDocks)
            });
            if($scope.errorMsg) {
                return;
            }

            locationService.searchLocation({locationIds: locationIds }).then(function (stepLocations) {
                if (_.filter(stepLocations, {dockStatus: "AVAILABLE" }).length > 0) {
                    $scope.errorMsg = "A dock is available , please double confirm before put this entry to Waiting List.";
                } else {
                    $scope.errorMsg = "";
                    $mdDialog.hide($scope.waiting);
                }
            }, function (error) {
            });
        };

        function refreshTime() {
            $interval(function () {
                initOnTime();
            }, 1000);
        }

        function initOnTime() {
            $scope.currentTime = new Date();
            var earlyTime = _.min(moment($scope.currentTime), moment(task.appointmentTime));
            if (earlyTime == $scope.currentTime) {
                $scope.waiting.isOnTime = true;
            }else {
                $scope.waiting.isOnTime = false;
            }
        }

        function _init() {
            $scope.waiting = {contactType:"Phone", appointmentTime: task.appointmentTime, readyConditions:[]};
            $scope.contactTypes = ["Phone"];
            $scope.availableReasons = ["Dock Unavailable"];
            $scope.task =
            refreshTime();
        }

        _init();

    };

    waitingConfirmController.$inject = ['$scope', '$state', '$mdDialog', '$interval', 'locationService', 'task'];
    return waitingConfirmController;

});
