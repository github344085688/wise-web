'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, lpTemplateList, clp, packTaskId, conveyorService, lincUtil) {

        $scope.lpTemplateList = _.unionBy(lpTemplateList, function (lp) {
            return lp.lpConfigurationTemplateId;
        });

        $scope.param = {};
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        function init () {
            conveyorService.getPackTask(packTaskId).then(function (response) {
                var packTask = response;
                if (packTask.steps) $scope.param.stepId = packTask.steps[0].id;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        init();

        $scope.confirm = function () {
            if (!$scope.param.toSlp) {
                lincUtil.messagePopup('Message', 'To SLP	is empty');
                return;
            }
            if (!$scope.param.lpTemplateId) {
                lincUtil.messagePopup('Message', 'LP Template is empty');
                return;
            }
            conveyorService.addInnerLp($scope.param.stepId, clp, $scope.param.toSlp).then(function (response) {
                conveyorService.updateLp($scope.param.toSlp, { confId: $scope.param.lpTemplateId }).then(function (response) {
                    $mdDialog.hide();
                    lincUtil.messagePopup('Message', 'Batch Pack Successful.');
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });

        }



    };
    controller.$inject = ['$scope', '$mdDialog', 'lpTemplateList', 'clp', 'packTaskId', 'conveyorService', 'lincUtil'];
    return controller;
});