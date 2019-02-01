'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var ctrl = function ($scope, $state, $stateParams, itemService) {
        var ctrl = this;
          
        function getItem(id) {
            itemService.getItemById(id).then(function (data) {
                $scope.item = data;
                $scope.itemSpecName=data.name;
            });
        }

        //edit item main page
        ctrl.changeTab = function (tab) {
            $scope.activetab = tab;
            if (tab === 'itemInfo') {
                $state.go("fd.item.itemspec.edit.info", { itemSpecId: $stateParams.itemSpecId });
            } else if (tab === 'AKA') {
                $state.go("fd.item.itemspec.edit.aka", { itemSpecId: $stateParams.itemSpecId });
            } else if (tab === 'code') {
                $state.go("fd.item.itemspec.edit.code", { itemSpecId: $stateParams.itemSpecId });
            } else if (tab === 'diverse') {
                $state.go("fd.item.itemspec.edit.diverse", { itemSpecId: $stateParams.itemSpecId });
            } else if (tab === 'unit') {
                $state.go("fd.item.itemspec.edit.unit", { itemSpecId: $stateParams.itemSpecId });
            } else if (tab === 'replenishment') {
                $state.go("fd.item.itemspec.edit.replenishment", { itemSpecId: $stateParams.itemSpecId });
            } else if (tab === 'lpConfig') {
                $state.go("fd.item.itemspec.edit.lpConfig", { itemSpecId: $stateParams.itemSpecId , lpConfigId: $stateParams.lpConfigId});
            } else if (tab === 'materialTemplate') {
                $state.go("fd.item.itemspec.edit.materialTemplate", { itemSpecId: $stateParams.itemSpecId });
            } else if (tab === 'bundle') {
                $state.go("fd.item.itemspec.edit.bundle", { itemSpecId: $stateParams.itemSpecId, customerIds: $scope.item.customerIds });
            } else if (tab === 'pickRule') {
                $state.go("fd.item.itemspec.edit.pickRule", { itemSpecId: $stateParams.itemSpecId });
            } else if (tab === 'diverseUnit') {
                $state.go("fd.item.itemspec.edit.diverseUnit", { itemSpecId: $stateParams.itemSpecId });
            }
              else if (tab === 'itemUOMPickSetting') {
                $state.go("fd.item.itemspec.edit.itemUOMPickSetting", { itemSpecId: $stateParams.itemSpecId });
            } 
            // else if (tab === 'shippingRule') {
            //     $state.go("fd.item.itemspec.edit.shippingRule", { itemSpecId: $stateParams.itemSpecId });
            // } 
            else if (tab === 'cartonConfig') {
                $state.go("fd.item.itemspec.edit.cartonConfiguration", { itemSpecId: $stateParams.itemSpecId });
            }
        };

        init();

        function init() {
            $scope.isAddAction = $stateParams.itemSpecId ? false : true;
            if($stateParams.activeTab) {
                ctrl.changeTab($stateParams.activeTab);
            } else {
                ctrl.changeTab("itemInfo");
            }
            if ($stateParams.itemSpecId) {
                $scope.submitLabel = "Update";
                getItem($stateParams.itemSpecId);
            } else {
                $scope.submitLabel = "Save";
                $scope.item = {};
                ctrl.changeTab("itemInfo");
            }

        }
    };
    ctrl.$inject = ['$scope', '$state', '$stateParams', 'itemService'];

    return ctrl;
});
