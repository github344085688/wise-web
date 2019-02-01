'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, datas) {
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.datas =datas;
    };
    controller.$inject = ['$scope', '$mdDialog', 'datas'];
    return controller;
});
