'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var ctrl = function ($scope, $stateParams, $timeout, receiveTaskService, receiveExceptionService, lincUtil, $state) {
        var originalStepNames = ["Offload", "LP Setup", "LP Verify", "SN Scan"];

        init();
        function init() {
            $scope.materialLinesSearchParam = { receiveTaskIds: [$stateParams.taskId] };
            $scope.activeMainTab = "steps";
            getTaskStepsDetail($stateParams.taskId);
            getTaskExceptions($stateParams.taskId);
        }

        function getTaskStepsDetail(taskId) {
            receiveTaskService.get(taskId).then(function (data) {
                $scope.task = data;
                $scope.originalSteps = angular.copy(data.steps);
                initActiveTabs($scope.task.steps);
                $scope.task.steps.forEach(function (step, stepIndex) {
                    switch (step.name) {
                        case 'Offload':
                            receiveTaskService.getOffloadDetail(step.id).then(function (data) {
                                $scope.task.steps[stepIndex] = data;
                                processPhotos(data);
                            }, function (error) {
                                lincUtil.processErrorResponse(error);
                            });
                            break;
                        case 'LP Setup':
                            receiveTaskService.getLpSetupDetail(step.id).then(function (data) {
                                $scope.task.steps[stepIndex] = data;
                                data.itemsQtyByUnit = totalStepQty(data);
                            }, function (error) {
                                lincUtil.processErrorResponse(error);
                            });
                            break;
                        case 'LP Verify':
                            receiveTaskService.getLpVerifyDetail(step.id).then(function (data) {
                                $scope.task.steps[stepIndex] = data;
                            }, function (error) {
                                lincUtil.processErrorResponse(error);
                            });
                            break;
                        case 'SN Scan':
                            receiveTaskService.getSnscanDetail(step.id).then(function (data) {
                                $scope.task.steps[stepIndex] = data;
                            }, function (error) {
                                lincUtil.processErrorResponse(error);
                            });
                            break;
                        default:
                        // $scope.task.steps[stepIndex].detail = $scope.task.steps[stepIndex];
                    }
                });
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function totalStepQty(step) {
            var items = [];
            _.forEach(step.lpDetails, function (lpDetail) {
                items = _.concat(items, lpDetail.items);
            });
            var itemsQtyByUnit = {};
            var itemsMapByUnit = _.groupBy(items, 'unitName');
            _.forEach(itemsMapByUnit, function (arr, key) {
                itemsQtyByUnit[key] = _.sumBy(arr, "qty");
            });
            return itemsQtyByUnit;
        }

        function getTaskExceptions(taskId) {
            receiveExceptionService.getTaskExceptions(taskId).then(function (exceptionList) {
                if (exceptionList.length > 0) {
                    $scope.execptionGroupByStepId = _.groupBy(exceptionList, "stepId");
                }
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.changeTab = function (tab, stepId) {
            $scope.activeTabs[stepId] = tab;
        };

        $scope.changeMainTab = function (tab) {
            $scope.activeMainTab = tab;
        };

        $scope.isOriginalStepName = function (stepName) {
            var index = originalStepNames.indexOf(stepName);
            return index > -1 ? true : false;
        };

        $scope.getPhotoType = function (type) {
            if ("CONTAINER_NO_CHECK" === type) {
                return "Container No";
            }
            if ("SEAL_CHECK" === type) {
                return "Seal No";
            }
            if ("OFFLOAD" === type) {
                return "Offload";
            }
        };

        $scope.savePicture = function (param) {

            var offload = {};
            offload.id = param.stepId;
            offload.photoGroups = [{ type: param.type, photoIds: param.fileIds }];
            receiveTaskService.updateOffload(offload).then(function () {
               
            }, function (error) {

                lincUtil.processErrorResponse(error);
            });
        }

        $scope.editOffload = function () {
            $state.go('wms.task.receiveTask.offloadEdit', { taskId: $scope.task.id });
        };

        $scope.reopenStep = function (step) {
            receiveTaskService.reopenStep($scope.task.id, step.id).then(function () {
                lincUtil.updateSuccessfulPopup(function () {
                    step.status = "In Progress";
                });
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.editTask = function (taskId) {
            $state.go('wms.task.receiveTask.edit', { taskId: taskId });
        };

        $scope.updateStepAssignee = function (step) {
            $mdDialog.show({
                templateUrl: 'wms/outbound/task/template/editPickTask.html',
                locals: {
                    taskId: taskId
                },
                controller: editPickTaskController
            }).then(function (task) {
                angular.forEach($scope.pickTasks, function (item, key) {
                    if (item.id == task.id) {
                        $scope.pickTasks[key] = task;
                        if (task.plannedAssignee) {
                            $scope.userMap[task.plannedAssigneeUserId] = task.plannedAssignee;
                        }
                    }
                });
            }, function () {
            });
        };
        
        $scope.forceClose = function (taskId) {
            lincUtil.confirmPopup('Tip', 'Would you like to force close this task?', function () {
                $scope.isForceClose = true;
                receiveTaskService.forceClose(taskId).then(function () {
                    $scope.isForceClose = false;
                    getTaskStepsDetail($stateParams.taskId);
                }, function (error) {
                    $scope.isForceClose = false;
                    lincUtil.errorPopup(error.data.error);
                });
            });
        };

        $scope.execptionGroupByStepId = {};

        function processPhotos(offload) {
            offload.photoGroups = _.groupBy(offload.photoGroups, "type");
            $scope.containerNoPhotoIds=_.flattenDeep(_.map(offload.photoGroups['CONTAINER_NO_CHECK'],'photoIds'));
            $scope.sealNoPhotoIds=_.flattenDeep(_.map(offload.photoGroups['SEAL_CHECK'],'photoIds'));
            $scope.offLoadPhotoIds= _.flattenDeep(_.map(offload.photoGroups['OFFLOAD'],'photoIds'));
        }

        $scope.initFilterSnDetails =function (snList,snDetails) {
            var ObjSnList=[];
            _.forEach(snList, function(item){
                ObjSnList.push({sn:item,weight:null});
            });
            return _.unionBy(snDetails,ObjSnList,'sn');
        };


    function initActiveTabs(steps) {
            $scope.activeTabs = {};
            angular.forEach(steps, function (step) {
                $scope.activeTabs[step.id] = "content";
            });
        }
    };
    ctrl.$inject = ['$scope', '$stateParams', '$timeout', 'receiveTaskService',
        'receiveExceptionService', 'lincUtil', '$state'];
    return ctrl;
});
