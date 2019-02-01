'use strict';

define(['angular', 'lodash', 'moment'], function(angular, _, moment) {
    var ctrl = function($scope,  transloadTaskService, lincUtil, stepTimer, stepName, $mdDialog) {

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        function init() {

            $scope.stepTimer = stepTimer;
            $scope.step = {name: stepName};
        }

        init();
    };
    ctrl.$inject = ['$scope', 'transloadTaskService',  'lincUtil', 'stepTimer', 'stepName', '$mdDialog'];

    return ctrl;
});
