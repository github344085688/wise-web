'use strict';

define(['angular', 'lodash', './entryPhotoController'], function (angular, _, entryPhotoController) {
    var checkinProcessController = function ($scope, $state, $stateParams, lincUtil, entryService, transloadTaskService) {
        $scope.goToCarrierInfo = function () {
            if ($scope.carrierInfoClass) {
                if ("active" === $scope.activityClass) {
                    $scope.activityClass = "done";
                }
                if ("active" === $scope.tasksClass) {
                    $scope.tasksClass = "done";
                }
                $scope.carrierInfoClass = "active";
                $state.go('cf.facility.windowCheckin.checkinProcess.carrierInfo',{
                    entryId: $stateParams.entryId
                });
            }
        };
        $scope.goToActivity = function () {
            if ($scope.activityClass) {
                if ("active" === $scope.carrierInfoClass) {
                    $scope.carrierInfoClass = "done";
                }
                if ("active" === $scope.tasksClass) {
                    $scope.tasksClass = "done";
                }
                $scope.activityClass = "active";
                $state.go('cf.facility.windowCheckin.checkinProcess.activity', {entryId: $stateParams.entryId});
            }
        };
        $scope.goToTasks = function () {
            if ($scope.tasksClass) {
                if ("active" === $scope.activityClass) {
                    $scope.activityClass = "done";
                }
                if ("active" === $scope.carrierInfoClass) {
                    $scope.carrierInfoClass = "done";
                }
                goToTaskPage($scope.isTransload);
            }
        };

        $scope.entryPhotos = function (ev) {
            var templateUrl = 'company-facility/facility/window-checkin/checkin-process/template/entryPhotos.html';
            lincUtil.popupBodyPage(entryPhotoController, templateUrl, ev, {entryId: $stateParams.entryId}).then(function (data) {
                lincUtil.saveSuccessfulPopup();
            });
        };

        $scope.isSkiped = function (step) {
            if ($scope.entry && $scope.entry.skipSteps)
                return _.indexOf($scope.entry.skipSteps, step) > -1;
        };

        function initTabClass() {
            transloadTaskService.searchTransloadTask({entryIds: [$scope.entry.id]}).then(function (response) {
                if(response.length > 0) {
                    $scope.isTransload = response[0];
                }
                var doneStatuses = ["Waiting", "Window Checked In", "Dock Checked In", "Dock Checked Out", "Gate Checked Out"];
                if (_.indexOf(doneStatuses, $scope.entry.status) > -1) {
                    goToTaskPage($scope.isTransload);
                } else {
                    var stepClasses = ["carrierInfoClass", "activityClass", "tasksClass"];
                    if (_.indexOf($scope.entry.skipSteps, "Step1") > -1) {
                        _.remove(stepClasses, function (stepClass) {
                            return stepClass === "carrierInfoClass";
                        });
                    }
                    if (_.indexOf($scope.entry.skipSteps, "Step2") > -1) {
                        _.remove(stepClasses, function (stepClass) {
                            return stepClass === "activityClass";
                        });
                    }
                    if (_.indexOf($scope.entry.skipSteps, "Step3") > -1) {
                        _.remove(stepClasses, function (stepClass) {
                            return stepClass === "tasksClass";
                        });
                    }
                    $scope[stepClasses[0]] = "active";
                    $state.go("cf.facility.windowCheckin.checkinProcess." + _.replace(stepClasses[0], "Class", ""),
                        {entryId: $stateParams.entryId});
                }
            });
        }

        function goToTaskPage(nowIsTransload) {
            $scope.$parent.carrierInfoClass = "done";
            $scope.$parent.activityClass = "done";
            $scope.$parent.tasksClass = "active";
            if(!nowIsTransload) {
                $state.go('cf.facility.windowCheckin.checkinProcess.tasks', {entryId: $stateParams.entryId});
            }else {
                $state.go('cf.facility.windowCheckin.checkinProcess.transloadTask', {entryId: $stateParams.entryId});
            }
        }

        $scope.isCheckedOut = function () {
            if ($scope.entry)
                return _.indexOf(["Dock Checked Out"], $scope.entry.status) > -1;
        };

        function getEntryById(entryId) {
            entryService.getEntryByEntryId(entryId).then(function (response) {
                $scope.entry = response;
                initTabClass();
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function _init() {
            // $scope.carrierInfoClass = "active";
            if (!$stateParams.entryId || $stateParams.entryId === "") {
                lincUtil.errorPopup("Please select an entry !!!", function () {
                    $state.go('cf.facility.windowCheckin.entry.entryList');
                });
            }
            getEntryById($stateParams.entryId);
        }

        _init();


    };

    checkinProcessController.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'entryService', 'transloadTaskService'];
    return checkinProcessController;

});
