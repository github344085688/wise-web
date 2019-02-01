'use strict';

define(["angular", "lodash", './createOrderForQCController'], function (angular, _, createOrderForQCController) {

    var controller = function ($scope, $state, $stateParams, lincUtil,isAddAction, qcTaskService) {
        $scope.pageSize = 10;
        function init() {
            $scope.isAddAction = isAddAction;
            if (!isAddAction) {
                $scope.submitLabel = "Update";
                qcTaskService.getQcTask($stateParams.id).then(function (data) {
                    $scope.qcTask = data;
                    $scope.orders = data.orders;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            } else {
                $scope.submitLabel = "Save";
                $scope.qcTask = {};
            }
        }
        init();

        $scope.submitQcTask = function () {
            var qcTask = angular.copy($scope.qcTask);
            $scope.loading = true;
            if (isAddAction) {
                createQCTask(qcTask);
            } else {
                updateQCTask(qcTask);
            }
        };

        $scope.selectOrder = function (entry) {
            var templateUrl = 'wms/task/qc-task/template/createOrderForQc.html';
            lincUtil.popupBodyPage(createOrderForQCController, templateUrl, null, {
                customerId: $scope.qcTask.customerId,
                longHaulId: $scope.qcTask.longHaulId
            }).then(function (checkedOrders) {

                $scope.orders = _.unionBy($scope.orders, checkedOrders, 'id');
                $scope.loadContent(1);
            });
        };

        $scope.loadContent = function (currentPage) {
            $scope.ordersView = $scope.orders.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.orders.length ? $scope.orders.length : currentPage * $scope.pageSize);
        };


        $scope.delete = function (seletedOrder) {
            if (seletedOrder.status === 'Committed' || seletedOrder.status === 'Partial Committed' || seletedOrder.status === 'Picking') {
                _.remove($scope.orders, function (order) {
                    return order.id === seletedOrder.id;
                });
                $scope.loadContent(1);
            }
            else {
                lincUtil.errorPopup("The Order can be deleted when status is 'Committed' or 'Partial Committed' or 'Picking' ");
            }


        };

        function createQCTask(qcTask) {
            qcTaskService.createQcTaskForAndroid(qcTask).then(function (res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go("wms.task.qcTask.list");
                });
            }, accessServiceFail);
        }

        function updateQCTask(qcTask) {
            var param = {};
            param.id = qcTask.id;
            param.orderIds = _.map($scope.orders, "id");
            param.customerId = qcTask.customerId;
            param.longHaulId = qcTask.longHaulId;
            qcTaskService.updateQcTask(param).then(function (res) {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go("wms.task.qcTask.list");
                });
            }, accessServiceFail);
        }

        function accessServiceFail(error) {
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        $scope.cancel = function () {
            $state.go("wms.task.qcTask.list");
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil',
        'isAddAction', 'qcTaskService'];

    return controller;
});
