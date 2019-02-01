'use strict';

define(["lodash"], function (_) {
    var $scope = function ($scope, $state, $stateParams, qcTaskService, lincUtil) {
        $scope.taskId = $stateParams.taskId;

        function getQcTaskProcessView() {
            $scope.isLoading = true;
            qcTaskService.getQcTaskProcessView($stateParams.taskId).then(function (data) {
                organzationQcTaskView(data);
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isLoading = false;
            });
        }

        $scope.EditOrder = function () {
            $state.go("wms.task.qcTask.edit", { id: $stateParams.taskId });
        };

        $scope.selectedTab = function (orderQCView) {
            $scope.activetab = orderQCView.orderId;
        }

        function organzationQcTaskView(data) {
            $scope.orderQCViews = data.orderQCViews;
            $scope.itemMap = data.itemMap;
            _.forEach($scope.orderQCViews, function (orderQCViews) {
                _.forEach(orderQCViews.orderQCViewItemLines, function (orderQCViewItemLines) {
                    orderQCViewItemLines.totalPickedQty = _.sumBy(orderQCViewItemLines.pickedInventories, 'pickedQty');
                    orderQCViewItemLines.totalQcPassedQty = _.sumBy(orderQCViewItemLines.qcProcessedItems, 'qcProcessedQty');
                });
            });
            if ($scope.orderQCViews.length > 0) {
                $scope.activetab = $scope.orderQCViews[0].orderId;
            }

            $scope.isLoading = false;

        }

        function getQcTaskByID() {
            qcTaskService.getQcTask($stateParams.taskId).then(function (data) {
                $scope.qcTask = data;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function _init() {
            getQcTaskProcessView();
            getQcTaskByID();
        }

        _init();
    };
    $scope.$inject = ['$scope', '$state', '$stateParams', 'qcTaskService', 'lincUtil'];
    return $scope;
});
