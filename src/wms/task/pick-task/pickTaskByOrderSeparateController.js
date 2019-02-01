/**
 * Created by Giroux on 2017/3/6.
 */

'use strict';

define(['lodash', 'angular'], function(_, angular) {
    var ctrl = function($scope, $state, $stateParams, pickService, lincUtil, orderService) {
        var orderPickItemLinesMap;
        function init() {
            $scope.activetab = [];
            $scope.isLoading = true;
            pickService.getPickTaskView($stateParams.taskId).then(function(task){
                $scope.task = angular.copy(task);
                pickService.getOrderPickItemLinesMap(task.id).then(function (response) {
                    $scope.isLoading = false;
                    orderPickItemLinesMap = response;
                }, function () {
                    $scope.isLoading = false;
                });
                $scope.separateTasks = [{}];
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }
        init();

        $scope.orderIdOnSelect = function (orderIds, separateTask) {
            getPickItemLines(orderIds, separateTask);
        };

        $scope.orderIdOnRemove = function(orderIds, separateTask) {
            getPickItemLines(orderIds, separateTask);
        };

        function getPickItemLines(orderIds, separateTask) {
            var itemLines = [];
            angular.forEach(orderIds, function(orderId) {
                itemLines = _.concat(itemLines,  orderPickItemLinesMap[orderId]);
            });
            separateTask.itemLines = mergeQtyOfTheSameItemLine(itemLines);
        }

        function mergeQtyOfTheSameItemLine(itemLines) {
            var itemLinesGroup = _.groupBy(itemLines, function (itemLine) {
                return itemLine.itemSpecId + "_" + itemLine.productId + "_" + itemLine.unitId + "_" +
                    itemLine.locationId + "_" + itemLine.titleId;
            });
            itemLines = [];
            _.forEach(itemLinesGroup, function (arr) {
                if(arr.length == 1) {
                    itemLines.push(arr[0]);
                }else {
                    var totalQty = _.reduce(arr, function(sum, obj) {
                        return sum + obj.qty;
                    }, 0);
                    var itemLineObj = angular.copy(arr[0]);
                    itemLineObj.qty = totalQty;
                    itemLines.push(itemLineObj);
                }
            });
            return itemLines;
        }

        $scope.isOrderSelectedBySeparateTask = function (orderId) {
            var orderIds = [];
            angular.forEach($scope.separateTasks, function (separateTask) {
                if (separateTask.orderIds) {
                    orderIds = _.union(orderIds, separateTask.orderIds);
                }
            });
            if (orderIds.indexOf(orderId) > -1) {
                return true;
            } else {
                return false;
            }
        };

        $scope.saveSeparateTasks = function () {
            if($scope.separateTasks.length == 0) {
                $scope.showAddTaskWarnning = true;
                return;
            }
            $scope.isSaveloading = true;
            pickService.splitTask($scope.task.id, $scope.separateTasks).then(function () {
                $scope.isSaveloading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('wms.task.pickTask.list');
                });
            }, function (error) {
                $scope.isSaveloading = false;
                lincUtil.errorPopup('Split Pick Task Error! ' + error.data.error);
            });
        };

        $scope.deleteSeparateTask = function (index) {
            lincUtil.deleteConfirmPopup('Are you sure to remove this separate task?', function()
            {
                $scope.separateTasks.splice(index, 1);
            });
        };
        
        $scope.addSeparateTask = function () {
            $scope.showAddTaskWarnning = false;
            $scope.separateTasks.push({});
        };
        
        $scope.cancel = function () {
            $state.go("wms.task.pickTask.list");
        };
    };
    ctrl.$inject = ['$scope', '$state','$stateParams', 'pickService', 'lincUtil', 'orderService'];
    return ctrl;
});
