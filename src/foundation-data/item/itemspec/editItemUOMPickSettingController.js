'use strict';

define([
    'angular'
], function (angular, $) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemService, uomDefinitionService) {

        $scope.submitLabel = "Create";

        $scope.pickTypes = ['Bulk Pick', 'Pallet Pick', 'Piece Pick', 'Case Pick', 'None'];
        function searchItemUnitGroup() {
            $scope.itemUomPick = {};
            if ($stateParams.itemSpecId) {
                itemService.searchItemUnitGroup({
                    itemSpecId: $stateParams.itemSpecId
                }).then(function (response) {
                        $scope.itemUomPicks = response;
                        $scope.submitLabel = "Create";
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }
        }

        function searchUomByItemId() {
            itemService.searchItemUnits({ itemSpecId: $stateParams.itemSpecId }).then(function (response) {
                $scope.units = response.units;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }



        $scope.deleteItemUnitGroup = function (id) {
            lincUtil.deleteConfirmPopup('Are you sure to delete this record?', function () {
                itemService.deleteItemUnitGroup(id).then(function () {
                    lincUtil.messagePopup("Tip", "Delete Success",function(){
                        searchItemUnitGroup();
                    });
                });
            });
        };

        $scope.saveOrUpdateItemUnitGroup = function () {
            if ($scope.itemUomPick.id) {
                updateItemUnitGroup();
            } else {
                createItemUnitGroup();
            }
        };


        $scope.fomateUnitName =function(unitNames){
            if(unitNames){
                return unitNames.join(',');
            }
            
        }

        $scope.editItemUnitGroup = function(itemUnit,index){
            resetHighLight();
            itemUnit.unitNames = itemUnit.unitNames.toString();
            $scope.hightLights[index] = true;
            $scope.itemUomPick = itemUnit;
            $scope.submitLabel = "Update";
        }

        function resetHighLight() {
            $scope.hightLights = [];
        }

        function itemSaveCbFun() {
            $scope.forms.itemUomPickForm.$setPristine();
            $scope.forms.itemUomPickForm.$setUntouched();
            searchItemUnitGroup();
        }

        function updateItemUnitGroup() {
            $scope.loading = true;
            var params =angular.copy($scope.itemUomPick);
            params.unitNames =  [params.unitNames];
            itemService.updateItemUnitGroup(params).then(function (response) {
                $scope.loading = false;
                $scope.submitLabel = "Create";
                lincUtil.saveSuccessfulPopup(itemSaveCbFun);
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function createItemUnitGroup() {
            $scope.itemUomPick.itemSpecId = $stateParams.itemSpecId;
            var params =angular.copy($scope.itemUomPick);
            params.unitNames =  [params.unitNames];
            $scope.loading = true;
            itemService.createItemUnitGroup(params).then(function (response) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(itemSaveCbFun);
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        init();

        function init() {
            searchItemUnitGroup();
            searchUomByItemId();

        }

    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemService', 'uomDefinitionService'];

    return controller;
});