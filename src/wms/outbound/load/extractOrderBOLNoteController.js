'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, loadNote, orders) {

        $scope.param = {};
        function init () {
            $scope.param.loadNote = loadNote;
            $scope.param.bolNote = _.map(orders, "bolNote");
            $scope.param.bolNote = _.uniq($scope.param.bolNote);
            var noteJoin = "";
            _.forEach($scope.param.bolNote, function (note) {
                noteJoin = noteJoin + note + "\n"
            });
            $scope.param.bolNote = noteJoin;
        }
        init();
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function () {
            $mdDialog.hide($scope.param.bolNote);
        };

    };
    controller.$inject = ['$scope', '$mdDialog', 'loadNote', 'orders'];
    return controller;
});
