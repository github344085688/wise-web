'use strict';

define(['angular',
    'lodash',
    'moment',
    './transloadWaitingConfirmController',
    './selectFirstDockController',
    'src/wms/task/transload-task/transloadStepDurationDetailController'
], function (angular, _, moment, transloadWaitingConfirmController, selectFirstDockController, transloadStepDurationDetailController) {
    var tasksController = function ($scope, $state, $stateParams,
        entryService, addressService, locationService, lincUtil, $mdDialog,
        transloadTaskService, $q, session, userService) {
        var originDockIds = [];
        var currentEntrySteps;
        var checkinedDockId;

        $scope.waitingMesg = "";
        $scope.transloadCheckin = function () {
            if ($scope.task.cartonNotMatch) {
                lincUtil.confirmPopup("Confirm","WARNING: Carton Qty in DNs are not matched with RN ! Do you still want to continue ?", function () {
                    validateAndTranslodaCheckin();
                });
            } else {
                validateAndTranslodaCheckin();
            }

        };

        function validateAndTranslodaCheckin() {
            if (!validateSelectAssigneeForAllSteps()) {
                return;
            }
            if (!validateSelectDockForAllSteps()) {
                return;
            }
            if (!$scope.task.assigneeUserId) {
                lincUtil.messagePopup("Tip", "Please select assignee for task!");
                return;
            }
            var dockIds = _.map(currentEntrySteps, "dockId");
            locationService.getLocationList({ locationIds: dockIds, type: 'DOCK' }).then(function (docks) {
                if (!validateAllDockAreAvailable(docks)) {
                    return;
                }
                if (dockIds.indexOf($scope.entry.dockId) < 0) {
                    $scope.entry.dockId = dockIds[0];
                }
                if ($scope.entry.dockId != checkinedDockId && dockIds.length > 1) {
                    selectDockForEntry(docks, function () {
                        checkin();
                    });
                } else {
                    checkin();
                }
            });
        }

        function validateAllDockAreAvailable(docks) {
            var bool = true;
            var busyDock;
            _.forEach(docks, function (dock) {
                if (isDockBusy(dock) && originDockIds.indexOf(dock.id) < 0) {
                    busyDock = dock;
                    bool = false;
                }
            });
            if (!bool) {
                lincUtil.messagePopup("Tip", 'Dock is busy, you can queue up in dock "' + busyDock.name + '"');
            }
            return bool;
        }

        function validateSelectDockForAllSteps() {
            var steps = _.filter(currentEntrySteps, function (step) {
                step.name != "Offload" || step.name != "LPN" || step.name != "PutAway" ;
            });
            var dockIds = _.compact(_.map(steps, "dockId"));
            if (dockIds.length != steps.length) {
                lincUtil.messagePopup("Tip", "Please select dock for steps!");
                return false;
            }
            if (dockIds.length > 1 && _.uniq(dockIds).length != dockIds.length) {
                lincUtil.messagePopup("Tip", "Please select different dock for steps!");
                return false;
            }
            return true;
        }

        function validateSelectAssigneeForAllSteps() {
            var bool = true;
            _.forEach(currentEntrySteps, function (step) {
                if (!step.assigneeUserIds || step.assigneeUserIds.length == 0) {
                    bool = false;
                }
            });
            if (!bool) {
                lincUtil.messagePopup("Tip", "Please select assignee for steps!");
            }
            return bool;
        }

        function getCheckInPostBody() {
            var checkInSteps = [];
            _.forEach(currentEntrySteps, function (step) {
                checkInSteps.push({
                    id: step.id,
                    stepType: step.stepType,
                    receiptId: step.receiptId,
                    loadId: step.loadId,
                    dockId: step.dockId,
                    assigneeUserIds: step.assigneeUserIds
                });
            });
            return {
                taskId: $scope.task.id,
                taskAssigneeUserId: $scope.task.assigneeUserId,
                taskNote: $scope.task.description,
                checkInSteps: checkInSteps,
                dockId: $scope.entry.dockId,
                wiseCompanyId: $scope.task.companyId
            };
        }

        function checkin() {
            $scope.checkinLoading = true;
            entryService.transloadCheckin($scope.entry.id, getCheckInPostBody()).then(function (response) {
                $scope.checkinLoading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('cf.facility.windowCheckin.entry.entryList');
                });
            }, function (error) {
                $scope.checkinLoading = false;
                lincUtil.processErrorResponse(error);
                _init();
            });
        }

        function selectDockForEntry(docks, cbFun) {
            var form = {
                templateUrl: 'company-facility/facility/window-checkin/checkin-process/template/selectFirstDock.html',
                locals: {
                    selectDock: $scope.entry.dockId,
                    selectedTaskDocks: docks
                },
                autoWrap: true,
                controller: selectFirstDockController
            };
            $mdDialog.show(form).then(function (response) {
                $scope.entry.dockId = response;
                cbFun();
            });
        }

        function getAppointTime(receipt, loadList) {
            var objList = _.compact(_.concat([receipt], loadList));
            var obj = _.minBy(objList, function (object) {
                return moment(object.appointmentTime);
            });
            return obj.appointmentTime;
        }

        function getWaitingPostBody(waiting) {
            waiting.id = $scope.entry.id;
            var waitingSteps = [];
            _.forEach(currentEntrySteps, function (step) {
                waitingSteps.push({
                    stepId: step.id,
                    stepType: step.stepType,
                    subscribeDocks: step.subscribeDocks,
                    assigneeUserIds: step.assigneeUserIds
                });
            });
            return {
                taskAssigneeUserId: $scope.task.assigneeUserId,
                taskId: $scope.task.id,
                waiting: waiting,
                waitingSteps: waitingSteps
            }
        }

        $scope.waitingConfirm = function () {
            if (!validateSelectAssigneeForAllSteps()) {
                return;
            }
            $scope.task.appointmentTime = getAppointTime($scope.receipt, $scope.loadList);
            var param = {
                task: $scope.task
            };
            var templateUrl = 'company-facility/facility/window-checkin/checkin-process/template/transloadWaitingConfirm.html';
            lincUtil.popupBodyPage(transloadWaitingConfirmController, templateUrl, null, param).then(function (waiting) {
                saveWaitingInfo(waiting);
            });
        };

        function saveWaitingInfo(waiting) {
            var waitingBody = getWaitingPostBody(waiting);
            $scope.waitLoading = true;
            entryService.transloadWaiting($scope.entry.id, waitingBody).then(
                function (response) {
                    $scope.waitLoading = false;
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go('cf.facility.windowCheckin.entry.entryList');
                    });
                }, function (error) {
                    $scope.waitLoading = false;
                    lincUtil.processErrorResponse(error);
                });
        }

        $scope.isCheckedOut = function () {
            return _.indexOf(["Dock Checked Out"], $scope.entry.status) > -1;
        };

        $scope.isDockTheCheckinedDock = function () {
            if (!checkinedDockId) return false;
            return $scope.entry.dockId == checkinedDockId;
        };

        function isDockBusy(dock) {
            if (!dock || !dock.dockStatus) return false;
            if (dock.dockStatus.toUpperCase() == "OCCUPIED" || dock.dockStatus.toUpperCase() == "RESERVED") {
                return true;
            }
            return false;
        }

        $scope.selectDock = function (dock) {
            _.forEach(currentEntrySteps, function (stepObj) {
                if (stepObj.name == "Offload" || stepObj.name == 'LPN' || stepObj.name == 'PutAway') {
                    stepObj.dock = dock;
                    if(!dock) {
                        stepObj.dockId = null;
                    }else {
                        stepObj.dockId = dock.id;
                    }
                }
            });
        };

        $scope.isCheckedOut = function () {
            if ($scope.entry) {
                return _.indexOf(["Dock Checked Out"], $scope.entry.status) > -1;
            }
        };

        function initCurrentEntrySteps(steps, entryId) {
            currentEntrySteps = _.filter(steps, function (step) {
                if (step.entryId == entryId) {
                    step.isCurrentEntryStep = true;
                    return true;
                }
            });
        }
        $scope.getUserName = function (user) {
            if (!user) return "";
            if (user.firstName && user.lastName) {
                return user.firstName + " " + user.lastName + ' ( ' + user.username + ' ) ';
            }
            return user.username;
        };


        $scope.getUsers = function (keyword) {
            var param = { keyword: keyword, scenario: 'Auto Complete' };
            var currentCf = session.getCompanyFacility();
            if (currentCf) {
                param.facilityId = currentCf.facilityId;
            }
            userService.searchUsers(param).then(function (response) {
                $scope.users = response;
            });
        };

        $scope.generateShipToAddressStr = function (shipToAddress) {
            return addressService.generageAddressData(shipToAddress, null);
        };

        $scope.popUpDurationDetail = function (stepId, stepName) {
            var form = {
                templateUrl: 'wms/task/transload-task/template/transloadStepDurationDetail.html',
                locals: {
                    stepId: stepId,
                    stepName: stepName
                },
                autoWrap: true,
                controller: transloadStepDurationDetailController
            };
            $mdDialog.show(form);
        };

        function _init() {
            var entryId = $stateParams.entryId;
            if (!entryId || entryId === "") {
                lincUtil.errorPopup("Please select an entry !!!", function () {
                    $state.go('cf.facility.windowCheckin.entry.entryList');
                });
            }
            $scope.isLoadingComplete = true;
            var promises = [];
            promises.push(entryService.getEntryByEntryId(entryId));
            promises.push(transloadTaskService.getTaskByEntryId(entryId));

            $q.all(promises).then(function (response) {
                $scope.isLoadingComplete = false;
                $scope.entry = response[0];
                $scope.task = response[1].task;
                $scope.receipt = response[1].receipt;
                $scope.loadMap = response[1].loadMap;
                $scope.orderMap = response[1].orderMap;
                checkinedDockId = $scope.entry.dockId;
                originDockIds = _.map($scope.task.steps, "dockId");
                initCurrentEntrySteps($scope.task.steps, $scope.entry.id);
            }, function (err) {
                $scope.isLoadingComplete = false;
                lincUtil.processErrorResponse(err);
            });
        }

        _init();
    };

    tasksController.$inject = ['$scope', '$state', '$stateParams', 'entryService', 'addressService',
        'locationService', 'lincUtil', '$mdDialog', 'transloadTaskService', '$q', 'session', 'userService'];
    return tasksController;
});
