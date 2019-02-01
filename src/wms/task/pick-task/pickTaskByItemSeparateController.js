
'use strict';

define(['lodash', 'angular'], function(_, angular) {
    var ctrl = function($scope, $state, $stateParams, pickService, lincUtil) {

        var itemLinesTemplete;
        function init() {
            $scope.isLoading = true;
            pickService.getPickTaskView($stateParams.taskId).then(function(task){
                $scope.isLoading = false;
                $scope.task = angular.copy(task);
                itemLinesTemplete = angular.copy($scope.task.pickItemLines);
                angular.forEach($scope.task.pickItemLines, function (itemLine) {
                    itemLine.remain_qty = itemLine.qty;
                });
                $scope.separateTasks = [];
                $scope.qtyIsNotEffect = [];
                $scope.separateTaskWarnings = [];
                $scope.addSeparateTask();
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        init();
        
        $scope.addSeparateTask = function()
        {
            if(judgeAllItemQtyIsAssigned()) {
                lincUtil.messagePopup("Tip", "All Item Qty Be assigned! ");
                return;
            }
            $scope.showAddTaskWarnning = false;
            var separateTask = {};
            var itemLines = angular.copy(itemLinesTemplete);
            angular.forEach(itemLines, function (itemLine, key) {
                itemLine.qty =  0;
                delete itemLine.baseQty;
            });
            separateTask.itemLines = itemLines;
            $scope.separateTasks.push(separateTask);
            $scope.qtyIsNotEffect.push([]);
        }

        function judgeAllItemQtyIsAssigned() {
            var bool = true;
            angular.forEach($scope.task.pickItemLines, function (itemLine) {
                if(itemLine.remain_qty > 0) {
                    bool = false;
                }
            });
            return bool;
        }

        $scope.updateRemainQtyAndCheckIsValidQty = function(separateTaskIndex, itemLineIndex, assignedQty)
        {
            if(assignedQty < 0) {
                $scope.qtyIsNotEffect[separateTaskIndex][itemLineIndex] = true;
                return;
            }
            if(assignedQty > 0) {
                $scope.separateTaskWarnings[separateTaskIndex] = false;
            }
            var pickItemLine = $scope.task.pickItemLines[itemLineIndex];
            var assginLineTotalQty = 0;
            angular.forEach($scope.separateTasks, function (separateTask, taskIndex) {
                assginLineTotalQty = assginLineTotalQty + separateTask.itemLines[itemLineIndex].qty;
                var remainQty = pickItemLine.qty - assginLineTotalQty;
                if(remainQty >= 0) {
                    $scope.qtyIsNotEffect[taskIndex][itemLineIndex] = false;
                    pickItemLine.remain_qty = remainQty;
                }else {
                    if(taskIndex === 0) {
                        pickItemLine.remain_qty = pickItemLine.qty;
                    }
                    $scope.qtyIsNotEffect[taskIndex][itemLineIndex] = true;
                }
            });
            // console.log($scope.qtyIsNotEffect);
        };

        function valiadeAllAssigneeQtyIsEffect() {
            var bool = true;
            _.forIn($scope.separateTaskWarnings, function (value) {
                if(value) {
                    bool = false;
                }
            });
            _.forIn($scope.qtyIsNotEffect, function(separateTask) {
                _.forIn(separateTask, function (value) {
                    if(value) {
                        bool = false;
                    }
                })
            });
            return bool;
        }

        $scope.saveSeparateTasks = function () {
            var separateTasks = angular.copy($scope.separateTasks);
            filterOutQtyIsZero(separateTasks);
            if(separateTasks.length == 0) {
                $scope.showAddTaskWarnning = true;
                return;
            }
            setTaskWarnings(separateTasks);
            if(!valiadeAllAssigneeQtyIsEffect()) return;
            $scope.isSaveloading = true;
            pickService.splitTask($scope.task.id, separateTasks).then(function () {
                $scope.isSaveloading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('wms.task.pickTask.list');
                });
            }, function (error) {
                $scope.isSaveloading = false;
                 lincUtil.processErrorResponse(error);
            });
        };
        
        function filterOutQtyIsZero(separateTasks){
            angular.forEach(separateTasks, function(separateTask, taskIndex) {
                var itemLinesQtyIsNotZero = _.filter(separateTask.itemLines, function(itemLine) {
                    return itemLine.qty > 0;
                });
                separateTask.itemLines = itemLinesQtyIsNotZero;
            });
        }

        function setTaskWarnings(separateTasks) {
            angular.forEach(separateTasks, function(separateTask, taskIndex) {
                if(separateTask.itemLines.length == 0) {
                    $scope.separateTaskWarnings[taskIndex] = true;
                }
            });
        }

        $scope.deleteSeparateTask = function (separateIndex) {
            lincUtil.deleteConfirmPopup('Are you sure to remove this separate task?', function()
            {
                $scope.separateTaskWarnings.splice(separateIndex, 1) ;
                var taskItemLines = $scope.task.pickItemLines;
                var deleteSeparateTask = $scope.separateTasks[separateIndex];
                angular.forEach(deleteSeparateTask.itemLines, function (itemLine, itemLineIndex) {
                    if(!$scope.qtyIsNotEffect[separateIndex][itemLineIndex] && itemLine.qty > 0) {
                        taskItemLines[itemLineIndex].remain_qty =  taskItemLines[itemLineIndex].remain_qty + itemLine.qty;
                    }
                });
                $scope.separateTasks.splice(separateIndex, 1);
            });
        };

        $scope.cancel = function () {
            $state.go("wms.task.pickTask.list");
        };
    };
    ctrl.$inject = ['$scope', '$state','$stateParams', 'pickService', 'lincUtil'];
    return ctrl;
});