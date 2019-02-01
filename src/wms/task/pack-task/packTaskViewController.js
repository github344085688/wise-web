'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, $stateParams, packService,lincUtil) {
        $scope.pageObj = {pageSize: 10};
        $scope.packedHistoryPage=[];
        $scope.packedHistoryTotalCount = 0;

        $scope.loadContent = function (currentPage) {
            $scope.paging = currentPage;
            $scope.packedHistoryTotalCount = $scope.task.packedHistoryView.length;
            $scope.packedHistoryPage = pagination(currentPage, $scope.pageObj.pageSize, $scope.task.packedHistoryView);

        };

        function pagination(pageNo, pageSize, array) {
            var offset = (pageNo - 1) * pageSize;
            return (offset + pageSize >= array.length) ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize);
        }

        function getTask(taskId) {
            packService.getTask(taskId).then(function (response) {
                $scope.task = response.task;
                $scope.itemSpecMap = response.detailMap.itemSpecMap;
                $scope.itemUnitMap = response.detailMap.itemUnitMap;
                $scope.locationMap = response.detailMap.locationMap;
                $scope.productMap = response.detailMap.productMap;
                $scope.initTab($scope.task);
                $scope.loadContent(1);
            });
        }

        $scope.printOrderPackingListPrint = function (orderId) {
            if (orderId) {
                var url = $state.href('orderPackingListPrint', {orderId: orderId });
                window.open(url);
            }
        };
        
        $scope.printMultipleOrderPackingList = function (orderIds) {
            if (orderIds && orderIds.length > 0) {
                var url = $state.href('mutipleOrderPackingListPrint', { orderIds: orderIds });
                window.open(url);
            }
        };

        function init() {
            getTask($stateParams.taskId);
        }

        $scope.printShippingLabel = function (orderIds) {
            var orderStatusIsPacked = true;
            _.forEach($scope.task.orderViews, function (orderView) {
                if (orderView.status != "Packed") {
                    orderStatusIsPacked = false;
                    return;
                }
            })
            if (orderStatusIsPacked||$scope.task.status=="Closed") {
                var url = $state.href('PageTaskShippingLabelPrint', { orderIds: orderIds });
                window.open(url);
            } else {
                lincUtil.errorPopup("Please print when all the orders in this pack task  were under Packed status.");
            }
        };

        $scope.initTab = function (task) {
            $scope.activetab = "itemLines";
            $scope.activeStepTabs = {};
            angular.forEach(task.steps, function (step) {
                $scope.activeStepTabs[step.id] = "content";
            });
        }

        $scope.changeTab= function (tab) {
            $scope.activetab = tab;
        };

        $scope.changeStepTab = function (tab, stepId) {
            $scope.activeStepTabs[stepId] = tab;
        };


        $scope.orderClick = function (order) {
            if (order.status === "Packed")
                $state.go("wms.outbound.pack.packOrderDetail", { lpParam: order.orderId });
            else
                $state.go("wms.outbound.pack.packOrder", { lpParam: order.orderId });
        };
        
        $scope.editTask = function (taskId) {
            $state.go("wms.task.packTask.general.edit", { taskId: taskId});
        };

        $scope.reopenTask = function (task) {
            lincUtil.confirmPopup('Tip', 'Would you like to reopen this pack task?', function () {
                packService.reopenTask(task.id).then(function () {
                    lincUtil.messagePopup("Info", "Reopen pack task successful.");
                    init();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.reopenStep = function (step) {
            lincUtil.confirmPopup('Tip', 'Would you like to reopen this step?', function () {
                packService.reopenStep($scope.task.id, step.id).then(function () {
                    lincUtil.updateSuccessfulPopup(function () {
                        step.status = "In Progress";
                    });
                }, function (error) {
                    lincUtil.errorPopup('Update Error! ' + error.data.error);
                });
            });
        };

        init();
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'packService','lincUtil'];
    return controller;
});