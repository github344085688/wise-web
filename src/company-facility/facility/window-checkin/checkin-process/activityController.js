'use strict';

define(['angular', 'lodash', './forceRemoveReceiptTipDialogController'],
    function (angular, _, forceRemoveReceiptTipDialogController) {
    var activityController = function ($scope, $q, $state, $stateParams, $mdDialog, $timeout,
        entryService, lincUtil, receiptService,loadsService, transloadTaskService) {
        var oldReceiptList, oldLoadList;
        var nowIsTransload;
        var originalIsTransloadTask;

        $scope.continue = function () {
            if (!$scope.hasActivity()) {
                lincUtil.errorPopup("Please add the Load or Receipt First");
                return;
            }
            if (!judgeIfAllowed($scope.receiptList, $scope.loadList)) {
                return;
            }
            nowIsTransload = judgeIsTransload($scope.receiptList, $scope.loadList);
            if ($scope.isCheckedOut()) {
                goToTaskPage(nowIsTransload);
            } else {
                continues();
            }
        };

        function continues() {
            $scope.continueLoading = true;
            updateReceipts();
            updateLoads();
            saveTasks(function () {
                saveActivities().then(function (response) {
                    $scope.saveLoading = false;
                    $scope.continueLoading = false;
                    if (response.error) {
                        lincUtil.errorPopup("Error Found:" + response.error);
                        return;
                    }
                    goToTaskPage(nowIsTransload);
                }, function (error) {
                    $scope.saveLoading = false;
                    $scope.continueLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            });
        }

        function saveTasks(cbFun) {
            var oldObjectList = _.concat(oldReceiptList, oldLoadList);
            if (oldObjectList.length == 0) {
                if (nowIsTransload) {
                    var addParam = {};
                    if ($scope.receiptList.length > 0) {
                        addParam.receiptId = $scope.receiptList[0].id;
                    }
                    if ($scope.loadList.length > 0) {
                        addParam.loadIds = _.map($scope.loadList, "id");
                    }
                    createTransloadTask(addParam, cbFun);
                } else {
                    cbFun();
                }
            } else {
                if (!originalIsTransloadTask) {
                    saveTaskWhenOriginalTaskIsNotTransload(cbFun);
                } else {
                    saveTaskWhenOriginalTaskIsTransload(originalIsTransloadTask, cbFun);
                }
            }
        }

        function saveTaskWhenOriginalTaskIsTransload(transloadTask, cbFun) {
            if (nowIsTransload) {
                compareActivityToSaveTransloadTask(transloadTask.id, cbFun)
            } else {
                deleteTransloadSteps(transloadTask.id, cbFun);
            }
        }

        function saveTaskWhenOriginalTaskIsNotTransload(cbFun) {
            if (nowIsTransload) {
                entryService.deleteReceiveAndLoadTasksByEntryId($scope.entry.id).then(function () {
                    var addParam = {};
                    if ($scope.receiptList.length > 0) {
                        addParam.receiptId = $scope.receiptList[0].id;
                    }
                    if ($scope.loadList.length > 0) {
                        addParam.loadIds = _.map($scope.loadList, "id");
                    }
                    createTransloadTask(addParam, cbFun);
                }, function (error) {
                    $scope.continueLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            } else {
                updateRecieptTaskAndLoadTask(cbFun);
            }
        }

        function deleteTransloadSteps(transloadTaskId, cbFun) {
            var deleteParam = {};
            if (oldReceiptList.length > 0) {
                deleteParam.receiptId = oldReceiptList[0].id;
            }
            if (oldLoadList.length > 0) {
                deleteParam.loadIds = _.map(oldLoadList, "id");
            }
            deleteParam.entryId = $scope.entry.id;
            transloadTaskService.deleteSteps(transloadTaskId, deleteParam).then(function () {
                cbFun();
            }, function (error) {
                $scope.continueLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function compareActivityToSaveTransloadTask(transloadTaskId, cbFun) {
            var deleteParam = {};
            var addParam = {};
            var diffReceiptList = _.differenceBy(oldReceiptList, $scope.receiptList, "id");
            if (diffReceiptList.length > 0) {
                deleteParam.receiptId = diffReceiptList[0].id;
            }
            diffReceiptList = _.differenceBy($scope.receiptList, oldReceiptList, "id");
            if (diffReceiptList.length > 0) {
                addParam.receiptId = diffReceiptList[0].id;
            }

            var diffLoadList = _.differenceBy(oldLoadList, $scope.loadList, "id");
            deleteParam.loadIds = _.map(diffLoadList, "id");
            diffLoadList = _.differenceBy($scope.loadList, oldLoadList, "id");
            addParam.loadIds = _.map(diffLoadList, "id");

            if (deleteParam.loadIds.length > 0 || deleteParam.receiptId) {
                deleteParam.entryId = $scope.entry.id;
                transloadTaskService.deleteSteps(transloadTaskId, deleteParam).then(function () {
                    createTransloadTask(addParam, cbFun);
                }, function (error) {
                    $scope.saveLoading = false;
                    $scope.continueLoading = false;
                    lincUtil.processErrorResponse(error);
                });

            } else {
                createTransloadTask(addParam, cbFun);
            }

        }
        function createTransloadTask(addParam, cbFun) {
            var objList = _.compact(_.concat($scope.receiptList, $scope.loadList));
            if (addParam.receiptId || (addParam.loadIds && addParam.loadIds.length > 0)) {
                addParam.wiseCompanyId = objList[0].companyId;
                addParam.entryId = $scope.entry.id;
                transloadTaskService.createTask(addParam).then(function (response) {
                    cbFun();
                }, function (error) {
                    $scope.continueLoading = false;
                    $scope.saveLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            } else {
                cbFun();
            }
        }

        function goToTaskPage(nowIsTransload) {
            $scope.$parent.carrierInfoClass = "done";
            $scope.$parent.activityClass = "done";
            $scope.$parent.tasksClass = "active";
            $scope.$parent.isTransload =  nowIsTransload;
            if (!nowIsTransload) {
                $state.go('cf.facility.windowCheckin.checkinProcess.tasks', { entryId: $stateParams.entryId });
            } else {
                $state.go('cf.facility.windowCheckin.checkinProcess.transloadTask', { entryId: $stateParams.entryId });
            }
        }

        function judgeIsTransload(receiptList, loadList) {
            var objectList = _.concat(receiptList, loadList);
            if(!objectList.length) return true;
            angular.forEach(objectList, function (obj) {
                if (!obj.isTransload) {
                    obj.isTransload = false;
                }
            });
            var isTransload = objectList[0].isTransload;
            var index = _.findIndex(objectList, function (object) {
                return object.isTransload != isTransload;
            });
            if (isTransload && index < 0) {
                return true;
            } else {
                return false;
            }
        }

        $scope.getFieldDragListener = {
            containment: '#field-priority-container'
        };

        var saveActivities = function () {
            var activityList = toEntryTicketActivityList($scope.receiptList, $scope.loadList);
            return entryService.saveActivity($stateParams.entryId, activityList);
        };

        function judgeIfAllowed(receiptList, loadList) {
            var objectList = _.concat(receiptList, loadList);
            if(!objectList.length) return true;
            angular.forEach(objectList, function (obj) {
                if (!obj.isTransload) {
                    obj.isTransload = false;
                }
            });
            var isTransload = objectList[0].isTransload;
            var index = _.findIndex(objectList, function (object) {
                return object.isTransload != isTransload;
            });
            if (index > -1) {
                lincUtil.messagePopup("Tip", "Can not mix the transload and no transload receipts or loads!");
                return false;
            } else if (isTransload && receiptList.length > 1) {
                lincUtil.messagePopup("Tip", "Only one transload receipt is allowed!");
                return false;
            }

            var companyIdList = _.uniq(_.map(objectList, "companyId"));
            if (companyIdList.length != 1) {
                lincUtil.messagePopup("Tip", "Can not mix Different company's receipts or loads!");
                return false;
            }

        
            return true;
        }

        $scope.save = function () {
            // if (!$scope.hasActivity()) {
            //     lincUtil.errorPopup("Please add the Load or Receipt First");
            //     return;
            // }
            if (!judgeIfAllowed($scope.receiptList, $scope.loadList)) {
                return;
            };
            save();
        };

        function save() {
            $scope.saveLoading = true;
            nowIsTransload = judgeIsTransload($scope.receiptList, $scope.loadList);
            updateReceipts();
            updateLoads();
            saveTasks(function () {
                saveActivities().then(function (response) {
                    $scope.saveLoading = false;            
                    lincUtil.saveSuccessfulPopup( _init());
                }, function (error) {
                    $scope.saveLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            });
        }

        function updateRecieptTaskAndLoadTask(callback) {
            var oldReceiptListids = _.map(oldReceiptList, 'id');
            var oldLoadListids = _.map(oldLoadList, 'id');
            var receiptListids = _.map($scope.receiptList, 'id');
            var LoadListids = _.map($scope.loadList, 'id');
            if ($scope.entry.status != 'Need Window Check In') {
                if ((_.difference(oldReceiptListids, receiptListids)).length > 0 || (_.difference(receiptListids, oldReceiptListids)).length > 0 || (_.difference(oldLoadListids, LoadListids)).length > 0 || (_.difference(LoadListids, oldLoadListids)).length > 0) {
                    lincUtil.confirmPopup('Save? YES/NO ', 'Related tasks will be updated or removed. Do you want to continue?', function () {
                            entryService.updateRecieptTaskAndLoadTask($scope.receiptList, $scope.loadList, $stateParams.entryId).then(function (response) {
                                callback();
                            });
                        }, function (error) {
                            $scope.saveLoading = false;
                            lincUtil.processErrorResponse(error);
                        });
                }
                else {
                    callback();
                }
            }
            else {
                entryService.updateRecieptTaskAndLoadTask($scope.receiptList, $scope.loadList, $stateParams.entryId).then(function (response) {
                    callback();
                }, function (error) {
                    $scope.continueLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        }


        function validateIsAllHasReferenceNo(receiptList) {
            var index = _.findIndex(receiptList, function (receipt) {
                return !receipt.referenceNo
            })
            if (index > -1) {
                return false;
            } else {
                return true;
            }
        }

        function toEntryTicketActivityList(receiptList, loadList) {
            var activityList = [];
            var count = 0;
            var companyGroup = [];

            //taskType to define receive or load
            _.forEach(loadList, function (load) {
                var groupFound = _.find(companyGroup, function (group) {
                    return group.id == load.companyId;
                });
                if (groupFound == null) {
                    count++;
                    groupFound = {};
                    groupFound.id = load.companyId;
                    groupFound.groupId = count;
                    companyGroup.push(groupFound);
                }
                var activity = {};
                activity.groupId = groupFound.groupId;
                activity.subTaskId = load.id;
                activity.taskType = 'Load';
                activityList.push(activity);
            });

            companyGroup = [];
            _.forEach(receiptList, function (receipt) {
                var groupFound = _.find(companyGroup, function (group) {
                    return group.id == receipt.companyId;
                });
                if (groupFound == null) {
                    count++;
                    groupFound = {};
                    groupFound.id = receipt.companyId;
                    groupFound.groupId = count;
                    companyGroup.push(groupFound);
                }
                var activity = {};
                count++;
                activity.groupId = groupFound.groupId;
                activity.subTaskId = receipt.id;
                activity.taskType = 'Receive';
                activityList.push(activity);
            });

            return activityList;
        }

        $scope.loadRemovable = function (load) {
            var removableStatuses = ["New", "Window Checkin Done"];
            var index = removableStatuses.indexOf(load.status);
            return index > -1 ? true : false;
        };

        $scope.receiptRemovable = function (receipt) {
            if($scope.receiptForceRemovable(receipt)) {
                return false;
            }
            var noRemovableStatus = ["In Progress", "Task Completed", "Exception", "Closed", "Force Closed", "Cancelled"]
            var index = noRemovableStatus.indexOf(receipt.status);
            return index > -1 ? false : true;
        };

        $scope.receiptForceRemovable = function (receipt) {
            if(receipt.status == "In Progress" && !receipt.isTransload) {
                return true;
            }else {
                return false;
            }
        };

        $scope.hasActivity = function () {
            if (($scope.receiptList && $scope.receiptList.length > 0) || ($scope.loadList && $scope.loadList.length > 0)) {
                return true;
            }
            return false;
        };

        $scope.addLoad = function (load) {
            if (load.id) {
                if (!load.status || "New" !== load.status) {
                    lincUtil.errorPopup("Load status is " + load.status);
                    return;
                }
                _.forEach($scope.loadList, function (l) {
                    if (l.id === load.id) {
                        var error = "Load has been added to the list!!!";
                        lincUtil.errorPopup(error);
                        throw new Error(error);
                    }
                });
                entryService.searchLoadTask(load.id, load.companyId).then(function (response) {
                    if (response.error) {
                        lincUtil.errorPopup(response.error);
                        return;
                    }
                    if (response.length > 0 && response[0].entryId !== $stateParams.entryId) {
                        lincUtil.errorPopup("Load has been tasked, taskId:" + response[0].id);
                        return;
                    }
                    $scope.loadList.push(load);
                    $scope.loadList = _.uniqBy($scope.loadList, 'id');
                    $scope.loadList = _.sortBy($scope.loadList, ['companyId', 'id']);
                    $scope.load.selectedLoad = "";
                    $scope.availableLoads = [];
                });

            } else {
                lincUtil.errorPopup("Invalid Load!!!");
            }
        };

        $scope.addReceipt = function (receipt) {
            if (receipt.id) {
                _.forEach($scope.receiptList, function (r) {
                    if (r.id === receipt.id) {
                        var error = "Receipt has been added to the list!!!";
                        lincUtil.errorPopup(error);
                        throw new Error(error);
                    }
                });
                $scope.receiptList.push(receipt);
                $scope.receiptList = _.uniqBy($scope.receiptList, 'id');
                $scope.receiptList = _.sortBy($scope.receiptList, ['companyId', 'id']);
                $scope.receipt.selectedReceipt = "";
                $scope.availableReceipts = [];
            } else {
                lincUtil.errorPopup("Invalid Receipt!");
            }
        };

        $scope.removeItem = function (list, index) {
            lincUtil.confirmPopup('Remove Item!', 'Are you sure to remove this item?', function () {
                list.splice(index, 1);
            });
        };
        
        $scope.forceRemoveItem = function (list, index) {
            var receipt = list[index];
            $mdDialog.show({
                templateUrl: 'company-facility/facility/window-checkin/checkin-process/template/forceRemoveReceiptTipDialog.html',
                locals: {
                    receiptId: receipt.id,
                    entryId: $stateParams.entryId
                },
                controller: forceRemoveReceiptTipDialogController
            }).then(function () {
                list.splice(index, 1);
            }, function () {
            });
        };

        $scope.searchLoadAndReceipts = function (search) {
            if (!search || search === '') {
                return;
            }
            $q.all([entryService.searchAvailableReceipts(search), entryService.searchAvailableLoads(search)])
                .then(function (values) {
                    setLoadAndReceipts(_.flatMap(values));
            });
        };
        
        function setLoadAndReceipts(loadAndReceipts) {
            var hasLoadHead = false;
            var hasReceiptHead = false;
            _.forEach(loadAndReceipts, function (item) {
                item.itemType = _.startsWith(item.id, "LOAD") ? "Load" : "Receipt";
                item.isLoad = item.id && _.startsWith(item.id, "LOAD");
                if(!hasLoadHead && item.isLoad) {
                    hasLoadHead = true;
                    item.isLoadHead = true;
                } else if(!item.isLoad && !hasReceiptHead) {
                    hasReceiptHead = true;
                    item.isReceiptHead = true;
                }
            });
            $scope.loadAndReceipts = loadAndReceipts;
        }


        $scope.addLoadOrReceipt = function (item) {

            if(!item.entryIds || item.entryIds.length ===0 ){
                addLoadOrReceipt(item);
            }else{
                if(_.indexOf(item.entryIds,$stateParams.entryId) >-1 ){
                    addLoadOrReceipt(item)
                }else{
                    lincUtil.confirmPopup("Tip", "The " + item.id + " had been added to entry (" + item.entryIds.join(',') + "), are you still want to add it?", function(){
                        addLoadOrReceipt(item)
                    },function(){});
                }
            }
       
        };

        function addLoadOrReceipt(item){
            if (item.isLoad) {
                $scope.addLoad(item);
            } else if (!item.isLoad) {
                $scope.addReceipt(item);  
            } else {
                lincUtil.messagePopup("Tips", "Load is needed for loading, receipt is needed for receiving");
            }
        }

        $scope.printCountingSheet = function (load) {
            var url = $state.href('countingSheetPrint', {
                entryId: $stateParams.entryId,
                loadId: load.id
            });
            window.open(url);
        };

        function getActivitys() {
            $scope.isLoadingComplete = false;
            entryService.getActivity($stateParams.entryId).then(function (response) {
                $scope.isLoadingComplete = true;
                if (response.error) {
                    lincUtil.errorPopup("Error:" + response.error);
                    return;
                }
                $scope.receiptList = _.sortBy(response.receiptList, ['companyId', 'id']);
                $scope.loadList = _.sortBy(response.loadMap, ['companyId', 'id']);
                var loadMapSequences = _.compact(_.map($scope.loadList,'sequence'));
                if( $scope.loadList && loadMapSequences.length > 0){
                    $scope.loadList =_.sortBy($scope.loadList,'sequence');
                    $scope.loadParam.enableLoadSequence = true;
                }else{
                    $scope.loadParam.enableLoadSequence = false;
                }
                oldReceiptList = $scope.receiptList ? angular.copy($scope.receiptList) : [];
                oldLoadList = $scope.loadList ? angular.copy($scope.loadList) : [];
                if (!(oldReceiptList.length == 0 && oldLoadList.length == 0)) {
                    if (judgeIsTransload(oldReceiptList, oldLoadList)) {
                        getTransloadTask($stateParams.entryId);
                    }
                }
            }, function (error) {
                $scope.isLoadingComplete = true;
                lincUtil.processErrorResponse(error);
            });
        }

        function getTransloadTask(entryId) {
            transloadTaskService.searchTransloadTask({ entryIds: [entryId],excludeStatuses:['Cancelled'] }).then(function (response) {
                if (response.length > 0) {
                    originalIsTransloadTask = response[0];
                }
            });
        }

        /**
         *  Drop to only remove group
         */
        $scope.dropCallback = function (event, index, item, external) {
            if (item.type) {
                $timeout(function function_name(argument) {
                    var i = $scope.index;
                    _.forEach(item.columns[0], function (value) {
                        $scope.$apply(function () {
                            $scope.movedList.splice(i++, 0, value);
                        });
                    });
                }, 100);
                return true;
            }
            return false;
        };

        // Drag to mark the position of the item
        $scope.dndMovedCallBack = function (list, index) {
            $scope.index = index;
            list.splice(index, 1);
            $scope.movedList = list;
        };

        $scope.isCheckedOut = function () {
            // if ($scope.entry) {
            //     return _.indexOf(["Dock Checked Out"], $scope.entry.status) > -1;
            // }
        };

        function updateReceipts() {
            _.forEach($scope.receiptList, function (receipt) {
                if (!receipt.needCollectReceiptReferenceNoOnWindowCheckin) {
                    return;
                }
                var updateReceipt = {};
                updateReceipt.id = receipt.id;
                updateReceipt.referenceNo = receipt.referenceNo;
                updateReceipt.wiseCompanyId = receipt.companyId;
                receiptService.updateReceipt(updateReceipt).then(function (res) {
                }, function (error) {
                    $scope.saveLoading = false;
                    $scope.continueLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            });
        }

        function updateLoads() {
            var updateLoads = {'loadUpdates':[]};
            var needToDeleteLoadList = _.differenceBy(oldLoadList, $scope.loadList, "id");
            _.forEach(needToDeleteLoadList,function(load){
                var updateLoad = {};
                updateLoad.loadId = load.id;  
                updateLoad.sequence = null;
                updateLoads.loadUpdates.push(updateLoad);
            })
            _.forEach($scope.loadList, function (load,index) {
                var updateLoad = {};
                updateLoad.loadId = load.id;
                if (!$scope.loadParam.enableLoadSequence) {
                    updateLoad.sequence = null;
                }else{
                    updateLoad.sequence = index + 1;
                }
                updateLoads.loadUpdates.push(updateLoad);
            });

            loadsService.batchUpdateLoad(updateLoads).then(function (res) {
                }, function (error) {
                    $scope.saveLoading = false;
                    $scope.continueLoading = false;
                    lincUtil.processErrorResponse(error);
                });
         
        }

        $scope.loadParam = {'enableLoadSequence':false};
        $scope.changeAheadSequence = function (index) {
            var currentLoad = angular.copy($scope.loadList[index]);
            var aheadLoad = angular.copy($scope.loadList[index - 1]);
            $scope.loadList[index - 1] = currentLoad;
            $scope.loadList[index] = aheadLoad;

        };

        $scope.changeBehindSequence = function (index) {
            var currentLoad = angular.copy($scope.loadList[index]);
            var behindLoad = angular.copy($scope.loadList[index + 1]);
            $scope.loadList[index + 1] = currentLoad;
            $scope.loadList[index] = behindLoad;

        };


        function _init() {
            $scope.isLoadingComplete = true;
            $scope.orderedLoads = [];
            if (!$stateParams.entryId || $stateParams.entryId === "") {
                lincUtil.errorPopup("Please select an entry !!!", function () {
                    $state.go('cf.facility.windowCheckin.entry.entryList');
                });
            }
            getActivitys();
            entryService.getEntryByEntryId($stateParams.entryId).then(function (response) {
                $scope.entry = response;
            });
            $scope.receipt = {};
            $scope.load = {};
            $scope.templates = [{
                type: "Group",
                id: 1,
                columns: [
                    []
                ]
            }];
        }

        $scope.formateLoaction =function(locationNames){
            if(locationNames){
                return  locationNames.join(',');
            }
        }
        _init();

    };
    activityController.$inject = ['$scope', '$q', '$state', '$stateParams', '$mdDialog',
        '$timeout', 'entryService', 'lincUtil', 'receiptService','loadsService','transloadTaskService'];
    return activityController;
});