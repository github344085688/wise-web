'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var createPackTaskController = function ($scope, packService, $state,
                                             $stateParams, orderService, addressService,
                                             lincUtil, session, $q) {
        $scope.save = function () {
            $scope.loading = true;
            var promises = [];
            angular.forEach($scope.batchTaskOrderIds, function (orderIds) {
                var packTask = angular.copy($scope.packTask);
                packTask.orderIds = orderIds;
                promises.push(packService.createPackTask(packTask));
            })
            $q.all(promises).then(function (responses) {
                $scope.loading = false;
                var taskIds = _.map(responses, "id");
                var popUpName  = "TaskIds:" + _.join(taskIds, ',');
                lincUtil.messagePopup("Batch Create Task successfully", popUpName, function () {
                    $state.go('wms.task.packTask.general.list');
                });
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };


        $scope.cancel = function () {
            lincUtil.confirmPopup("Leave Confirm", "Do you want to discard the changes?", function () {
                $state.go('wms.outbound.pack.orderToPackTask');
            });
        };
        
        function getOrders(batchTaskOrderIds) {
            var orderIds = _.flattenDeep(batchTaskOrderIds);
            orderService.searchOrder({orderIds: orderIds}).then(function(orders) {
                generateShipToAddressStr(orders);
                $scope.orderMap = _.keyBy(orders, 'id');
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function generateShipToAddressStr(orders) {
            angular.forEach(orders, function (order) {
                order.shipToAddressStr = addressService.generageAddressData(order.shipToAddress, null);
            });
        }

        function _init() {
            $scope.batchTaskOrderIds = $stateParams.batchTaskOrderIds;
            $scope.packTask = {};
            if (!$scope.batchTaskOrderIds || $scope.batchTaskOrderIds.length == 0) {
                lincUtil.errorPopup("Please select order to pack.", function () {
                    $state.go('wms.outbound.pack.orderToPackTask');
                });
                return;
            }
            getOrders($scope.batchTaskOrderIds);
        }

        _init();
    };

    createPackTaskController.$inject = ['$scope', 'packService', '$state',
        '$stateParams', 'orderService', 'addressService',
        'lincUtil', 'session', '$q'];
    return createPackTaskController;
});
