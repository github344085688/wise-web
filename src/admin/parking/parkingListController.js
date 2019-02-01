'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var controller = function($scope, $state, $resource, $mdDialog) {

        $scope.extendList = [];
        $scope.isViewDetail = true;
        initSet();
        function initSet()
        {
            var list = $resource("/data/admin/parking_list.json");
            list.query(function(list){
                $scope.list = list;
                angular.forEach($scope.list, function(value, key){
                    $scope.extendList[key] =  $scope.isViewDetail;
                });
            });
        }

        $scope.extendlick = function($index) {
            $scope.extendList[$index] = !$scope.extendList[$index];
        };

        $scope.viewDetails = function() {
            $scope.isViewDetail = !$scope.isViewDetail;

            angular.forEach($scope.extendList, function(value, key){
               $scope.extendList[key] = $scope.isViewDetail;
            });
        };

        $scope.addParking = function() {
            $state.go('admin.parking.add');
        };
        $scope.editParking = function(parkingId) {
            $state.go('admin.parking.edit', {parkingId: parkingId });
        };
        
        $scope.deleteParking = function (index) {
            var confirm = $mdDialog.confirm()
                .title('Confirm')
                .textContent('Would you like to remove the this Parking?')
                .ok('Yes')
                .cancel('No');
            $mdDialog.show(confirm).then(function() {
                $scope.list.splice(index, 1);
            });
        };
    };
    controller.$inject = ['$scope', '$state', '$resource', '$mdDialog'];
    return controller;
});
