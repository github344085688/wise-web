'use strict';

define(['angular', 'lodash'
], function(angular, _) {
    var controller = function($scope, $state,  configurationChangeTaskService, lincUtil) {
        var taskList = [];
        var checkedGroupTaskIds = {};
        $scope.pageSize = 10;
        $scope.search = {};
        $scope.groupByOptions = [
            {label: "Item", name: "itemSpecId"},
            {label: "UPC", name: "item.upcCode"},
            {label: "NMFC", name: "item.nmfc"},
            {label: "Material Package Item", name: "materialPackageItem.id"}
        ];

        $scope.onSelectGroupBy = function (groupByName) {
            $scope.groupTasks = _.groupBy(taskList, groupByName);
            initSetCheckedGroupTaskIds($scope.groupTasks);
        };

        $scope.searchTask = function () {
            var param = angular.copy($scope.search);
            searchTask(param);
        };
        
        function initSetCheckedGroupTaskIds(groupTasks) {
            checkedGroupTaskIds = [];
            _.forEach(groupTasks, function (value, key) {
                checkedGroupTaskIds[key] = [];
            });
        }
        
        function searchTask(param) {
            $scope.loading = true;
            param.status = "New";
            configurationChangeTaskService.searchTaskForGroup(param).then(function (response) {
                $scope.loading = false;
                $scope.groupTasks = {"": response};

                taskList = response;
                initSetCheckedGroupTaskIds($scope.groupTasks);
            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup(error.data.error);
            });
        }

        $scope.clickGroup = function (groupKey) {
            var tasks = $scope.groupTasks[groupKey];
            if (!tasks) return;
            if ($scope.isGroupChecked(groupKey)) {
                checkedGroupTaskIds[groupKey] = [];
            } else {
                checkedGroupTaskIds[groupKey] = _.map(tasks, "id");
            }
        };

        $scope.isGroupChecked = function (groupKey) {
            var tasks = $scope.groupTasks[groupKey];
            if (!tasks) return;
            if (!checkedGroupTaskIds[groupKey] || checkedGroupTaskIds[groupKey].length == 0) return false;
            if (checkedGroupTaskIds[groupKey].length === tasks.length) {
                return true;
            } else {
                return false;
            }
        };

        $scope.isChecked = function (taskId, groupKey) {
            var index = _.indexOf(checkedGroupTaskIds[groupKey], taskId);
            return index > -1;
        };

        $scope.clickItem = function (taskId, groupKey) {
            var index = _.indexOf(checkedGroupTaskIds[groupKey], taskId);
            if (index > -1) {
                checkedGroupTaskIds[groupKey].splice(index, 1);
            } else {
                if(!checkedGroupTaskIds[groupKey]) {
                    checkedGroupTaskIds[groupKey] = [];
                }
                checkedGroupTaskIds[groupKey].push(taskId);
            }
        };
        
        $scope.submitGroup = function () {
            var taskIds = _.flattenDeep(_.values(checkedGroupTaskIds));
            if (taskIds.length < 2) {
                lincUtil.messagePopup("Tip", "Please choose two tasks to merge at least.");
                return;
            }
            var mainTaskId = taskIds.shift();
            $scope.isMerging = true;
            configurationChangeTaskService.mergeTask(mainTaskId, {taskIds: taskIds}).then(function (response) {
                $scope.isMerging = false;
                lincUtil.messagePopup("Message", "Merge Successful!", function () {
                    $state.go('wms.task.configurationChangeTask.view', {
                        taskId: mainTaskId
                    });
                });
            }, function (error) {
                $scope.isMerging = false;
                lincUtil.errorPopup(error.data.error);
            });
        };

        function _init() {
            searchTask({});
        }

        _init();
    };

    controller.$inject = ['$scope', '$state', 'configurationChangeTaskService', 'lincUtil'];
    return controller;
});
