
'use strict';

define(['lodash', 'angular'], function(_, angular) {
    var ctrl = function($scope, $state, $stateParams, configurationChangeTaskService, lincUtil) {

        $scope.addSeparateTask = function()
        {
            $scope.showWarnning = false;
            if(judgeAllItemQtyIsAssigned($scope.currentTask.remain_qty)) {
                lincUtil.messagePopup("Tip", "All Item Qty Be assigned! ");
                return;
            }
            $scope.separateTasks.push({itemSpecQty: 0});
            $scope.qtyIsNotEffect.push(true);
        }

        $scope.updateRemainQtyAndCheckIsValidQty = function()
        {
            var currentTask = $scope.currentTask;
            var assginTotalQty = 0;
            angular.forEach($scope.separateTasks, function (separateTask, taskIndex) {
                if(separateTask.itemSpecQty <= 0) {
                    $scope.qtyIsNotEffect[taskIndex] = true;
                    return;
                }
                assginTotalQty = assginTotalQty + separateTask.itemSpecQty;
                var remainQty = currentTask.itemCount - assginTotalQty;
                if(remainQty >= 0) {
                    $scope.qtyIsNotEffect[taskIndex] = false;
                    currentTask.remain_qty = remainQty;
                }else {
                    if(taskIndex === 0) {
                        currentTask.remain_qty = currentTask.itemCount;
                    }
                    $scope.qtyIsNotEffect[taskIndex] = true;
                }
            });
        };

        $scope.saveSeparateTasks = function () {
            var separateTasks = angular.copy($scope.separateTasks);
            separateTasks = filterOutQtyIsZero(separateTasks);
            if(separateTasks.length == 0) {
                $scope.showWarnning = true;
                return;
            }
            if(!valiadeAllAssigneeQtyIsEffect()) return;
            $scope.loading = true;
            configurationChangeTaskService.splitTask($scope.currentTask.id, separateTasks).then(function () {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('wms.task.configurationChangeTask.list');
                });
            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup('Split Configuration Change Task Error! ' + error.data.error);
            });
        };

        $scope.deleteSeparateTask = function (separateIndex) {
            lincUtil.deleteConfirmPopup('Are you sure to remove this separate task?', function()
            {
                var deleteSeparateTask = $scope.separateTasks[separateIndex];
                if(!$scope.qtyIsNotEffect[separateIndex] && deleteSeparateTask.itemSpecQty > 0) {
                    $scope.currentTask.remain_qty =  $scope.currentTask.remain_qty + deleteSeparateTask.itemSpecQty;
                }
                $scope.separateTasks.splice(separateIndex, 1);
                $scope.qtyIsNotEffect.splice(separateIndex, 1);
            });
        };

        $scope.cancel = function () {
            $state.go("wms.task.configurationChangeTask.list");
        };

        function judgeAllItemQtyIsAssigned(remainQty) {
            return remainQty > 0? false : true;
        }

        function valiadeAllAssigneeQtyIsEffect() {
            var bool = true;
            _.forIn($scope.qtyIsNotEffect, function(value) {
                if(value) {
                    bool = false;
                }
            });
            return bool;
        }

        function filterOutQtyIsZero(separateTasks){
            var separateTasksQtyIsNotZero = _.filter(separateTasks, function(separateTask) {
                return separateTask.itemSpecQty > 0;
            });
            return separateTasksQtyIsNotZero;
        }

        function _init() {
            configurationChangeTaskService.getTaskById($stateParams.taskId).then(function(task){
                $scope.currentTask = angular.copy(task);
                $scope.currentTask.remain_qty =  $scope.currentTask.itemCount;
                $scope.separateTasks = [];
                $scope.qtyIsNotEffect = [];
                $scope.addSeparateTask();
            });
        }

        _init();
    };
    ctrl.$inject = ['$scope', '$state','$stateParams', 'configurationChangeTaskService', 'lincUtil'];
    return ctrl;
});