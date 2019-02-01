'use strict';

define([], function () {
    var controller = function ($scope,$mdDialog,replenishmentTaskService) {
        $scope.replenish={};
        $scope.isCombineEAReplenish=false;
        $scope.replenishTasks=[];
        initSet();
        function initSet() {

        }
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.combineEAReplenishTasks=function () {
            if(! $scope.replenish['customerId']) return ;
            replenishmentTaskService.combineEAReplenishTasks($scope.replenish['customerId']).then(function (response) {
                 $scope.replenishTasks=response;
                 $scope.isCombineEAReplenish=true;

            });
        };
    };
    controller.$inject = ['$scope','$mdDialog','replenishmentTaskService'];
    return controller;
});