'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, itemLine, ) {

        $scope.cartons = [];
        $scope.labelText = 'Edit Carton';
        $scope.showTableDetail = true;
        function init() {
            if (itemLine.cartons && itemLine.cartons.length > 0) {
                $scope.cartons =  itemLine.cartons;
            }
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
             $mdDialog.hide($scope.cartons);
        };
        $scope.changeShowWay = function(){
            if( $scope.labelText ==='Edit Carton' ){
                $scope.showTableDetail = false;
                $scope.labelText = 'Show Carton Detail';
            }else{
                $scope.showTableDetail = true;
                $scope.labelText = 'Edit Carton';
            }
            
           
        }
        $scope.remove = function (index) {
            $scope.cartons.splice(index, 1);
        }
        $scope.add = function () {
            $scope.cartons.push({});
        }

        init();
    };
    controller.$inject = ['$scope', '$mdDialog', 'itemLine'];
    return controller;
});