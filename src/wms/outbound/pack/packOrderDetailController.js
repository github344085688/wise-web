'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var packTaskListController = function($scope, packService, $state, $stateParams) {

        function getPackOrder(orderId) {

            packService.getPackOrderDetail(orderId).then(function(response) {
                $scope.order = response.packOrder;
                $scope.itemSpecMap = response.itemSpecMap;
                $scope.itemUnitMap = response.itemUnitMap;

            });
        }

        $scope.getItemName = function(itemSpecId) {
            if ($scope.itemSpecMap[itemSpecId]) {
                return $scope.itemSpecMap[itemSpecId].name;
            }
            return "";
        };

        $scope.getUnitName = function(unitId) {
            if ($scope.itemUnitMap[unitId]) {
                return $scope.itemUnitMap[unitId].name;
            }
            return "";
        };

        $scope.reOpen = function() {
            $state.go("wms.outbound.pack.packOrder", { lpParam: $stateParams.lpParam });
        };

        function _init() {
            if ($stateParams && $stateParams.lpParam) {
                getPackOrder($stateParams.lpParam);
            }
        }
        _init();
    };

    packTaskListController.$inject = ['$scope', 'packService', '$state', '$stateParams'];
    return packTaskListController;
});
