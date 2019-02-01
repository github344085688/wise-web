'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, checkInParams, entryService) {


        $scope.entryName = checkInParams.entry.id;
        $scope.isOnTime = checkInParams.waitInfo.isOnTime ? true : false;
        $scope.loadTasks = checkInParams.loadTask;
        $scope.receiptTasks = checkInParams.receiptTask;
        $scope.entry = {};
        $scope.checkinLoading = false;

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
            $scope.checkinLoading = true;
            $scope.labelInfo = "";
            if (!isValid()) {
                $scope.isSelectDock = true;
                $scope.labelInfo = "Please choose dock for each task.";
                return;
            }
            if (!$scope.entry.dockId) {
                $scope.isSelectDock = true;
                $scope.labelInfo = "Please select dock to go first.";
                return;
            }
            if ($scope.isOnTime) {
                $scope.checkin();
            }
            else {
                entryService.readyToCheckIn(checkInParams.entry).then(function () {
                    var resInfo = "success";
                    $scope.checkinLoading = false;
                    $mdDialog.hide(resInfo);

                }, function (error) {
                    $mdDialog.hide(error);
                    $scope.checkinLoading = false;
                });
            }



        };

        $scope.checkin = function () {

            var entryData = getEntryData();

            entryService.checkin(checkInParams.entry.id, entryData).then(function (response) {
                var resInfo = "success";
                $scope.checkinLoading = false;
                $mdDialog.hide(resInfo);
            }, function (error) {
                $scope.checkinLoading = false;
                $mdDialog.hide(error);
            });
        };

        function getEntryData() {
            var entryData = {};
            entryData.entryId = checkInParams.entry.id;
            entryData.dockId = $scope.entry.dockId;
            entryData.tasks = [];

            _.forEach($scope.receiptTasks, function (receiptTask) {
                if (!receiptTask.receiptIds || receiptTask.receiptIds.length == 0) return;
                var companyId = receiptTask.companyId;

                var isFound = false;
                _.forEach(entryData.tasks, function (task) {
                    if (task.wiseCompanyId == companyId) {
                        isFound = true;
                        task.receiptTasks.push(receiptTask);
                    }
                })
                if (!isFound) {
                    var task = {};
                    task.wiseCompanyId = companyId;
                    task.receiptTasks = [];
                    task.loadTasks = [];
                    task.receiptTasks.push(receiptTask);
                    entryData.tasks.push(task);
                }
            })

            _.forEach($scope.loadTasks, function (loadTask) {
                if (!loadTask.loadIds || loadTask.loadIds.length == 0) return;
                var companyId = loadTask.companyId;

                var isFound = false;
                _.forEach(entryData.tasks, function (task) {
                    if (task.wiseCompanyId == companyId) {
                        isFound = true;
                        task.loadTasks.push(loadTask);
                    }
                })
                if (!isFound) {
                    var task = {};
                    // task.dockId = $scope.entry.dockId;
                    task.wiseCompanyId = companyId;
                    task.receiptTasks = [];
                    task.loadTasks = [];
                    task.loadTasks.push(loadTask);
                    entryData.tasks.push(task);
                }
            })

            return entryData;
        }

        $scope.selectedTaskDocks = [];

        initDocks();
        $scope.selectDock = function (dock, task) {
            task.dock = dock;
            initDocks();
        };

        function initDocks() {
            $scope.tempDocks = [];
            _.forEach($scope.receiptTasks, function (task) {
                if (task.dock) {
                    task.dockId = task.dock.id;
                    $scope.tempDocks.push(task.dock);
                    $scope.selectedTaskDocks = _.uniqBy($scope.tempDocks, "id");
                    $scope.tempDocks = $scope.selectedTaskDocks;
                }
            });

            _.forEach($scope.loadTasks, function (task) {
                if (task.dock) {
                    task.dockId = task.dock.id;
                    $scope.tempDocks.push(task.dock);
                    $scope.selectedTaskDocks = _.uniqBy($scope.tempDocks, "id");
                    $scope.tempDocks = $scope.selectedTaskDocks;
                }
            });

            if ($scope.selectedTaskDocks && $scope.selectedTaskDocks.length > 0) {
                if (!$scope.entry.dockId) {
                    $scope.entry.dockId = $scope.selectedTaskDocks[0].id;
                    $scope.entry.dock = $scope.selectedTaskDocks[0];
                } else {
                    var index = _.findIndex($scope.selectedTaskDocks, function (dock) {
                        return dock.id == $scope.entry.dockId;
                    });
                    if (index < 0) {
                        $scope.entry.dockId = $scope.selectedTaskDocks[0].id;
                        $scope.entry.dock = $scope.selectedTaskDocks[0];
                    } else if (!$scope.entry.dock) {
                        $scope.entry.dock = _.find($scope.selectedTaskDocks, function (dock) {
                            return dock.id == $scope.entry.dockId;
                        });
                    }
                }
            }


        }
        function isValid() {
            var validation = true;
            _.forEach($scope.receiptTasks, function (task) {
                if (!task.dock || !task.dock.id) {
                    validation = false;
                }
            });
            _.forEach($scope.loadTasks, function (task) {
                if (!task.dock || !task.dock.id) {
                    validation = false;
                }
            });
            return validation;
        }
    };
    controller.$inject = ['$scope', '$mdDialog', 'checkInParams', 'entryService'];
    return controller;
});