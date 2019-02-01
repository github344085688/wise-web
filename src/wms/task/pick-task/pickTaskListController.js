'use strict';

define(['angular',
    'lodash'], function (angular, _) {
        var controller = function ($scope, pickService, generalTaskService, lincUtil, $state, lincResourceFactory) {
            $scope.pageObj = {pageSize: 10, currentPage: 1};

            $scope.editTask = function (task) {
                $state.go('wms.task.pickTask.edit', {
                    taskId: task.id
                });
            };

          $scope.assignmentTags=['AUTO ASSIGNMENT','MANUAL ASSIGNMENT'];

            $scope.pickTaskSearch = {};
            $scope.separateTask = function (task) {
                if (task.pickWay.indexOf("By Order") > -1) {
                    $state.go('wms.task.pickTask.by-order-separate', {
                        taskId: task.id
                    });
                } else {
                    $state.go('wms.task.pickTask.by-item-separate', {
                        taskId: task.id
                    });
                }
            };

            $scope.mergeTask = function (task) {
                $state.go('wms.task.pickTask.merge', { taskId: task.id });
            };

            function _init() {
                $scope.loading = true;
                $scope.searchCompleted = false;
                $scope.loadContent(1);
            }

            $scope.search = function () {
                $scope.loadContent(1);
            };

            function getSearchInfo() {
                var searchParam = angular.copy($scope.pickTaskSearch);
                if (searchParam.orderIds && searchParam.orderIds.length === 0) searchParam.orderIds = null;
                if (searchParam.taskIds && searchParam.taskIds.length === 0) searchParam.taskIds = null;
                if (searchParam.orderIds) {
                    var orderIds = [];
                    _.forEach(searchParam.orderIds, function (orderId) {
                        if (orderId && orderId.indexOf('DN') < 0) {
                            orderId = 'DN-' + orderId;
                        }
                        orderIds.push(orderId);
                    });
                    searchParam.orderIds = orderIds;
                }

                if (searchParam.taskIds) {
                    var taskIds = [];
                    _.forEach(searchParam.taskIds, function (taskId) {
                        if (taskId && taskId.indexOf('TASK') < 0) {
                            taskId = 'TASK-' + taskId;
                        }
                        taskIds.push(taskId);
                    });
                    searchParam.taskIds=taskIds;
                }
                searchParam.longHaulIds = _.map(searchParam.longHaul, "id");
                return searchParam;
            }

            $scope.keyUpSearch = function ($event) {
                if(!$event){
                    return;
                }
                if ($event.keyCode === 13) {
                    $scope.loadContent(1);
                }
                $event.preventDefault();
            };

            $scope.loadContent = function (currentPage) {
                var param = getSearchInfo();
                $scope.pageObj.currentPage = currentPage;
                param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize) };
                param.sortingOrder = -1;
                param.sortingFields = ["createdWhen"];
                $scope.searchCompleted = false;
                $scope.loading = true;
                pickService.searchTasksByPaging(param).then(function(response) {
                    $scope.searchCompleted = true;
                    $scope.loading = false;
                    $scope.searching = false;
                    $scope.selectedTaskIds = [];
                    $scope.isCheckAll = false;
                    $scope.tasks = response.result.tasks;
                    $scope.paging = response.result.paging;
                    $scope.userMap = response.userMap;
                    $scope.locationMap = response.locationMap;
                    $scope.itemSpecMap = response.itemSpecMap;
                    $scope.itemUnitMap = response.itemUnitMap;
                    $scope.organizationMap = response.organizationMap;
                    calProgress($scope.tasks);
                }, function() {
                    $scope.searchCompleted = true;
                    $scope.loading = false;
                    lincUtil.errorPopup("Error happend when searching.");
                });
            };
            
            function calProgress(tasks) {
                _.forEach(tasks, function (task) {
                    if (task.status !== "In Progress") return;
                    if (!task.pickHistories || task.pickHistories.length === 0 || !task.pickItemLines || task.pickItemLines.length === 0) {
                        task.progress = 0;
                        return;
                    }
                    var historMap = _.groupBy(task.pickHistories, "itemSpecId");
                    var lineMap = _.groupBy(task.pickItemLines, "itemSpecId");
                    task.progress = 0;
                    var itemCount = 0;
                    _.forEach(lineMap, function (lines, itemSpecId) {
                        itemCount++;
                        if (!lines || lines.length === 0) return;
                        var histories = historMap[itemSpecId];
                        if (!histories) return;
                        var lineQty = _.sumBy(_.filter(lines, function (line) {
                            return line.baseQty !== null;
                        }), "baseQty");
                        var historyQty = _.sumBy(_.filter(histories, function (history) {
                            return history.pickedBaseQty !== null;
                        }), "pickedBaseQty");
                        if (lineQty === 0) return;
                        var progress = historyQty * 1.0 / lineQty;
                        if (progress > 1) progress = 1;
                        task.progress += progress;
                    })

                    task.progress = parseFloat((task.progress * 100 / itemCount).toFixed(1));
                    if (task.progress > 100) task.progress = 100;
                })
            }

            $scope.getPickTypes = function() {
                return lincResourceFactory.getPickTypes().then(function(response) {
                    $scope.pickTypes = response;
                });
            };

            $scope.selectedTaskIds = [];
            $scope.isCheckAll = false;
            $scope.checkAll = function () {
                $scope.selectedTaskIds = [];
                if (!$scope.isCheckAll) {
                    _.forEach($scope.tasks, function (task) {
                        if (task.status === 'New' || task.status === 'In Progress') {
                            $scope.selectedTaskIds.push(task.id);
                        }
                    })
                }
                $scope.isCheckAll = !$scope.isCheckAll;
                if ($scope.isCheckAll && $scope.selectedTaskIds.length === 0) {
                    lincUtil.messagePopup("Tip", "All tasks status are not New or In Progress!");
                    $scope.isCheckAll = false;
                }
            };
            $scope.isChecked = function (taskId) {
                return _.includes($scope.selectedTaskIds, taskId);
            };
            $scope.checkTask = function (taskId) {
                $scope.selectedTaskIds.push(taskId);
            };

            $scope.batchAssign = function () {
                if ($scope.assigning) return;

                if ($scope.selectedTaskIds.length === 0) {
                    lincUtil.messagePopup("Tip", "Please select task first!");
                    return;
                }
                if (!$scope.batchAssigneeUserId) {
                    lincUtil.messagePopup("Tip", "Please select batch assignee user!");
                    return;
                }

                var param = {};
                param.taskIds = $scope.selectedTaskIds;
                param.includesTaskSteps = true;
                param.assigneeUserId = $scope.batchAssigneeUserId;

                $scope.assigning = true;
                generalTaskService.batchAssignTask(param).then(function(response) {
                    $scope.assigning = false;

                    $scope.selectedTaskIds = [];
                    $scope.isCheckAll = false;

                    $scope.search();
                    lincUtil.saveSuccessfulPopup();

                }, function (error) {
                    $scope.assigning = false;

                    lincUtil.errorPopup(error);
                });
            };

            $scope.getPickWays = function() {
                return lincResourceFactory.getPickWays().then(function(response) {
                    $scope.pickWays = response;
                });
            };

       
            _init();
        };
        controller.$inject = ['$scope', 'pickService', 'generalTaskService', 'lincUtil', '$state', 'lincResourceFactory'];

        return controller;
    });
