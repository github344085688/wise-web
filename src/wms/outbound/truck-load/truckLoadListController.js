'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var truckLoadListController = function($scope, $state, $resource, lincUtil, truckLoadService) {
        $scope.search = function() {
            $scope.truck.truckLoadNos = $scope.search.truckLoadNos;
            $scope.truck.loadNos = $scope.search.loadNos;
            searchLoads($scope.truck);
        };

        function searchLoads(param) {
            truckLoadService.searchTruckLoad(param).then(function(response) {
                $scope.truckLoads = response.truckLoads;
                $scope.organizationMap = response.organizationMap;
                $scope.loadMap = response.loadMap;
            }, function(error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.create = function() {
            $state.go('wms.outbound.truckLoad.build');
        };

        $scope.getOrganization = function(id) {
            if (id === undefined) return "";
            return $scope.organizationMap[id].name;
        };

        $scope.getLoadNos = function(truckLoad) {
            var loadNos = [];
            _.forEach(truckLoad.loadLines, function(load) {
                loadNos.push($scope.loadMap[load.loadId].loadNo);
            });
            return loadNos;
        };

        $scope.delete = function(index) {
            lincUtil.confirmPopup("Remove TruckLoad", "Are you sure to delete this record?", function() {
                truckLoadService.removeTruckLoad($scope.truckLoads[index].truckLoadNo).then(function() {
                    $scope.truckLoads.splice(index, 1);
                }, function(error) {
                    lincUtil.processErrorResponse(error);
                });
            });

        };

        $scope.edit = function(truckLoad) {
            $state.go('wms.outbound.truckLoad.build', { truckLoadNo: truckLoad.truckLoadNo });
        };

        function _init() {
            $scope.truckLoads = [];
            searchLoads({});
            $scope.truck = {};
        }
        _init();
    };

    truckLoadListController.$inject = ['$scope', '$state', '$resource', 'lincUtil', 'truckLoadService'];
    return truckLoadListController;
});
