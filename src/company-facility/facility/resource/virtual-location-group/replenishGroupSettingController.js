'use strict';

define([
    'angular',
    'lodash',
    './selectLocationController'
], function (angular, _, selectLocationController) {
    var controller = function ($scope, $mdDialog, $state, $stateParams, isAddAction, lincUtil, locationService) {


        function getReplenishPathCost() {
            $scope.isLoading = true;
            locationService.getReplenishPathCost().then(function (response) {
                $scope.virtualLocationGroups = response.virtualLocationGroups;
                $scope.virtualLocationGroupsKeyById = _.keyBy(response.virtualLocationGroups, 'id');
                $scope.replenishPathCostsGroupByToVlgID = _.groupBy(response.replenishPathCosts, 'toVlgID');
                $scope.isLoading = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isLoading = false;
            });
        }
        function _init() {
            getReplenishPathCost();
        }
        _init();

        $scope.save = function () {
           var  replenishPathCosts=setReplenishCosts();
            $scope.loading=true;
            locationService.updateReplenishPathCost(replenishPathCosts).then(function (response) {
                $scope.loading=false;
              
                lincUtil.saveSuccessfulPopup(function(){
                    _init();
                });
          
            }, function (error) {
                $scope.loading=false;
                lincUtil.processErrorResponse(error);
            });

        }


        function setReplenishCosts() {
            var replenishPathCosts = [];
            _.forEach($scope.replenishPathCostsGroupByToVlgID, function (val, key) {
                replenishPathCosts = _.union(replenishPathCosts, val);
            });
             return replenishPathCosts;
        }

        $scope.clickReplenish = function (replenish) {
            replenish.isclick = true;
        }

        
        $scope.cancel = function () {
            $state.go('cf.facility.resource.virtualLocationGroup.groupManagement.list');
        };
    };
    controller.$inject = ['$scope', '$mdDialog', '$state', '$stateParams',
        'isAddAction', 'lincUtil', 'locationService'];

    return controller;
});

