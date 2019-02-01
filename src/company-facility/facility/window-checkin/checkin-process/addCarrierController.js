'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var controller = function($scope, $state, $mdDialog, mcDot) {
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.ok = function() {
            $mdDialog.hide($scope.carrier);
        };

        function init(){
            $scope.carrier = {};
            if(mcDot){
                $scope.carrier.mcDot = mcDot;
            }
        }
        init();
    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'mcDot'];
    return controller;
});
