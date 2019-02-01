'use strict';

define(['lodash'], function(_) {
    var controller = function($scope, $state, $stateParams, lincUtil, organizationAkaService) {
        var ctrl = this;
        function init() {
            organizationAkaService.getAkaByOrganizationId($stateParams.organizationId).then(function(response) {
                ctrl.aka = response;
                if(!ctrl.aka.items || ctrl.aka.items.length ===0 ){
                    ctrl.aka.items = [{}];
                }
             
            }, function() {
                ctrl.aka = {items:[{}]};
            });
        }

        init();
        
        ctrl.addItem = function() {
            ctrl.aka.items.push({});
        };
        ctrl.removeItem = function(index) {
            ctrl.aka.items.splice(index, 1);
        };

        ctrl.addOrUpdateAka = function() {
            $scope.loading = true;
            if(ctrl.aka.id) {
                updateAka(ctrl.aka);
            }else {
                ctrl.aka.orgId = $stateParams.organizationId;
                createAka(ctrl.aka);
            }
        };

        function createAka(aka) {
            organizationAkaService.createAka(aka).then(function (res) {
                $scope.loading = false;
                aka.id = res.id;
                $scope.submitLabel = "Update";
                lincUtil.saveSuccessfulPopup();
            },accessServiceFail);
        }

        function updateAka(aka) {
            organizationAkaService.updateAka(aka).then(function(res) {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(init());
            },accessServiceFail);
        }

        function accessServiceFail(error) {
            $scope.loading = false;
            lincUtil.errorPopup('Error:' + error.data.error);
        }

        ctrl.cancelEditAka = function() {
            $state.go("fd.organization.list");
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams',
        'lincUtil', 'organizationAkaService'];

    return controller;
});
