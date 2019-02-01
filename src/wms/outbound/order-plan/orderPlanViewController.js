'use strict';

define([
    'angular',
    'lodash',
    'jquery',
    './editScheduleInfoController',
    './editPickTaskController',
    './editReplenishmentTaskController',
    './editCCTaskController',
    './locationTipDialogController',
    'src/wms/task/pick-task/setUpBatchPickTaskController',
    'src/print-pages/batchLabelPrintForOrdersAndTaskController',
    './trackingNoViewController'
], function (angular, _, $, editScheduleInfoController, editPickTaskController,
    editReplenishmentTaskController, editCCTaskController, locationTipDialogController,setUpBatchPickTaskController, batchLabelPrintForOrdersAndTaskController,trackingNoViewController) {
        var controller = function ($scope, $state, $stateParams, orderPlanService, orderService,
            pickService, configurationChangeTaskService,
            replenishmentTaskService, $mdDialog,
            lincUtil, lincResourceFactory, addressService, facilityService, session) {
            var SORT_DEFAULT = "default";
            var SORT_ASC = "asc";
            var SORT_DESC = "desc";

            function initSet() {
                facilityService.getFacilityByOrgId(session.getCompanyFacility().facilityId).then(function (res) {
                    $scope.pickToOrderWeight = res.pickToOrderWeight;
                    if ($stateParams.orderPlanId) {
                        getOrderPlan($stateParams.orderPlanId);
                        initSorts();
                    }
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }

            function getReplenishmentTasks(replenishmentTaskIds) {
                if (replenishmentTaskIds && replenishmentTaskIds.length > 0) {
                    $scope.replenishmentTaskCount = replenishmentTaskIds.length;
                    $scope.replenishmentTaskIsLoading = true;
                    replenishmentTaskService.getTaskList({ taskIds: replenishmentTaskIds }).then(function (response) {
                        $scope.replenishmentTaskIsLoading = false;
                        $scope.replenishmentTasks = response;
                    }, function () {
                        $scope.replenishmentTaskIsLoading = false;
                    });
                } else {
                    $scope.replenishmentTaskCount = 0;
                }
            }

            function getPickTasks(pickTaskIds) {
                if (pickTaskIds && pickTaskIds.length > 0) {
                    $scope.pickTaskCount = pickTaskIds.length;
                    $scope.pickTaskLoading = true;
                    pickService.getPickTaskList({ taskIds: pickTaskIds }).then(function (response) {
                        $scope.pickTaskLoading = false;
                        $scope.userMap = response.userMap;
                        $scope.locationMap = response.locationMap;
                        $scope.itemSpecMap = response.itemSpecMap;
                        $scope.itemUnitMap = response.itemUnitMap;
                        $scope.organizationMap = response.organizationMap;
                        $scope.pickTasks = response.pickTasks;
                        $scope.orderMap = response.orderMap;
                        initCheckedWithAllPickTasks(response.pickTasks);
                        sumSameItemQty();
                    }, function () {
                        $scope.pickTaskLoading = false;
                    });
                } else {
                    $scope.pickTaskCount = 0;
                }
            }

            initSet();

            function sumSameItemQty(){
                _.forEach($scope.pickTasks,function(task){
                    var taskGroups =_.groupBy(task.pickItemLines,function(itemLine){
                         return itemLine.itemSpecId+'|'+itemLine.locationId+'|'+itemLine.unitId;
                    })
                    task.pickItemLines = [];
                    var newItemLines = [];
                    _.forEach(taskGroups,function(groups,key){

                      var sumQty = _.reduce(groups, function(sum, n) {
                              return sum + Number(n.qty);
                            }, 0);
                      var sumBaseQty = _.reduce(groups, function(sum, n) {
                          return sum + Number(n.baseQty);
                        }, 0);  
                      newItemLines = groups[0];
                      newItemLines.qty = sumQty;
                      newItemLines.baseQty = sumBaseQty;
                      task.pickItemLines.push(newItemLines);
                    });
                }); 
            }

            function getOrderPlan(orderPlanId) {
                $scope.summaryUnitsMap = {};
                removeClasses();
                $scope.isLoading = true;
                orderPlanService.getOrderPlan(orderPlanId).then(function (orderPlan) {
                    $scope.isLoading = false;
                    $scope.orderPlan = orderPlan;
                    if (orderPlan.status == "Building" || orderPlan.status == "Pick Suggested") {
                        initGroups();
                        if (orderPlan.enableAutoGroupPickStragety) {
                            groupPickStragetyWithSelectFields(orderPlan.groupingFields);
                        }
                        setGroupFlag();
                        if (orderPlan.status == "Pick Suggested") {
                            validateLocationForGroup();
                        }
                    } else {
                        getPickTasks(orderPlan.pickTaskIds);
                        getCCTasks(orderPlan.ccTaskIds);
                        getReplenishmentTasks(orderPlan.replenishmentTaskIds);
                    }
                    $scope.changeTab("pickTask");
                    judgeAllowCreatePickTaskWithoutPickStrategy();
                }, function (error) {
                    $scope.isLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
            
            function groupPickStragetyWithSelectFields(groupFields) {
                _.forEach(groupFields, function (field) {
                    if(field == "itemWeight") {
                        groupForOverPickToOrderWeight();
                    }else {
                        groupItemLineByField(field);
                    }
                });
            }

            function groupForOverPickToOrderWeight() {
                var groups = angular.copy($scope.groups);
                _.forEach(groups, function (group) {
                    group = _.find($scope.groups, { 'name': group.name });
                    group.areTheSameOrder = _.uniq(_.map(group.itemLines, "orderId")).length > 1 ? false : true;
                    if (!group.areTheSameOrder) {
                        var itemLinesGroupByOrderId = _.groupBy(group.itemLines, "orderId");
                        var keys = _.keys(itemLinesGroupByOrderId);
                        var i = 0;
                        _.forEach(itemLinesGroupByOrderId, function (itemLines, orderId) {
                            var itemWeight = _.floor(_.sumBy(itemLinesGroupByOrderId[orderId], 'itemWeight'), 2);
                            if (itemWeight >= $scope.pickToOrderWeight) {
                                i++;
                                if (i < keys.length) {
                                    group.checkedItemLines = _.union(group.checkedItemLines, itemLinesGroupByOrderId[orderId])
                                    createNewGroupWithItemLines(group, angular.copy(group.checkedItemLines));
                                    group.checkedItemLines = [];
                                }
                            }
                        });
                    }
                });
            }

            function groupItemLineByField(field) {
                var groups = angular.copy($scope.groups);
                _.forEach(groups, function (group) {
                    group = _.find($scope.groups, { 'name': group.name });
                    var itemLinesMapWithField = _.groupBy(group.itemLines, field);
                    var keys = _.keys(itemLinesMapWithField);
                    if (keys.length > 1) {
                        var allItemLinesIsVirtual = (keys.indexOf("undefined") > -1 ? false : true);
                        var isFirst = true;
                        _.forIn(itemLinesMapWithField, function (itemLines, key) {
                            if ((!allItemLinesIsVirtual && key != "undefined") || (allItemLinesIsVirtual && !isFirst)) {
                                createNewGroupWithItemLines(group, angular.copy(itemLines));
                            }
                            if (isFirst) {
                                isFirst = false;
                            }
                        });
                    }
                });
            }

            function judgeAllowCreatePickTaskWithoutPickStrategy() {
                var orderIds = $scope.orderPlan.orderIds;
                if (orderIds.length > 0) {
                    orderService.searchOrderWithCustomer({ orderIds: orderIds }).then(function (response) {
                        $scope.allowCreatePickTaskWithoutPickStrategy = false;
                        var customers = _.map(response, 'customer');
                        var results = _.map(customers, function(customer){
                               return customer.allowCreatePickTaskWithoutPickStrategy?customer.allowCreatePickTaskWithoutPickStrategy:false;
                        });
                        if (_.indexOf(results, false) == -1) {
                            $scope.allowCreatePickTaskWithoutPickStrategy = true;
                        }

                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });
                }
            }

            function initGroups() {
                var groups = [];
                var itemLines = $scope.orderPlan.itemLines;
                generateShipToAddressStr(itemLines);
                var itemLines = _.orderBy(itemLines, "shipToAddressStr");
                var group = { name: "GROUP-1", itemLines: itemLines };
                if ($scope.orderPlan.status == 'Pick Suggested'||$scope.orderPlan.status == 'Building') {
                    if ($scope.orderPlan.pickWay) {
                        group.pickWay = $scope.orderPlan.pickWay;
                    }
                    group.checkedItemLines = [];
                    group.sequence = 0;
                    group.subGroups = [];
                }
                groups.push(group);
                $scope.groups = groups;
            }

            function getCCTasks(ccTaskIds) {
                if (ccTaskIds && ccTaskIds.length > 0) {
                    $scope.ccTaskCount = ccTaskIds.length;
                    $scope.ccTaskLoading = true;
                    configurationChangeTaskService.searchTask({ taskIds: ccTaskIds }).then(function (response) {
                        $scope.ccTaskLoading = false;
                        $scope.ccTasks = response;
                    }, function () {
                        $scope.ccTaskLoading = false;
                    });
                } else {
                    $scope.ccTaskCount = 0;
                }
            }

            $scope.changeTab = function (tabLabel) {
                $scope.activetab = tabLabel;
            };

            function organizationGroupItemLines(groups) {
                var itemGroups = [];
                _.forEach(groups, function (group) {
                    var itemLines = group.itemLines;
                    if (itemLines.length == 0) {
                        return;
                    }
                    var itemGroup = { assigneeUserId: group.plannedAssigneeUserId ? group.plannedAssigneeUserId : $scope.orderPlan.assigneeUserId };

                    if (itemLines && itemLines.length > 0 && itemLines[0].pickType) {
                        itemGroup.pickType = itemLines[0].pickType;
                    } else {
                        itemGroup.pickType = $scope.orderPlan.pickType;
                    }
                    itemGroup.pickWay = group.pickWay;
                    itemGroup.isPickToOrder = group.isPickToOrder ? group.isPickToOrder : false;
                    itemGroup.isConveyorPick = group.isConveyorPick ? group.isConveyorPick : false;
                    if (itemGroup.pickWay == "Order Pick") {
                        orderPickGroupByOrderId(angular.copy(itemGroup), itemLines, itemGroups);
                    } else {
                        itemGroup.orderItemLines = itemLines;
                        itemGroups.push(itemGroup);
                    }
                });
                return itemGroups;
            }

            function orderPickGroupByOrderId(defaultGroup, itemLines, groups) {
                var groupByOrderId = _.groupBy(itemLines, "orderId");
                for (var key in groupByOrderId) {
                    var group = angular.copy(defaultGroup);
                    group.orderItemLines = groupByOrderId[key];
                    groups.push(group);
                }
            }

            $scope.editOrderPlan = function (orderPlanId) {
                var status = $scope.orderPlan.status;
                if (status == "Building" || status == "Released") {
                    $state.go('wms.outbound.order-plan.edit', { orderPlanId: orderPlanId });
                }
                // else if(status == "Task Created" || status == "Scheduled" || status == "Released"){
                //     $state.go('wms.outbound.order-plan.automatic.edit-orders', {orderPlanId: orderPlanId });
                // }
            };

            $scope.editPickTask = function (taskId) {
                $mdDialog.show({
                    templateUrl: 'wms/outbound/order-plan/template/editPickTask.html',
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
            }

            $scope.editReplenishmentTask = function (taskId) {
                $mdDialog.show({
                    templateUrl: 'wms/outbound/order-plan/template/editReplenishmentTask.html',
                    locals: {
                        taskId: taskId
                    },
                    controller: editReplenishmentTaskController
                }).then(function (task) {
                    angular.forEach($scope.replenishmentTasks, function (item, key) {
                        if (item.id == task.id) {
                            if (task.plannedAssignee) {
                                item.plannedAssignee = task.plannedAssignee;
                                item.plannedAssigneeUserId = task.plannedAssigneeUserId;
                            }
                            item.priority = task.priority;
                        }
                    });
                }, function () {
                });
            };

            $scope.editCCTask = function (taskId) {
                $mdDialog.show({
                    templateUrl: 'wms/outbound/order-plan/template/editCCTask.html',
                    locals: {
                        taskId: taskId
                    },
                    controller: editCCTaskController
                }).then(function (task) {
                    angular.forEach($scope.ccTasks, function (item, key) {
                        if (item.id == task.id) {
                            if (task.plannedAssignee) {
                                item.plannedAssignee = task.plannedAssignee;
                                item.plannedAssigneeUserId = task.plannedAssigneeUserId;
                            }
                            item.priority = task.priority;
                        }
                    });
                }, function () {
                });
            };

            function checkOrderPickType() {
                    _.forEach($scope.orderPlan.itemLines, function (itemline) {
                        if (!itemline.pickType) {
                            if (!$scope.orderPlan.pickType) {
                                lincUtil.messagePopup("Message", "Select a Pick Type before you Create Order Plan.");
                                throw new Error("Select a Pick Type before you Create Order Plan.");
                            } else {
                                itemline.pickType = $scope.orderPlan.pickType;
                            }
                        }
                    });
            }

            function validateLocationForGroup() {
                var validate = true;
                var emptyLocationItemlines = [];
                _.forEach($scope.groups, function (group) {
                    if (group.itemLines && group.itemLines.length > 0) {
                        _.forEach(group.itemLines, function (itemLine) {
                            if(!itemLine.locationName){
                                var errorMessage = { 'name': group.name };
                                errorMessage.orderId = itemLine.orderId;
                                var desc = itemLine.shortDescription? itemLine.shortDescription : itemLine.itemSpecDesc
                                errorMessage.itemSpecName = itemLine.itemSpecName + '(' + desc + ')';
                                errorMessage.lpId = itemLine.lpId;
                                if (itemLine.locationId) {
                                    errorMessage.additionalNote = "Can not find location from Database for the location Id: " + itemLine.locationId ;
                                }
                                emptyLocationItemlines.push(errorMessage);
                            }
                        });

                    }
                });

                if (emptyLocationItemlines.length > 0) {
                    validate = false;
                    $mdDialog.show({
                        templateUrl: 'wms/outbound/order-plan/template/popEmptyLocationTip.html',
                        locals: {
                            emptyLocationItemlines: emptyLocationItemlines
                        },
                        autoWrap: true,
                        controller: locationTipDialogController
                    }).then(function () { }, function () { });
                }
                return validate;
            }

            $scope.createTask = function (orderPlanId) {
                checkOrderPlanAndCreatTask(orderPlanId, false);
            };

            $scope.createTaskWithoutPickStrategy = function (orderPlanId) {
                checkOrderPlanAndCreatTask(orderPlanId, true);
            };

            function checkOrderPlanAndCreatTask(orderPlanId, isCreateTaskWithoutPickStrategy ) {
                checkOrderPickType();
                $scope.createTaskLoading = true;
                orderPlanService.checkOrderPlan(orderPlanId).then(function (res) {
                    createTaskByOrderPlan(orderPlanId, isCreateTaskWithoutPickStrategy )
                }, function (error) {
                    $scope.createTaskLoading = false;
                    lincUtil.errorPopup('Error! ' + error.data.error);
                });

            }

            function createTaskByOrderPlan(orderPlanId, isCreateTaskWithoutPickStrategy ) {
                $scope.createTaskLoading = true;
                var groupItemLines = organizationGroupItemLines($scope.groups);
                removeLocationGroupTypeIfEmpty(groupItemLines);
                if (isCreateTaskWithoutPickStrategy ) {
                    createTaskDirectly(orderPlanId, groupItemLines);
                } else {
                    createTaskFromPickStrategy(orderPlanId, groupItemLines);
                }

            }

            function createTaskFromPickStrategy(orderPlanId, groupItemLines) {
                orderPlanService.createTask(orderPlanId, groupItemLines).then(function () {
                    $scope.createTaskLoading = false;
                    lincUtil.messagePopup("Message", "Create Task Successful.", function () {
                        getOrderPlan($stateParams.orderPlanId);
                    });
                }, function (error) {
                    $scope.createTaskLoading = false;
                    lincUtil.errorPopup('Error! ' + error.data.error);
                });
            }

            function createTaskDirectly(orderPlanId, groupItemLines) {
                orderPlanService.createTaskDirectly(orderPlanId, groupItemLines).then(function () {
                    $scope.createTaskLoading = false;
                    lincUtil.messagePopup("Message", "Create Task Successful.", function () {
                        getOrderPlan($stateParams.orderPlanId);
                    });
                }, function (error) {
                    $scope.createTaskLoading = false;
                    lincUtil.errorPopup('Error! ' + error.data.error);
                });
            }

            function removeLocationGroupTypeIfEmpty(groupItemLines) {
                _.forEach(groupItemLines, function (groupItemLine) {
                    _.forEach(groupItemLine.orderItemLines, function (itemline) {
                        if (!itemline.locationGroupType) {
                            delete itemline.locationGroupType;
                        }
                    })
                });
            }

            $scope.pickStrategies = function (orderPlanId) {
                $scope.createPickStrategyLoading = true;
                orderPlanService.pickStrategies(orderPlanId).then(function () {
                    $scope.createPickStrategyLoading = false;
                    lincUtil.messagePopup("Message", "Create pick strategy successful.", function () {
                        getOrderPlan($stateParams.orderPlanId);
                    });
                }, function (error) {
                    $scope.createPickStrategyLoading = false;
                    if (error.status && error.status == 400 || error.status == 500) {
                        lincUtil.errorPopup("Create pick strategy failed!" + error.data.error + "\r\n" + " Please try again");
                    } else {
                        lincUtil.errorPopup('Error! ' + error.data.error);
                    }
                });
            };

            $scope.release = function (orderPlanId) {
                $scope.releaseLoading = true;
                orderPlanService.release(orderPlanId).then(function () {
                    $scope.releaseLoading = false;
                    lincUtil.messagePopup("Message", "Release Successful.", function () {
                        getOrderPlan($stateParams.orderPlanId);
                    });
                }, function (error) {
                    $scope.releaseLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            };

            $scope.rollback = function (orderPlanId) {
                $scope.rollbackLoading = true;
                orderPlanService.rollback(orderPlanId).then(function () {
                    $scope.rollbackLoading = false;
                    lincUtil.messagePopup("Message", "Rollback to building Successful.", function () {
                        getOrderPlan($stateParams.orderPlanId);
                    });
                }, function (error) {
                    $scope.rollbackLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            };

            $scope.schedule = function (orderPlanId) {
       
                $mdDialog.show({
                    templateUrl: 'wms/outbound/order-plan/template/editScheduleInfo.html',
                    controller: editScheduleInfoController
                }).then(function (scheduleInfo) {
                    orderPlanService.schedule(orderPlanId, scheduleInfo).then(function () {
                        lincUtil.messagePopup("Message", "Schedule Successful.", function () {
                            getOrderPlan($stateParams.orderPlanId);
                        });
                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });
                }, function () {
                });
            };

            $scope.getPickTypes = function () {
                return lincResourceFactory.getPickTypes().then(function (response) {
                    $scope.pickTypes = response;
                });
            };

            $scope.getPickWays = function () {

                $scope.pickWays = ["Order Pick", "Batch Order Pick"];

            };

            $scope.toggleAll = function (group) {
                if (!$scope.selectAllIsChecked(group)) {
                    group.checkedItemLines = []
                    _.forEach(group.itemLines, function (itemLine) {
                        group.checkedItemLines.push(itemLine);
                    });
                } else {
                    group.checkedItemLines = []
                }
                setSummary(group);
            };

            $scope.selectAllIsChecked = function (group) {
                var checkedItemLines = group.checkedItemLines;
                if (!checkedItemLines || checkedItemLines.length == 0) return false;
                if (checkedItemLines.length === group.itemLines.length) {
                    return true;
                } else {
                    return false;
                }
            };

            $scope.isChecked = function (group, itemLine) {
                var checkedItemLines = group.checkedItemLines;
                var index = _.findIndex(checkedItemLines, function (checkedItemLine) {
                    return itemLineIsSame(checkedItemLine, itemLine);
                });

                return index > -1;
            };

            function setSummary(group) {
                if (group.checkedItemLines.length == 0) {
                    delete $scope.summaryUnitsMap[group.name];
                } else {
                    var itemLinesByUnitMap = _.groupBy(group.itemLines, "unitName");
                    var checkedItemLinesByUnitMap = _.groupBy(group.checkedItemLines, "unitName");
                    var summaryUnits = { selected: [], remaining: [] };
                    for (var key in itemLinesByUnitMap) {
                        var selectedQty = _.sumBy(checkedItemLinesByUnitMap[key], 'qty');
                        var totalQty = _.sumBy(itemLinesByUnitMap[key], 'qty');
                        summaryUnits.selected.push({ key: "Sum(" + key + ")", value: selectedQty });
                        summaryUnits.remaining.push({ key: "Sum(" + key + ")", value: totalQty - selectedQty });
                    }
                    summaryUnits.selected.push({
                        key: "Sum(ItemLine)",
                        value: group.checkedItemLines.length
                    });
                    summaryUnits.remaining.push({
                        key: "Sum(ItemLine)",
                        value: group.itemLines.length - group.checkedItemLines.length
                    });
                    $scope.summaryUnitsMap[group.name] = summaryUnits;
                }
            }


            $scope.toggle = function (group, itemLine, event) {
                if (trElements)
                    trElements.removeClass("border-color");
                var selectElement = angular.element(event.target).parent().parent();
                selectElement.addClass("border-color")
                var index;
                var checkedItemLines = group.checkedItemLines;
                if (checkedItemLines.length == 0) {
                    index = -1;
                } else {
                    index = _.findIndex(checkedItemLines, function (checkedItemLine) {
                        return itemLineIsSame(checkedItemLine, itemLine);
                    });
                }
                if (index > -1) {
                    checkedItemLines.splice(index, 1);
                } else {
                    checkedItemLines.push(itemLine);
                }
                event.stopPropagation();
                setSummary(group);
            };


            var orginIndex, finalyShiftNum, orginGroupIndex = -1;
            var trElements;
            $scope.checkWithShift = function (event, index, group, groupIndex, status) {
                if (status != 'Pick Suggested') return;

                if (event.shiftKey && index > -1 && orginGroupIndex === groupIndex) {
                    finalyShiftNum = index;
                    if (orginIndex > -1) {
                        var maxIndex = _.max([finalyShiftNum, orginIndex]);
                        var minIndex = _.min([finalyShiftNum, orginIndex]);
                        removeClasses();
                        for (var i = minIndex; i < maxIndex + 1; i++) {
                            trElements.eq(i).addClass('border-lr-color');
                            group.checkedItemLines.push(group.itemLines[i]);
                        }
                        trElements.eq(minIndex).addClass('border-top-color');
                        trElements.eq(maxIndex).addClass('border-botton-color');
                        group.checkedItemLines = _.uniq(group.checkedItemLines);
                        setSummary(group);
                    }
                } else {
                    removeClasses();
                    var tagName = angular.element(event.target).parent().parent().get(0).tagName;
                    if (tagName === 'TBODY') {
                        trElements = angular.element(event.target).parent().parent().find('tr');
                    }
                    else {
                        trElements = angular.element(event.target).parent().parent().parent().find('tr');
                    }

                    trElements.eq(index).addClass("border-color")
                    orginGroupIndex = groupIndex;
                    orginIndex = index;

                }
                event.stopPropagation();

            };

            function removeClasses() {
                if (trElements) {
                    trElements.removeClass("border-color");
                    trElements.removeClass("border-lr-color");
                    trElements.removeClass("border-botton-color");
                    trElements.removeClass("border-top-color");
                }
            }

            $scope.assingItemLinesToGroup = function (parentGroup, subGroup) {
                removeClasses();
                // var checkedItemLines = parentGroup.checkedItemLines;
                if (!verifyIfHasCheckedItemLines(parentGroup.checkedItemLines)) {
                    lincUtil.messagePopup("Tip", "Please checked at least one item to move");
                    return;
                }

                subGroup.itemLines = _.unionWith(subGroup.itemLines, parentGroup.checkedItemLines);
                removeItemLinesFromGroup(parentGroup, parentGroup.checkedItemLines);
                parentGroup.checkedItemLines = [];
                setSummary(parentGroup);
                setGroupFlag();
            };

            $scope.createGroup = function (parentGroup) {
                removeClasses();
                var checkedItemLines = parentGroup.checkedItemLines;
                _.forEach(checkedItemLines, function (itemLine) {
                    itemLine.isChecked = false;
                });

                if (!verifyIfHasCheckedItemLines(checkedItemLines)) {
                    lincUtil.messagePopup("Tip", "Please checked at least one item to the new group");
                    return;
                }

                createNewGroupWithItemLines(parentGroup, angular.copy(parentGroup.checkedItemLines));
                parentGroup.checkedItemLines = [];
                setSummary(parentGroup);
                setGroupFlag();
            };

            function setGroupFlag() {
                _.forEach($scope.groups, function (group) {
                    group = calculateItemWeight(group);
                    group = setIsConveyorPickFlag(group);
                });

            }

            function setIsConveyorPickFlag(group) {
                 var itemlines = group.itemLines;
                 if(itemlines && itemlines.length > 0) {
                     var hasConveyorVirtualLocation =  _.findIndex(itemlines, function(itemline){
                         if(itemline.virturalLocationGroupName) {
                             return itemline.virturalLocationGroupName.toLowerCase().indexOf("conveyor") > -1
                         } else {
                             return false;
                         }
                     }) > -1
                     if(hasConveyorVirtualLocation) {
                         group.isConveyorPick = true;
                     }
                 }
            }

            function calculateItemWeight(group) {
                var itemLines = group.itemLines;
                if (itemLines.length && itemLines.length > 0) {
                    group.areTheSameOrder = _.uniq(_.map(itemLines, "orderId")).length > 1 ? false : true;
                    group.itemWeight = _.floor(_.sumBy(itemLines, 'itemWeight'), 2);
                    if (group.itemWeight >= $scope.pickToOrderWeight && group.areTheSameOrder) {
                        group.isPickToOrder = true;
                        group.pickToOrderIsDisabled = false;
                    } else if (group.areTheSameOrder) {
                        group.pickToOrderIsDisabled = false;
                    }
                    else {
                        group.isPickToOrder = false;
                        group.pickToOrderIsDisabled = true;
                    }
                }
                return group;
            }

            function createNewGroupWithItemLines(group, itemLines) {
                var parentGroup;
                var pickWay = group.pickWay;
                if (group.parentGroup) {
                    parentGroup = group.parentGroup;
                } else {
                    parentGroup = group;
                }
                parentGroup.sequence++;
                var newSubGroupName = parentGroup.name + "-" + parentGroup.sequence;
                var subGroup = {
                    name: newSubGroupName, itemLines: itemLines,
                    pickWay: pickWay, parentGroup: parentGroup,
                    checkedItemLines: [], sequence: 0, subGroups: []
                };
                var index = _.findIndex($scope.groups, function (group) {
                    return group.name == parentGroup.name;
                });
                parentGroup.subGroups.push(subGroup);
                $scope.groups.splice(index + 1, 0, subGroup);
                $scope.groups = _.sortBy($scope.groups, function (group) {
                    var name = group.name.split('-');
                    if (name.length > 2) {
                        return name[1] * 10000 + Number(name[2]);
                    }
                    else {
                        return name[1] * 10000;
                    }
                });
                removeItemLinesFromGroup(group, itemLines);

            }

            $scope.deleteItemLine = function (group, itemLine) {
                _.remove(group.itemLines, function (itemLine1) {
                    return itemLineIsSame(itemLine, itemLine1);
                });

                _.remove(group.checkedItemLines, function (itemLine1) {
                    return itemLineIsSame(itemLine, itemLine1);
                });
                group.parentGroup.itemLines.push(itemLine);
                setSummary(group);
                setGroupFlag();
            };

            $scope.deleteSubGroup = function (group) {
                lincUtil.confirmPopup("Remove Group Confirmation",
                    "Will remove this new group, all the items will return to the original group, go ahead?", function () {
                        removeAllItemLineCheckBox(group);

                        var parentGroup = group.parentGroup;
                        parentGroup.itemLines = _.unionWith(group.itemLines, parentGroup.itemLines);

                        group.itemLines = group.checkedItemLines = [];
                        removeGroup($scope.groups, group);
                        removeGroup(group.parentGroup.subGroups, group);
                        // removeCheckedItemLinesFromGroup(parentGroup);
                        setSummary(group);
                        setSummary(parentGroup);
                        setGroupFlag();

                    });
            };

            function removeGroup(groups, removeGroup) {
                _.remove(groups, function (group) {
                    return group.name == removeGroup.name;
                });
            }

            function removeAllItemLineCheckBox(group) {
                _.forEach(group.itemLines, function (itemLine) {
                    itemLine.isChecked = false;
                });
            }

            function removeItemLinesFromGroup(group, itemLines) {
                var diffItemLines = _.differenceWith(group.itemLines, itemLines, _.isEqual);
                group.itemLines = diffItemLines;

                if (group.itemLines.length == 0) {
                    group.itemWeight = 0;
                }
            }

            function verifyIfHasCheckedItemLines(checkedItemLines) {
                if (!checkedItemLines || checkedItemLines.length == 0) {
                    return false;
                } else {
                    return true;
                }
            }

            function itemLineIsSame(itemLine1, itemLine2) {
                return itemLine1.itemSpecId === itemLine2.itemSpecId
                    && itemLine1.locationId == itemLine2.locationId
                    && itemLine1.lpId == itemLine2.lpId
                    && itemLine1.orderId == itemLine2.orderId;
            }

            function generateShipToAddressStr(orders) {
                angular.forEach(orders, function (order) {
                    order.shipToAddressStr = addressService.generageAddressData(order.shipToAddress, null);
                });
            }

            function initSorts() {
                $scope.sorts = {};
                for (var i = 0; i < 1000; i++) {
                    $scope.sorts["orderId" + i] = SORT_DEFAULT;
                    $scope.sorts["titleId" + i] = SORT_DEFAULT;
                    $scope.sorts["carrierId" + i] = SORT_DEFAULT;
                    $scope.sorts["shipToAddress.name" + i] = SORT_DEFAULT;
                    $scope.sorts["itemSpecName" + i] = SORT_DEFAULT;
                    $scope.sorts["topNum" + i] = SORT_DEFAULT;
                    $scope.sorts["itemSpecName" + i] = SORT_DEFAULT;
                    $scope.sorts["locationName" + i] = SORT_DEFAULT;
                    $scope.sorts["pickStrategyWeight" + i] = SORT_DEFAULT;
                    $scope.sorts["virturalLocationGroupName" + i] = SORT_DEFAULT;
                }
                //$scope.sorts = { orderId: SORT_DEFAULT, topNum: SORT_DEFAULT, itemSpecName: SORT_DEFAULT, locationName: SORT_DEFAULT, pickStrategyWeight: SORT_DEFAULT };

                $scope.sortsClass = {
                    default: 'order-sorting',
                    asc: 'order-sorting order-sorting-asc',
                    desc: 'order-sorting order-sorting-desc'
                };
            }

            $scope.sortClick = function (field, sortIndex) {
                var sort = $scope.sorts[field + sortIndex];
                if (!sort) {
                    sort = SORT_DEFAULT;
                }
                switch (sort) {
                    case SORT_DEFAULT:
                        //initSorts();
                        $scope.sorts[field + sortIndex] = SORT_ASC;
                        orderBy(field, "asc", sortIndex);
                        break;
                    case SORT_ASC:
                        $scope.sorts[field + sortIndex] = SORT_DESC;
                        orderBy(field, "desc", sortIndex);
                        break;
                    case SORT_DESC:
                        $scope.sorts[field + sortIndex] = SORT_ASC;
                        orderBy(field, "asc", sortIndex);
                        break;
                }
            };
            function orderBy(field, sort, sortIndex) {
                var group;
                if (!_.isUndefined(sortIndex) && $scope.groups[sortIndex].itemLines.length > 0) {
                    group = $scope.groups[sortIndex];
                    $scope.groups[sortIndex].itemLines = _.orderBy(group.itemLines, [field], [sort]);
                } else {
                    for (var i in $scope.groups) {
                        group = $scope.groups[i];
                        $scope.groups[i].itemLines = _.orderBy(group.itemLines, [field], [sort]);
                    }
                }
            }

            $scope.bgHighLight = function (itemLine) {
                var tipLight = '';
                if (itemLine.topNum) {
                    if (itemLine.pickType === 'Piece Pick') {
                        tipLight = 'peice-light';

                    } else {
                        tipLight = 'case-light';
                    }
                }
                return tipLight;
            };

            $scope.batchPrePrintShippingLabel = function() {
                if(selectedPickTasks){
                    var  taskIds = _.map(selectedPickTasks,'id');
                    var orderIds =_.flattenDeep(_.map(selectedPickTasks,'orderIds'));
                    $mdDialog.show({
                        templateUrl: 'wms/task/pick-task/template/setUpBatchPickTaskPrint.html',
                        locals: {
                            taskIds: taskIds,
                            orderIds: orderIds
                        },
                        autoWrap: true,
                        controller: setUpBatchPickTaskController
                    }).then(function () { }, function () { });
                }
                else{
                    lincUtil.errorPopup('Please select task first!');
                }

            };

            $scope.viewTrackNo = function() {
                if(selectedPickTasks){
                    var orderIds =_.flattenDeep(_.map(selectedPickTasks,'orderIds'));
                    $mdDialog.show({
                        templateUrl: 'wms/outbound/order-plan/template/trackingNoView.html',
                        locals: {
                            orderIds: orderIds
                        },
                        autoWrap: true,
                        controller: trackingNoViewController
                    }).then(function () { }, function () { });
                }
                else{
                    lincUtil.errorPopup('Please select task first!');
                }

            };

            $scope.popUpBatchPrintDialog = function() {
            if(selectedPickTasks){
                var orderIds =_.flattenDeep(_.map(selectedPickTasks,'orderIds'));
                $mdDialog.show({
                    templateUrl: 'print-pages/template/batchLabelPrintForOrdersAndTaskController.html',
                    locals: {
                        pickTasks: selectedPickTasks,
                        orderIds: orderIds
                    },
                    autoWrap: true,
                    controller: batchLabelPrintForOrdersAndTaskController
                }).then(function () { }, function () { });
            }
                else{
                    lincUtil.errorPopup('Please select task first!');
                }
            }
             
            var  selectedPickTasks = [];
            $scope.checkedAllStatus =true;
            function initCheckedWithAllPickTasks(pickTasks) {
                selectedPickTasks = _.cloneDeep($scope.pickTasks);
            }
            
            $scope.onClickSelectAllTask = function() {
                $scope.checkedAllStatus = ! $scope.checkedAllStatus;
                if( $scope.checkedAllStatus ){
                    selectedPickTasks = _.cloneDeep($scope.pickTasks);
                }else{
                    selectedPickTasks =[];
                }
            };

            $scope.onClickTask =function(task){
                if( _.find(selectedPickTasks, {'id':task.id})) {
                    selectedPickTasks = _.differenceBy(selectedPickTasks,[{id:task.id}] ,'id');
                }else{
                    selectedPickTasks.push(task);  
                }
                if((selectedPickTasks.length===$scope.pickTasks.length)){
                    $scope.checkedAllStatus = true;
                }else{
                    $scope.checkedAllStatus =false;
                }
            };

            $scope.isCheckedTask = function(taskId) {
                if(_.find(selectedPickTasks, {'id':taskId})) {
                    return true;
                }    
                return false;
            };
        };
        controller.$inject = ['$scope', '$state', '$stateParams', 'orderPlanService', 'orderService',
            'pickService', 'configurationChangeTaskService',
            'replenishmentTaskService', '$mdDialog', 'lincUtil', 'lincResourceFactory', 'addressService', 'facilityService', 'session'];

        return controller;
    });

