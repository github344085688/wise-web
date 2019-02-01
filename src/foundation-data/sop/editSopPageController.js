'use strict';

define([], function() {

    var controller = function(itemService, $scope, $state, $stateParams, lincUtil, isAddAction, sopService, organizationService) {
        
        var ctrl = this;


        ctrl.getTaskSteps = function(search) {
            ctrl.taskSteps = ['Receive', 'Load', 'Pick', 'Pack', 'Change Configuration', 'Cycle Count'];
        };

        ctrl.addOrUpdateSop = function() {
            $scope.loading = true;
            if (ctrl.isAddAction && !ctrl.sop.id) {
                sopService.addSop(ctrl.sop).then(function(data) {
                    $scope.loading = false;
                    ctrl.sop.id = data.id;
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go("fd.sop.list");
                    });
                }, function(error) {
                    $scope.loading = false;
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
            } else {
                sopService.updateSop(ctrl.sop).then(function(data) {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go("fd.sop.list");
                    });
                }, function(error) {
                    $scope.loading = false;
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
            }
        };

        ctrl.cancelEditSop = function() {
            $state.go("fd.sop.list");
        };


        function init() {
            ctrl.getTaskSteps();
            ctrl.isAddAction = $stateParams.sopId ? false : true;
            if (ctrl.isAddAction) {
                $scope.submitLabel = "Save";
                ctrl.sop = {};
            } else {
                $scope.submitLabel = "Update";
                sopService.getSopById($stateParams.sopId).then(function(response) {
                    ctrl.sop = response;
                }, function() {});
            }
        }

        init();

    };
    controller.$inject = ['itemService', '$scope', '$state', '$stateParams', 'lincUtil', 'isAddAction', 'sopService', 'organizationService'];

    return controller;
});
