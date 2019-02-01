'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var selectTruckLoadController = function($scope, $state, loadsService,  BuildTruckLoadService, lincUtil) {
        $scope.add = function() {
            BuildTruckLoadService.addLoadLines(angular.copy($scope.checkedLoads));
            BuildTruckLoadService.fromSelect = true;
            $state.go('wms.outbound.truckLoad.build', { truckLoadNo: BuildTruckLoadService.getTruckLoad().truckLoadNo });
        };

        $scope.search = function() {
            if ($scope.loadNos) {
                $scope.load.loadNos = [];
                $scope.loadNos.forEach(function(loadNoSelect) {
                    $scope.load.loadNos.push(loadNoSelect.text);
                });
            }
            $scope.isLoadingComplete = false;

            loadsService.searchTruckLoad($scope.load).then(function(response) {
                $scope.loads = response.loads;
                $scope.loadOrderLineMap = response.loadOrderLineMap;
                $scope.isLoadingComplete = true;
            }, function(error) {
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.reset = function() {
            $scope.load = {};
        };

        $scope.getLoadStatuses = function() {
            loadsService.getLoadStatus().then(function(response) {
                $scope.avaibleStatuses = response;
            });
        };

        $scope.getLoadTypes = function() {
            loadsService.getLoadTypes().then(function(response) {
                $scope.avaibleTypes = response;
            });
        };

        $scope.selectAll = function() {
            if ($scope.checkedAll) {
                $scope.checkedLoads = [];
                $scope.checkedAll = false;
            } else {
                _.forEach($scope.loads, function(load) {
                    $scope.checkedLoads.push(load);
                    $scope.checkedLoads = _.uniqBy($scope.checkedLoads, 'id');
                    $scope.checkedAll = true;
                });
            }
        };

        $scope.isChecked = function(load) {
            return _.find($scope.checkedLoads, load);
        };

        $scope.checkOrUncheck = function(load) {
            if (_.find($scope.checkedLoads, load) > -1) {
                _.remove($scope.checkedLoads, function(checkedLoad) {
                    return checkedLoad.loadId === load.loadId;
                });
                $scope.checkedAll = false;
            } else {
                $scope.checkedLoads.push(load);
            }
        };

        $scope.viewOrCloseDetail = function(viewOrClose) {
            if (viewOrClose === 'View') {
                for (var i = 0; i < $scope.loads.length; i++)
                    $scope['in' + i] = 'in';
                $scope.viewOrClose = 'Close';
            } else {
                for (var j = 0; j < $scope.loads.length; j++)
                    $scope['in' + j] = '';
                $scope.viewOrClose = 'View';
            }
        };

        $scope.getIn = function(index) {
            return $scope['in' + index];
        };

        $scope.showIn = function(index) {
            if (typeof($scope['in' + index]) === 'undefined' || $scope['in' + index] === '') {
                $scope['in' + index] = 'in';
            } else {
                $scope['in' + index] = '';
            }
        };

        function _init() {
            $scope.isLoadingComplete = true;
            $scope.viewOrClose = 'View';
            $scope.in = '';
            $scope.load = {};
            $scope.checkedLoads = [];
            $scope.getLoadStatuses();
            $scope.getLoadTypes();
        }

        _init();
    };

    selectTruckLoadController.$inject = ['$scope', '$state', 'loadsService', 'BuildTruckLoadService', 'lincUtil'];

    return selectTruckLoadController;
});
