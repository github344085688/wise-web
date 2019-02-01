'use strict';

define([], function() {
    var ctrl = function($scope, sopService, lincUtil, organizationService, itemService) {
        var ctrl = this;
        ctrl.search = function() {
            ctrl.searchSopCompleted = false;
            
            sopService.getSops($scope.searchInfo).then(function(response) {
                ctrl.sops = response.sops;
                ctrl.itemMap = response.itemMap;
                ctrl.organizationMap = response.organizationMap;
                ctrl.searchSopCompleted = true;
            }, function() {});
        };

        ctrl.remove = function(index) {
            lincUtil.deleteConfirmPopup("Would like to delete this record?", function() {
                sopService.remove(ctrl.sops[index].id).then(function() {
                    ctrl.sops.splice(index, 1);
                }, function(error) {
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
            });

        };

        ctrl.taskSteps = ['Receive', 'Load', 'Pick', 'Pack', 'Change Configuration', 'Cycle Count'];

        function init() {
            $scope.searchInfo = {};
            ctrl.search();
        }
        init();

    };
    ctrl.$inject = ['$scope', 'sopService', 'lincUtil', 'organizationService', 'itemService'];
    return ctrl;
});
