'use strict';

define(['lodash', 'moment'], function (_, moment) {
    var waitingConfirmController = function ($scope, $state, $mdDialog, $interval, locationService, tasks) {


        $scope.isHasErrorMessage = false;
        $scope.errorMsg = "";
        $scope.tasks = [];

        $scope.closeAlart = function () {
            $scope.isHasErrorMessage = false;
        };

        $scope.cancel = function () {
            getTasks();
            $mdDialog.cancel();

        };

        $scope.confirm = function () {
            if (validateWaitingInfo()) {
                var locationParams = _.uniq(_.flattenDeep(_.map($scope.tasks, "subscribedDockIds")));
                locationService.searchLocation({ locationIds: locationParams }).then(function (data) {

                    if (_.filter(data, { dockStatus: "AVAILABLE" }).length > 0) {

                        $scope.isHasErrorMessage = true;
                        $scope.errorMsg = "A dock is available , please double confirm before put this entry to Waiting List.";
                    } else {

                        $scope.isHasErrorMessage = false;
                        confirmSetTasks();
                        $scope.waiting.readyConditions = $scope.checkedConditions;
                        $mdDialog.hide($scope.waiting);
                    }


                }, function (error) {
                });

            }

        };

        function validateWaitingInfo() {
            var isSelectSubscribedDock = false;
            _.forEach($scope.tasks, function (task) {
                if (!task.subscribedDockIds || task.subscribedDockIds.length == 0) {
                    isSelectSubscribedDock = true;
                }
            });
            if (isSelectSubscribedDock) {
                $scope.isHasErrorMessage = true;
                $scope.errorMsg = "Please select subscribed docks for each task.";
                return false;
            }
            if (!$scope.waiting.reasons) {
                $scope.isHasErrorMessage = true;
                $scope.errorMsg = "Please select reasons for waiting Info.";
                return false;
            }
            if (!$scope.waiting.contactInfo) {
                $scope.isHasErrorMessage = true;
                $scope.errorMsg = "Please enter contact Info for waiting Info.";
                return false;
            }
            $scope.isHasErrorMessage = false;
            return true;
        }

        function refreshTime() {
            $interval(function () {

                $scope.timeNow = new Date();
                try {
                    $scope.apply();
                } catch (e) { }
            }, 1000);
        }

        function confirmSetTasks() {

            _.forEach(tasks.receiptTasks, function (receiptTask) {
                receiptTask.dock = "";
                receiptTask.dockId = "";
            })


            _.forEach(tasks.loadTasks, function (loadTask) {
                loadTask.dock = "";
                loadTask.dockId = "";
            })

        }

        function getTasks() {
            var index = 1;
            _.forEach(tasks.receiptTasks, function (receiptTask) {
                receiptTask.subscribedDockIds = [];
                if (receiptTask.id) {
                    receiptTask.taskName = "Receipt Task: " + receiptTask.id;
                } else {
                    receiptTask.taskName = "Receipt Task: " + index++;
                }
                $scope.tasks.push(receiptTask);
            })

            index = 1;
            _.forEach(tasks.loadTasks, function (loadTask) {

                loadTask.subscribedDockIds = [];
                if (loadTask.id) {
                    loadTask.taskName = "Load Task: " + loadTask.id;
                } else {
                    loadTask.taskName = "Load Task: " + index++;
                }
                $scope.tasks.push(loadTask);
            })

        }

        function _init() {
            $scope.checkedConditions = [];
            $scope.waiting = {};
            $scope.contactTypes = ["Phone"];
            $scope.availableReasons = ["Dock Unavailable"];
            $scope.taskPrioritys = ["LOW", "MIDDLE", "HIGH", "TOP"];


            $scope.waiting.isOnTime = false;
            $scope.waiting.contactType = "Phone";
            $scope.appointmentTime = tasks.appointmentTime;
            initOntime();
            refreshTime();
            getTasks();
        }

        function initOntime() {
            $scope.timeNow = new Date();
            if ($scope.appointmentTime) {
                var moment1 = moment($scope.timeNow);
                var moment2 = moment($scope.appointmentTime);
                var diff = moment1.diff(moment2);
                if (diff < 0) {
                    $scope.waiting.isOnTime = true;
                }
            }
        }
        
        _init();

    };

    waitingConfirmController.$inject = ['$scope', '$state', '$mdDialog', '$interval', 'locationService', 'tasks'];
    return waitingConfirmController;

});
