'use strict';

define(['angular',
    'lodash',
    'moment',
    './waitingConfirmController',
    './selectFirstDockController'
], function (angular, _, moment, waitingConfirmController, selectFirstDockController) {
    var tasksController = function ($scope, $state, $stateParams, entryService, locationService, lincUtil, $mdDialog) {

        function getEntryData() {
            var entryData = {};
            entryData.entryId = $scope.entryId;
            entryData.dockId = $scope.entry.dockId;
            entryData.tasks = [];

            _.forEach($scope.receiptTasks, function (receiptTask) {
                if (!receiptTask.receiptIds || receiptTask.receiptIds.length == 0) return;
                var companyId = $scope.receiptMap[receiptTask.receiptIds[0]].companyId;
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
                var companyId = $scope.loadMap[loadTask.loadIds[0]].companyId;
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

        $scope.checkin = function () {
            emptyTaskValid();
            if ($scope.selectedTaskDocks.length > 1) {
                var form = {
                    templateUrl: 'company-facility/facility/window-checkin/checkin-process/template/selectFirstDock.html',
                    locals: {
                        selectDock: $scope.entry.dockId,
                        selectedTaskDocks: $scope.selectedTaskDocks
                    },
                    autoWrap: true,
                    controller: selectFirstDockController
                };
                $mdDialog.show(form).then(function (response) {
                    $scope.entry.dockId = response;
                    dockSelectReadyToCheckIn();
                });
            } else {
                $scope.entry.dockId = $scope.selectedTaskDocks[0].id;
                dockSelectReadyToCheckIn();
            }

        };

        function dockSelectReadyToCheckIn() {
            var entryData = getEntryData();
            $scope.checkinLoading = true;
            entryService.checkin($scope.entryId, entryData).then(function (response) {
                $scope.checkinLoading = false;
                if (response.error) {
                    lincUtil.errorPopup("Error Found:" + response.error);
                    return;
                }
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('cf.facility.windowCheckin.entry.entryList');
                });
                $scope.entry.status = response.entryStatus;

            }, function (error) {
                $scope.checkinLoading = false;
                lincUtil.processErrorResponse(error);
                _init();
            });
        }

        function emptyTaskValid() {
            var empty = true;
            if ($scope.receiptTasks && $scope.receiptTasks.length > 0) {
                empty = false;
            }
            if ($scope.loadTasks && $scope.loadTasks.length > 0) {
                empty = false;
            }

            if (empty) {
                var error = "Task can not be empty!";
                lincUtil.errorPopup(error);
                throw new Error(error);
            }

            if (!isValid()) {
                var error = "Please choose assignee person and dock for each task.";
                lincUtil.errorPopup(error);
                throw new Error(error);
            }
        }

        function isValid() {
            var validation = true;
            _.forEach($scope.receiptTasks, function (task) {
                if (!task.plannedAssigneeUserId || !task.dock || !task.dock.id) {
                    validation = false;
                }
            });
            _.forEach($scope.loadTasks, function (task) {
                if (!task.plannedAssigneeUserId || !task.dock || !task.dock.id) {
                    validation = false;
                }
            });
            return validation;
        }

        //================
        function validAssigneeUser() {
            var validation = true;
            _.forEach($scope.receiptTasks, function (receipt) {
                if (!receipt.plannedAssigneeUserId) {
                    validation = false;
                }
            });
            _.forEach($scope.loadTasks, function (task) {
                if (!task.plannedAssigneeUserId) {
                    validation = false;
                }
            });
            return validation;
        }
        function compareTime(time1, time2) {
            var moment1 = moment(time1);
            var moment2 = moment(time2);
            var diff = moment1.diff(moment2);

            if (diff > 0) {
                return time2;
            } else {
                return time1;
            }
        }

        function getAppointTime() {
            var appointmentTime;

            _.forEach($scope.receiptTasks, function (receiptTask) {
                _.forEach(receiptTask.receiptIds, function (receiptId) {
                    var receiptData = $scope.getReceipt(receiptId);
                    if (receiptData.appointmentTime) {
                        if (appointmentTime) {
                            appointmentTime = compareTime(appointmentTime, receiptData.appointmentTime);
                        } else {
                            appointmentTime = receiptData.appointmentTime;
                        }
                    }
                })
            })

            _.forEach($scope.loadTasks, function (loadTask) {
                _.forEach(loadTask.loadIds, function (loadId) {
                    var loadData = $scope.getLoad(loadId);
                    if (loadData.appointmentTime) {
                        if (appointmentTime) {
                            appointmentTime = compareTime(appointmentTime, loadData.appointmentTime);
                        } else {
                            appointmentTime = loadData.appointmentTime;
                        }
                    }
                })
            })

            return appointmentTime;
        }

        $scope.waitingConfirm = function (ev) {
          
            if (!validAssigneeUser()) {
                var error = "Please choose assignee person for each task.";
                lincUtil.errorPopup(error);
                return;
            }

            var loadTasks = $scope.loadTasks;
            if (loadTasks.length > 0)
                _.forEach(loadTasks, function (loadTask) {
                    loadTask.companyName = $scope.loadMap[loadTask.loadIds[0]].companyName;
                });

            var receiptTasks = $scope.receiptTasks;
            if (receiptTasks.length > 0)
                _.forEach(receiptTasks, function (receiptTask) {
                    receiptTask.companyName = $scope.receiptMap[receiptTask.receiptIds[0]].companyName;
                });
            var param = {
                tasks: {
                    receiptTasks: receiptTasks,
                    loadTasks: loadTasks,
                    appointmentTime: getAppointTime()
                }
            };

            var templateUrl = 'company-facility/facility/window-checkin/checkin-process/template/waitingConfirm.html';

            lincUtil.popupBodyPage(waitingConfirmController, templateUrl, ev, param).then(function (waiting) {
                $scope.waitLoading = true;

                var entryData = getEntryData();
                entryData.waiting = waiting;

                entryService.waitingConfirm($scope.entryId, entryData).then(function (response) {
                    $scope.waitLoading = false;
                    if (response.error) {
                        lincUtil.errorPopup("Error Found:" + response.error);
                        return;
                    }
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go('cf.facility.windowCheckin.entry.entryList');
                    });
                }, function (error) {
                    $scope.waitLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        //================

        $scope.getLoad = function (id) {
            return $scope.loadMap[id];
        };
        $scope.getReceipt = function (id) {
            return $scope.receiptMap[id];
        };

        $scope.docks = [];
        function getDockLists() {
            locationService.getLocationList({ type: 'DOCK' }).then(function (response) {
                if (response.error) {
                    return;
                }
                $scope.docks = response;
            });
        }

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

        function initTasks(entryId) {
            $scope.isLoadingComplete = false;
            entryService.getTasksByEntryId(entryId).then(function (response) {
                $scope.isLoadingComplete = true;
                if (response.error) {
                    lincUtil.errorPopup("Error:" + response.error);
                    return;
                }
                $scope.receiptTasks = response.receiptTasks;
                $scope.receiptMap = response.receiptMap;
                $scope.receiptItemLineMap = response.receiptItemLineMap;
                $scope.loadTasks = response.loadTasks;
                $scope.loadMap = response.loadMap;
                $scope.loadOrderLineMap = response.loadOrderLineMap;
                initDocks();
                getDockLists();
            }, function (error) {
                $scope.isLoadingComplete = true;
                lincUtil.errorPopup('Error! ' + error.data.error);
            });
        }

        $scope.viewOrCloseDetail = function (task, array) {
            if ($scope.viewOrClose === 'View') {
                for (var i = 0; i < array.length; i++)
                    $scope[task.taskId + 'in' + i] = 'in';
                $scope.viewOrClose = 'Hide';
            } else {
                for (var j = 0; j < array.length; j++)
                    $scope[task.taskId + 'in' + j] = '';
                $scope.viewOrClose = 'View';
            }
        };

        $scope.getIn = function (index, task) {
            return $scope[task.taskId + 'in' + index];
        };

        $scope.showIn = function (index, task) {
            if (typeof ($scope[task.taskId + 'in' + index]) === 'undefined' || $scope[task.taskId + 'in' + index] === '') {
                $scope[task.taskId + 'in' + index] = 'in';
            } else {
                $scope[task.taskId + 'in' + index] = '';
            }
        };

        function isDockBusy(dock) {
            if (!dock || !dock.dockStatus) return false;

            if (dock.dockStatus.toUpperCase() == "OCCUPIED" || dock.dockStatus.toUpperCase() == "RESERVED") {
                return true;
            }
            return false;
        }
        $scope.waitingMesg = "";
        $scope.isWaitDock = function () {
            var tasks = {};
            tasks.receiptTasks = $scope.receiptTasks;
            tasks.loadTasks = $scope.loadTasks;

            if (!isValid(tasks)) {
                $scope.waitingMesg = "Please choose assignee person and dock for each task!";
                return true;
            }

            if ($scope.selectedTaskDocks.length == 0) {
                return false;
            }
            var dock = $scope.selectedTaskDocks[0];
            if ($scope.entry.dockId) {
                dock = _.find($scope.selectedTaskDocks, function (availableDock) {
                    return availableDock.id == $scope.entry.dockId;
                });
            }

            if (isDockBusy(dock) && dock.id != checkinedDockId) {
                $scope.waitingMesg = 'Dock is busy, you can queue up in dock "' + dock.name + '"';
                return true;
            }

            return false;
        };

        $scope.isCheckedOut = function (isCheckin) {
            if (isCheckin) {
                var isWait = $scope.isWaitDock();
                if (isWait) return isWait;

            } else {
                var tasks = {};
                tasks.receiptTasks = $scope.receiptTasks;
                tasks.loadTasks = $scope.loadTasks;

                if (!isValid(tasks)) {
                    $scope.waitingMesg = "Please choose assignee person and dock for each task!";
                    return true;
                }
            }

            if ($scope.entry) {
                return _.indexOf(["Dock Checked Out"], $scope.entry.status) > -1;
            }
        };

        var checkinedDockId;
        $scope.isDockTheCheckinedDock = function () {
            if (!checkinedDockId) return false;
            return $scope.entry.dockId == checkinedDockId;
        };

        function _init() {
            if (!$stateParams.entryId || $stateParams.entryId === "") {
                lincUtil.errorPopup("Please select an entry !!!", function () {
                    $state.go('cf.facility.windowCheckin.entry.entryList');
                });
            }
            $scope.tempDocks = [];
            $scope.selectedTaskDocks = [];
            $scope.isLoadingComplete = true;
            $scope.entryId = $stateParams.entryId;
            entryService.getEntryByEntryId($stateParams.entryId).then(function (response) {
                $scope.entry = response;
                if ($scope.entry.status == "Window Checked In") {
                    checkinedDockId = $scope.entry.dockId;
                }
                initDocks();
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
            $scope.viewOrClose = 'View';
            initTasks($stateParams.entryId);
        }
        _init();
    };

    tasksController.$inject = ['$scope', '$state', '$stateParams', 'entryService', 'locationService', 'lincUtil', '$mdDialog'];
    return tasksController;
});
