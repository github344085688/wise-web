'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var masterbolSequenceController = function($scope, orderSequenceService, $state, $stateParams, lincUtil, $timeout) {

        $scope.save = function() {
            var sequence = toOrderSequenceGroupList($scope.list);
            $scope.loading = true;
            orderSequenceService.saveSequence($scope.loadId, sequence).then(function() {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();
            },function(error) {
                $scope.loading = false;
                lincUtil.errorPopup('Save Receipt Error! ' + error.data.error);
            });
        };

        function getOrderById(id) {
            return $scope.orderMap[id];
        }

        //Id List to View
        function toSequenceView(orderGroups) {
            var sequenceViewList = [];
            _.forEach(orderGroups, function(order) {
                if (order.orderIds.length > 1) {
                    var group = angular.copy($scope.templates[0]);
                    _.forEach(order.orderIds, function(orderId) {
                        group.columns[0].push(getOrderById(orderId));
                    });
                    sequenceViewList.push(group);
                } else if (order.orderIds.length == 1) {
                    sequenceViewList.push(getOrderById(order.orderIds[0]));
                }
            });
            return sequenceViewList;
        }

        //View to IdList
        function toOrderSequenceGroupList(orderGroups) {
            var orderSequenceGroupList = [];
            _.forEach(orderGroups, function(order) {
                var orderIds = [];
                var orderSequenceGroup = {};
                if (order.columns) {
                    _.forEach(order.columns[0], function(subOrder) {
                        if (subOrder.columns) {
                            lincUtil.errorPopup("Invalid Sequence, please resequence!");
                            return;
                        }
                        orderIds.push(subOrder.id);
                    });
                } else {
                    orderIds.push(order.id);
                }
                orderSequenceGroup.orderIds = orderIds;
                orderSequenceGroupList.push(orderSequenceGroup);
            });
            return orderSequenceGroupList;
        }

        $scope.delete = function() {
            //delete sequence $scope.ordersMbolId
            lincUtil.deleteConfirmPopup("Are you sure to delete the sequence?", function() {
                //Call backend to delete sequence.
                $scope.list = [];
                $scope.message = "order sequence has been deleted successfully, message would be removed in 3 seconds";
                $timeout(function() { $scope.message = ""; }, 3000);
                // searchSequence($scope.ordersMbolId);
            });
        };

        $scope.search = function() {
            if ($scope.loadId) {
                searchSequence($scope.loadId);
            }
        };

        function searchSequence(loadId) {
            orderSequenceService.getSequenceByLoadId(loadId).then(function(response) {
                if (response.error) {
                    lincUtil.errorPopup(response.error);
                    return;
                }
                if (response.sequence.length === 0) {
                    lincUtil.errorPopup("Please build truckLoad first!!");
                    return;
                }
                $scope.sequence = response.sequence;
                $scope.orderMap = response.orderMap;
                $scope.loadId = response.loadId;
                $scope.list = toSequenceView($scope.sequence);
            });
        }

        /**
         *  Drop to only remove group
         */
        $scope.dropCallback = function(event, index, item, external) {

            if (item.type) {
                $timeout(function function_name(argument) {
                    var i = $scope.index;
                    _.forEach(item.columns[0], function(value) {
                        $scope.$apply(function() {
                            $scope.movedList.splice(i++, 0, value);
                        });
                    });
                }, 100);
                return true;
            }
            return false;
        };

        // Drag to mark the position of the item
        $scope.dndMovedCallBack = function(list, index) {
            $scope.index = index;
            // console.log("$scope.index" + index);
            list.splice(index, 1);
            $scope.movedList = list;
        };

        function _init() {
            $scope.templates = [{
                type: "Group",
                // id: 1,
                columns: [
                    []
                ]
            }];
            $scope.searchLoad = true;
            $scope.list = [];
            $scope.tips = "Please drag to prioritise, orders in group means in the same priority";
            if ($stateParams.loadId) {
                $scope.loadId = $stateParams.loadId;
                searchSequence($stateParams.loadId);
            }
        }
        _init();

    };

    masterbolSequenceController.$inject = ['$scope', 'orderSequenceService', '$state', '$stateParams', 'lincUtil', '$timeout'];
    return masterbolSequenceController;
});
