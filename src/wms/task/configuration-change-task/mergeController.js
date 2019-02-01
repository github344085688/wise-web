'use strict';

define(['angular', 'lodash'
], function(angular, _) {
    var controller = function($scope, $state, $stateParams, configurationChangeTaskService, lincUtil) {
        var checkedTasks;
        $scope.pageSize = 10;
        $scope.searchTask = function () {
            var searchParam = angular.copy($scope.search);
            searchTask(searchParam);
        };

        function searchTask(param) {
            param.status = "New";
            param.itemSpecId = $scope.currentTask.itemSpecId;
            param.productId = $scope.currentTask.productId;
            param.unitId = $scope.currentTask.unitId;

            param.singleLPTemplateId = $scope.currentTask.singleLPTemplateId;
            param.packagingTypeSpecId = $scope.currentTask.packagingTypeSpecId;
            param.packagingTypeProductId = $scope.currentTask.packagingTypeProductId;
            $scope.searchLoading = true;
            configurationChangeTaskService.searchTask(param).then(function (response) {
                $scope.searchLoading = false;
                $scope.taskList = response;
                filterOutCurrentTaskFromList($scope.taskList, $scope.currentTask);
                $scope.loadContent(1);
                checkedTasks = [];
            }, function (error) {
                $scope.searchLoading = false;
                lincUtil.errorPopup(error.data.error);
            });
        }

        function filterOutCurrentTaskFromList(taskList, currentTask) {
            var index = _.findIndex(taskList, function (task) {
                return task.id === currentTask.id;
            });
            if(index > -1) {
                taskList.splice(index, 1);
            }
        }

        $scope.mergeTasks = function () {
            if (checkedTasks.length == 0) {
                lincUtil.messagePopup("Tip", "Please choose some tasks to merge.");
                return;
            }
            var taskIds = _.map(checkedTasks, "id");
            $scope.isLoading = true;
            configurationChangeTaskService.mergeTask($scope.currentTask.id, {taskIds: taskIds}).then(function (response) {
                $scope.isLoading = false;
                lincUtil.messagePopup("Message", "Merge Successful!", function () {
                    $state.go('wms.task.configurationChangeTask.view', {
                        taskId: $scope.currentTask.id
                    });
                });
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.errorPopup(error.data.error);
            });
        };

        $scope.loadContent = function (currentPage) {
            $scope.taskViewList = $scope.taskList.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.taskList.length ? $scope.taskList.length : currentPage * $scope.pageSize);
        };

        $scope.isChecked = function(order) {
            return _.find(checkedTasks, function (checkedOrder) {
                return checkedOrder.id == order.id;
            });
        };

        $scope.toggle = function(order) {
            var index = _.findIndex(checkedTasks, function(checkedOrder) {
                return checkedOrder.id === order.id;
            });
            if (index > -1) {
                checkedTasks.splice(index, 1);
            } else {
                checkedTasks.push(order);
            }
        };

        $scope.cancel = function () {
            $state.go("wms.task.configurationChangeTask.view", {taskId: $scope.currentTask.id});
        };
        
        function _init() {
            $scope.isReady = false;
            configurationChangeTaskService.getTaskById($stateParams.taskId).then(function(task){
                $scope.currentTask = angular.copy(task);
                $scope.isReady = true;
                searchTask({});
            });
        }

        _init();
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'configurationChangeTaskService', 'lincUtil'];
    return controller;
});
