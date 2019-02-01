'use strict';
define(['angular', 'lodash', 'clipboard', './transloadStepDurationDetailController', './completeStepDialog'],
    function (angular, _, Clipboard, transloadStepDurationDetailController, completeStepDialog) {
        var ctrl = function ($scope, $stateParams, $timeout, transloadTaskService, lincUtil, addressService, locationService, $state,
            $mdDialog,entryService) {
            var clipboard;
            $scope.changeCartonTab = function (cartonObj) {
                if (!cartonObj) {
                    return;
                }
                $scope.cartonTab = cartonObj.id;
                if (!clipboard) {
                    clipboard = new Clipboard("#copyBtn");
                }
                $scope.copyObj = { text: cartonObj.copyCartonStr };
            };

            function getTaskStepsDetail(taskId) {
                transloadTaskService.getTaskById(taskId).then(function (response) {
                    $scope.task = response.task;
                    $scope.receipt = response.receipt;
                    $scope.loadMap = response.loadMap;
                    $scope.orderMap = response.orderMap;
                    $scope.photoMap = response.photoMap;
                    $scope.cartonObjs = initCartonObjs($scope.orderMap, $scope.receipt, response.orderItemLineMap);
                    $scope.changeCartonTab($scope.cartonObjs[0]);
                    getTaskStepsTimer($scope.task.steps);
                    initActiveTabs($scope.task.steps);
                    setConvertToGenericBtnStatus($scope.task);
                    setStepDisabledStatus($scope.task.steps);
                    setUpPhotoGroups(response.task);
                });
            }

            function setConvertToGenericBtnStatus(task) {
                var stepsKeyByName = _.keyBy(task.steps, 'name');
                if (stepsKeyByName['Receiving']  && stepsKeyByName['Receiving'].status==='Done' && !stepsKeyByName['Shipping']) {
                    task.isShowConvertBtn = true;
                } else {   
                    task.isShowConvertBtn = false;
                }
            }

            function setUpPhotoGroups(task) {
                var photoSteps = [];
                var photoMapStepIds;
                var steps = task.steps;
                _.forEach(steps, function (step) {
                    if (step.stepType === 'Transload Photo') {
                        photoMapStepIds = _.keyBy(_.union(step.inboundPhotos, step.outboundPhotos), 'stepId');
                    }
                    if (step.stepType === 'Receiving' || step.stepType === 'Shipping') {
                        var headInfo;
                        if (step.stepType === 'Receiving') {
                            headInfo = 'INBOUND: ( DOCK :' + (step.dock ? step.dock.name : "") + ', Container#: ' + step.containerNOs.toString() + ', Entry: ' + step.entryId + ', RN: ' + step.receiptId + ' )';
                        }
                        else {
                            headInfo = 'OUTBOUND: ( DOCK :' + (step.dock ? step.dock.name : "") + ', Trailer#: ' + step.trailers.toString() + ', Entry: ' + step.entryId + ', Load ID: ' + step.loadId + ' )';

                        }
                        photoSteps.push({ headInfo: headInfo, stepType: step.stepType, stepId: step.id, photoIds: [] })
                    }
                });

                if (photoSteps.length > 0 && photoMapStepIds) {
                    _.forEach(photoSteps, function (photoStep) {
                        if (photoMapStepIds[photoStep.stepId]) {
                            photoStep.photoIds = photoMapStepIds[photoStep.stepId].photoIds;
                        }
                    })
                }
                $scope.photoGroups = photoSteps;

            }

            function getTaskStepsTimer(steps) {
                if (!steps || steps.length == 0) {
                    return;
                }
                var stepIds = _.map(steps, "id");
                transloadTaskService.searchStepTimer({ stepIds: stepIds }).then(function (stepTimers) {
                    $scope.stepTimerMap = _.keyBy(stepTimers, "stepId");
                    _.forEach(stepTimers, function (stepTimer) {
                        stepTimer.timePoints = _.sortBy(stepTimer.timePoints, "time");
                        var durationTimestamp = transloadTaskService.getDurationTimestamp(stepTimer.timePoints);
                        stepTimer.durationTime = lincUtil.formatTimestampDuration(durationTimestamp);
                    });
                });
            }

            function initCartonObjs(orderMap, receipt, orderItemLineMap) {
                var arr = [];
                if (receipt) {
                    setObjCartons(receipt);
                    arr.push(receipt);
                }
                _.forIn(orderMap, function (order, orderId) {
                    order.itemLines = orderItemLineMap[orderId];
                    setObjCartons(order);
                    arr.push(order);
                });
                return arr;
            }

            function setObjCartons(obj) {
                var cartons = [];
                _.forEach(obj.itemLines, function (itemLine) {
                    _.unionWith(itemLine.cartons, cartons, _.isEqual);
                    cartons = _.unionBy(itemLine.cartons, cartons, "cartonNo");
                });
                obj.cartons = cartons;
                var cartonNos = _.map(cartons, "cartonNo");
                obj.copyCartonStr = _.join(cartonNos, '\n');
            }

            $scope.changeTab = function (tab, step) {
                $scope.activeTabs[step.id] = tab;
                if (tab === "stepException") {
                    clipboard = new Clipboard("#copyExceptionBtn");
                }
                if (step.exceptionResult && step.exceptionResult.hasException) {
                    step.exceptionResult.exceptionCartonStr = _.join(step.exceptionResult.notReceiveCartons, "\n");
                }
            };


            $scope.generateShipToAddressStr = function (shipToAddress) {
                return addressService.generageAddressData(shipToAddress, null);
            };

            function initActiveTabs(steps) {
                $scope.activeTabs = {};
                angular.forEach(steps, function (step) {
                    $scope.activeTabs[step.id] = "content";
                });
            }

            function setStepDisabledStatus(steps) {
                angular.forEach(steps, function (step) {
                    if (step.name == "Shipping" && (step.status == 'Force Closed' || step.status == 'Done' || step.status == 'Skipped')) {
                        step.shippAllIsDisabled = true;
                    }
                    if (step.name == "Receiving" && (step.status == 'Force Closed' || step.status == 'Done' || step.status == 'Skipped')) {
                        step.receiveAllIsDisabled = true;
                    }
                    if (step.status != 'New' && step.status != 'In Progress') {
                        step.completeIsDisabled = true;
                    }
                    if (step.status != 'Force Closed' && step.status != 'Done' && step.status != 'Skipped') {
                        step.reopenIsDisabled = true;
                    }
                    if (step.name == "Shipping" && (step.status == 'Force Closed' || step.status == 'Done' || step.status == 'Skipped')) {
                        step.lazyCloseIsDisabled = true;
                    }
                    if (step.name == "Offload") {
                        step.photoGroups = _.groupBy(step.photoGroups, "type");
                        $scope.offLoadPhotoIds = _.flattenDeep(_.map(step.photoGroups['OFFLOAD'], 'photoIds'));
                    }
                });
            }

            $scope.editTask = function () {
                $state.go("wms.task.transloadTask.edit", { taskId: $scope.task.id });
            };

            $scope.stepUnReceiveAll = function (step) {
                lincUtil.confirmPopup('Tip', "Are you sure you want to un-receive all cartons without scanning?", function () {
                    step.unreceiveAllIsLoading = true;
                    transloadTaskService.stepUnReceiveAll($scope.task.id, step.id).then(function () {
                        step.unreceiveAllIsLoading = false;
                        lincUtil.messagePopup("Info", "Un Receive all successful.");
                        init();
                    }, function (error) {
                        step.unreceiveAllIsLoading = false;
                        lincUtil.processErrorResponse(error);
                    });
                });
            };

            $scope.stepUnShipAll = function (step) {
                lincUtil.confirmPopup('Tip', "Are you sure you want to un-ship all cartons without scanning?", function () {
                    step.unshippingAllIsLoading = true;
                    transloadTaskService.stepUnShipAll($scope.task.id, step.id).then(function () {
                        step.unshippingAllIsLoading = false;
                        lincUtil.messagePopup("Info", "Un Ship all successful.");
                        init();
                    }, function (error) {
                        step.unshippingAllIsLoading = false;
                        lincUtil.processErrorResponse(error);
                    });
                });
            };

            $scope.stepReceiveAll = function (step) {
                lincUtil.confirmPopup('Tip', "Are you sure you want to receive all cartons without scanning?", function () {
                    step.receiveAllIsLoading = true;
                    transloadTaskService.stepReceiveAll($scope.task.id, step.id).then(function () {
                        step.receiveAllIsLoading = false;
                        lincUtil.messagePopup("Info", "Receive all successful.");
                        init();
                    }, function (error) {
                        step.receiveAllIsLoading = false;
                        lincUtil.processErrorResponse(error);
                    });
                });
            };

            $scope.stepShipAll = function (step) {
                lincUtil.confirmPopup('Tip', "Are you sure you want to ship all cartons without scanning?", function () {
                    step.shippingAllIsLoading = true;
                    transloadTaskService.stepShipAll($scope.task.id, step.id).then(function () {
                        step.shippingAllIsLoading = false;
                        lincUtil.messagePopup("Info", "Ship all successful.");
                        init();
                    }, function (error) {
                        step.shippingAllIsLoading = false;
                        lincUtil.processErrorResponse(error);
                    });
                });
            };

            function confirmIfNeedToReleaseDock(step) {
                if (step.name == "Shipping" || step.name == "Receiving") {
                    lincUtil.confirmPopup('Tip', "Do you want to release this step dock?", function () {
                        locationService.releaseDock(step.dockId, step.entryId).then(function () {
                            lincUtil.messagePopup("Info", "Dock Release successful");
                        }, function (error) {
                            lincUtil.processErrorResponse(error);
                        });
                    });
                }
            }

            $scope.savePicture = function (param) {
                if (param.type === 'OFFLOAD') {
                    var offload = {};
                    offload.id = param.stepId;
                    offload.photoGroups = [{ type: param.type, photoIds: param.fileIds }];
                    transloadTaskService.updateTransloadOffload($scope.task.id, offload).then(function () {

                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });

                } else {
                    var transloadPhotoStepUpdate = {};
                    var tranloadStepPhotoId = (_.filter($scope.task.steps, ['stepType', "Transload Photo"]))[0].id;
                    if (param.type === 'Receiving') {
                        transloadPhotoStepUpdate.inboundPhotos = [{ stepId: param.stepId, photoIds: param.fileIds }]
                    } else {
                        transloadPhotoStepUpdate.outboundPhotos = [{ stepId: param.stepId, photoIds: param.fileIds }]
                    }
                    transloadTaskService.updateStepPhoto($scope.task.id, tranloadStepPhotoId, transloadPhotoStepUpdate).then(function () {

                    }, function (error) {

                    });

                }
            }

            $scope.releaseDock = function (step) {
                lincUtil.confirmPopup('Tip', "Are you sure you want to release this step dock?", function () {
                    step.dockReleasing = true;
                    locationService.releaseDock(step.dockId, step.entryId).then(function () {
                        step.dockReleasing = false;
                        lincUtil.messagePopup("Info", "Dock Release successful");
                        init();
                    }, function (error) {
                        step.dockReleasing = false;
                        lincUtil.processErrorResponse(error);
                    });
                });
            };

            $scope.createNewLoad = function (step) {
                lincUtil.confirmPopup('Tip', "Are you sure you want to create new load?", function () {
                    step.createNewLoad = true;
                    transloadTaskService.stepCreateNewLoad(step.loadId).then(function (response) {
                        step.createNewLoad = false;
                        if (response.id) {
                            lincUtil.messagePopup("Info", "Create new load successful");
                            init();
                        }
                        else {
                            lincUtil.messagePopup("Info", "All orders are completed,No new load created. ");
                        }

                    }, function (error) {
                        step.createNewLoad = false;
                        lincUtil.processErrorResponse(error);
                    });
                });
            };

            $scope.startStep = function (step) {

                step.stepStarting = true;
                transloadTaskService.startStep($scope.task.id, step.id).then(function () {
                    step.stepStarting = false;
                    lincUtil.messagePopup("Info", "Step started");
                    init();
                }, function (error) {
                    step.stepStarting = false;
                    lincUtil.errorPopup(error.data.error);
                });
            };


            $scope.completeStep = function (step) {

                lincUtil.confirmPopup('Tip', "Are you sure you want to complete this step?", function () {
                    step.completeStepIsLoading = true;
                    transloadTaskService.completeStep($scope.task.id, step.id, step.name).then(function (response) {
                        if (step.name == "Shipping" && !response.isOrderFulfill) {
                            tipIfNewLoad(step)
                        } else {
                            init();
                            confirmIfNeedToReleaseDock(step);
                        }
                    }, function (error) {
                        step.completeStepIsLoading = false;
                        lincUtil.confirmPopup('Tip', error.data.error + ",are you sure you want to force close?", function () {
                            var form = {
                                templateUrl: 'wms/task/transload-task/template/completeStepDialog.html',
                                locals: {
                                    tips: "Complete",
                                    stepId: step.id,
                                    taskId: $scope.task.id
                                },
                                autoWrap: true,
                                controller: completeStepDialog
                            };
                            $mdDialog.show(form).then(function (response) {
                                step.completeStepIsLoading = false;
                                init();
                                confirmIfNeedToReleaseDock(step);
                            });
                        });
                    });
                });

            };

            function tipIfNewLoad(step) {
                lincUtil.confirmPopup('Tip', "Order is not full fill, are you sure you want to create new load?", function () {
                    transloadTaskService.stepCreateNewLoad(step.loadId).then(function (response) {
                        step.completeStepIsLoading = false;
                        lincUtil.popUpWithHtml("Create new load successful. loadId:" + "<a ng-href='#/wms/outbound/load/" + response.id + " '  target='_blank'>" + response.id + "</a>", function () {
                            init();
                            confirmIfNeedToReleaseDock(step);
                        });
                    }, function (error) {
                        step.completeStepIsLoading = false;
                        lincUtil.processErrorResponse(error);
                        init();
                        confirmIfNeedToReleaseDock(step);
                    });
                }, function () {
                    init();
                    confirmIfNeedToReleaseDock(step);
                });
            }

            $scope.convertToGeneric = function () {

                lincUtil.confirmPopup('Tip', "The inventory of  transload " + $scope.task.id + " will be converted to generic inventory and the task will be force closed, it can not be roll back, do you want to continue ?", function () {
                    $scope.convertLoading = true;
                    transloadTaskService.convertInventoryToGeneric($scope.task.id).then(function () {
                        $scope.convertLoading = false;
                        lincUtil.messagePopup("Info", "Convert To Generic successful.");
                        init();
                    }, function (error) {
                        $scope.convertLoading = false;
                        lincUtil.processErrorResponse(error);
                    });
                });
            };


            $scope.closeTask = function () {

                lincUtil.confirmPopup('Tip', "Are you sure you want to close this task?", function () {
                    $scope.closeTaskIsLoading = true;
                    transloadTaskService.closeTask($scope.task.id).then(function () {
                        $scope.closeTaskIsLoading = false;
                        lincUtil.messagePopup("Info", "Complete task successful.");
                        init();
                    }, function (error) {
                        $scope.closeTaskIsLoading = false;
                        lincUtil.confirmPopup('Tip', error.data.error + ",are you sure you want to force close?", function () {

                            var form = {
                                templateUrl: 'wms/task/transload-task/template/completeStepDialog.html',
                                locals: {
                                    tips: "Close Task",
                                    stepId: null,
                                    taskId: $scope.task.id
                                },
                                autoWrap: true,
                                controller: completeStepDialog
                            };
                            $mdDialog.show(form).then(function (response) {
                                step.closeTaskIsLoading = false;
                                lincUtil.messagePopup("Info", "Complete task successful.");
                                init();
                            });
                        });

                    });
                });
            };


            $scope.cancelTask = function () {

                lincUtil.confirmPopup('Tip', "Are you sure you want to cancel this task?", function () {
                    $scope.cancelTaskIsLoading = true;
                    transloadTaskService.cancelTask($scope.task.id).then(function () {
                        $scope.cancelTaskIsLoading = false;
                        lincUtil.messagePopup("Info", "Cancel task successful.");
                        init();
                    }, function (error) {
                        $scope.cancelTaskIsLoading = false;
                        lincUtil.processErrorResponse(error);
                    });
                });
            };

            $scope.lazyCloseStep = function (step) {
                lincUtil.confirmPopup('Tip', "Are you sure you want to lazy close this step?", function () {
                    step.lazyCloseStepIsLoading = true;
                    transloadTaskService.lazyCloseStep($scope.task.id, step.id).then(function () {
                        step.lazyCloseStepIsLoading = false;
                        tipIfNewLoad(step);
                    }, function (error) {
                        step.lazyCloseStepIsLoading = false;
                        lincUtil.processErrorResponse(error);
                    });
                });
            };

            $scope.reopenStep = function (step) {
                step.reopenStepIsLoading = true;
                transloadTaskService.reopenStep($scope.task.id, step.id).then(function () {
                    step.reopenStepIsLoading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        init();
                    });
                }, function (error) {
                    step.reopenStepIsLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            };

            $scope.popUpDurationDetail = function (step) {
                var form = {
                    templateUrl: 'wms/task/transload-task/template/transloadStepDurationDetail.html',
                    locals: {
                        stepTimer: $scope.stepTimerMap[step.id],
                        stepName: step.name
                    },
                    autoWrap: true,
                    controller: transloadStepDurationDetailController
                };
                $mdDialog.show(form);
            };


            $scope.printTallySheet = function (taskId) {
                var url = $state.href('transloadTallySheetPrint', {
                    taskId: taskId
                });
                window.open(url);
            };

            function init() {
                getTaskStepsDetail($stateParams.taskId);
                getPendingLoad();
            }

            function getPendingLoad(){

                transloadTaskService.searchLoadIdsWithUnrelatedStep($stateParams.taskId).then(function (res) {
                    $scope.pendingLoadIds = res;
                }, function (error) {
                  
                    lincUtil.processErrorResponse(error);
                });
            }

            $scope.pendingLoadToCreatEntry =function(){
                lincUtil.confirmPopup('Tip', "Do you want to create entry and do the window checkin?", function () {
                    var entry = {};
                    entry.checkInTypes = ["Load"];
                    entry.entryType = "Window";
                    entryService.createEntry(entry).then(function (response) {
                        $scope.toWindow(response.id);
                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });

                });
            }

            
        $scope.toWindow = function (entryId) {
             var url = $state.href('cf.facility.windowCheckin.checkinProcess.carrierInfo', {
                entryId: entryId
            });
            window.open(url);
        };

            $scope.widthPer = function (stepsProgress) {
                var per = Math.floor(stepsProgress * 100) + '%';
                return per;
            };

            $scope.widthPer25 = function (stepsProgress) {
                var per = stepsProgress * 100 >= 25 ? '100%' : Math.floor(((stepsProgress * 100) / 25) * 100) + '%';
                return per;
            };

            $scope.widthPer50 = function (stepsProgress) {
                var per = stepsProgress * 100 >= 50 ? '100%' : (Math.floor((stepsProgress * 100 - 25)) / 25 * 100) + '%';
                return per;
            };

            $scope.widthPer75 = function (stepsProgress) {
                var per = stepsProgress * 100 >= 75 ? '100%' : (Math.floor((stepsProgress * 100 - 50)) / 25 * 100) + '%';
                return per;
            };

            $scope.widthPer100 = function (stepsProgress) {
                var per = stepsProgress * 100 >= 100 ? '100%' : (Math.floor((stepsProgress * 100 - 75)) / 25 * 100) + '%';
                return per;
            };


            init();
        };
        ctrl.$inject = ['$scope', '$stateParams', '$timeout', 'transloadTaskService',
            'lincUtil', 'addressService', 'locationService', '$state', '$mdDialog','entryService'];
        return ctrl;
    });
