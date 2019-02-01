'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var buildTruckLoadController = function($scope, $state, $stateParams, truckLoadService, lincUtil, BuildTruckLoadService) {

        $scope.addLoads = function() {
            BuildTruckLoadService.setLoadLines($scope.truckLoad.loadLines);
            BuildTruckLoadService.setTruckLoad($scope.truckLoad);
            $state.go('wms.outbound.truckLoad.select');
        };

        $scope.save = function() {
            $scope.truckLoad.loadIds = loadLinesToLoadIds();
            $scope.loading = true;
            if ($scope.isNew && !$scope.truckLoad.id) {
                //add 
                truckLoadService.addTruckLoad($scope.truckLoad).then(function(response) {
                    $scope.loading = false;
                    lincUtil.saveSuccessfulPopup();
                    $scope.truckLoad.id = response.id;
                    $state.go('wms.outbound.truckLoad.list');
                }, function(res) {
                    $scope.loading = false;
                    if (res.data && res.data.message) {
                        lincUtil.errorPopup(res.data.message);
                    } else {
                        lincUtil.errorPopup("Save Failed!");
                    }
                });
            } else {
                //edit
                truckLoadService.updateTruckLoad($scope.truckLoad).then(function(response) {
                    $scope.loading = false;
                    lincUtil.saveSuccessfulPopup();
                }, function(res) {
                    $scope.loading = false;
                    if (res.data.message) {
                        lincUtil.errorPopup(res.data.message);
                        $state.go('wms.outbound.truckLoad.list');
                    } else {
                        lincUtil.errorPopup("Save Failed!");
                    }
                });
            }
        };

        function loadLinesToLoadIds() {
            var loadIds = [];
            _.forEach($scope.truckLoad.loadLines, function(loadLine) {
                loadIds.push(loadLine.id);
            });
            return loadIds;
        }

        $scope.remove = function(index) {
            lincUtil.confirmPopup("Remove Load", "Are you sure to delete this record?", function() {
                $scope.truckLoad.loadLines.splice(index, 1);
            });
        };

        function fromEdit() {
            truckLoadService.getTruckLoadByTruckLoadNo($stateParams.truckLoadNo).then(function(response) {
                $scope.truckLoad = response;
                loadLineToView();
            }, function(error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function loadLineToView() {
            var loadLines = angular.copy($scope.truckLoad.loadLines);
            $scope.truckLoad.loadLines = [];
            _.forEach(loadLines, function(loadLine) {
                var load = $scope.truckLoad.loadMap[loadLine.loadId];
                load.sequence = loadLine.sequence;
                load.organizations = $scope.truckLoad.organizationMap;
                $scope.truckLoad.loadLines.push(load);
            });
        }

        function _init() {
            $scope.isNew = ($stateParams.truckLoadNo && $stateParams.truckLoadNo !== "") ? false : true;
            $scope.createEdit = "Create";
            $scope.submitLabel = "Save";
            if (!$scope.isNew) {
                $scope.submitLabel = "Update";
                if (!BuildTruckLoadService.fromSelect) {
                    fromEdit();
                    if (!$scope.truckLoad) {
                        $scope.truckLoad = {};
                    }
                } else {
                    $scope.truckLoad = BuildTruckLoadService.getTruckLoad();
                    $scope.loadLines = angular.copy(BuildTruckLoadService.getLoadLines());

                    $scope.truckLoad.loadLines = $scope.loadLines;
                }
            } else {
                $scope.truckLoad = BuildTruckLoadService.getTruckLoad();
                $scope.loadLines = angular.copy(BuildTruckLoadService.getLoadLines());
                $scope.truckLoad.loadLines = $scope.loadLines;
            }
            BuildTruckLoadService.setLoadLines([]);
            BuildTruckLoadService.setTruckLoad({});
            BuildTruckLoadService.fromSelect = false;

        }
        _init();
    };
    buildTruckLoadController.$inject = ['$scope', '$state', '$stateParams', 'truckLoadService', 'lincUtil', 'BuildTruckLoadService'];
    return buildTruckLoadController;
});
