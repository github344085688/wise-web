'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var orderPickTaskCreateController = function ($scope, pickService, userService,
                                                  orderId, $mdDialog, lincUtil,
                                                  pickTaskFactory, session) {
        $scope.createPickTask = function () {
            var tasks = [];
            if ($scope.orders && $scope.orders.length > 0) {
                angular.forEach($scope.orders, function (order) {
                    var task = {
                        orderId: order.id,
                        pickType: order.pickType,
                        pickWay: "Order Pick",
                        planMethod: "Auto"
                    };
                    task.isRush = $scope.isRush;
                    task.subTasks = [{}];
                    task.subTasks[0].assigneeUserId = $scope.subTask.assigneeUserId;
                    task.subTasks[0].startTime = $scope.subTask.startTime;
                    task.subTasks[0].endTime = $scope.subTask.endTime;
                    task.subTasks[0].note = $scope.subTask.note;
                    task.subTasks[0].pickItemLines = pickTaskFactory.organizationOrderPickItemLines(order);

                    tasks.push(task);
                });
                pickService.createBatchByOrderPickTask(tasks).then(function () {
                    lincUtil.saveSuccessfulPopup(function () {
                        $mdDialog.hide();
                    });
                }, function (error) {
                    lincUtil.errorPopup('Create Error! ' + error.data.error);
                });
            }
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        function _init() {
            $scope.subTask = {};
            $scope.orderIds = [orderId];
            $scope.orderId = orderId;
            $scope.isRush = false;
            pickService.searchOrdersForPickTask({orderIds: $scope.orderIds}).then(function (orders) {
                $scope.orders = orders;
            });
            $scope.submitLabel = "Save";
        }

        $scope.getUsers = function (search) {
            var param = search ? {
                "username": search,
                "warehouseOrgId": session.getWarehouseId()
            } : {"warehouseOrgId": session.getWarehouseId()};
            return userService.searchUsers(param).then(function (response) {
                $scope.userList = response;
            });
        };

        _init();
    };

    orderPickTaskCreateController.$inject = ['$scope', 'pickService', 'userService',
        'orderId', '$mdDialog', 'lincUtil',
        'pickTaskFactory', 'session'];
    return orderPickTaskCreateController;
});
