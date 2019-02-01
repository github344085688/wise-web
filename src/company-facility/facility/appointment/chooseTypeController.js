'use strict';

define(['angular'], function (angular) {
    var controller = function ($scope, $state, $mdDialog, params) {
        $scope.onClick = function(type) {
            params.type = type;
            $state.go('cf.facility.appointment.edit', params);
            $mdDialog.hide();
        };
    };
    controller.$inject = ['$scope', '$state', '$mdDialog','params'];

    return controller;
});
