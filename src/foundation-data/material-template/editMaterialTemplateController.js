'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemService,
        materialTemplateService) {

        $scope.materialTemplate = { materialItems: [{}] };
        $scope.itemProducts = {};
        $scope.itemUnits = {};
        var materialTemplateId = $stateParams.materialTemplateId;
        init();
        function init() {
            if (materialTemplateId) {
                materialTemplateService.getMaterialTemplateById(materialTemplateId).then(function (response) {
                    $scope.materialTemplate = response;
                    for (var i in response.materialItems) {
                        getDiverseAndUnitsByItemSpec(response.materialItems[i].itemSpecId, i)
                    }
                }, function (error) {
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
                $scope.submitLabel = "Update";
                $scope.title = "Edit";
            }
            else {
                $scope.submitLabel = "Save";
                $scope.title = "Add";
            }
        }
        $scope.addMaterialItem = function (index) {
            $scope.materialTemplate.materialItems.push({});
        }

        $scope.removeMaterialItem = function (index) {
            $scope.materialTemplate.materialItems.splice(index, 1);
        };

        $scope.onSelectItemSpec = function (itemSpecId, index, itemLine) {
            itemLine.productId = null;
            itemLine.unitId = null;
            getDiverseAndUnitsByItemSpec(itemSpecId, index, itemLine)

        };

        function getDiverseAndUnitsByItemSpec(itemSpecId, index) {
            if (itemSpecId) {
                itemService.getDiverseByItemSpec(itemSpecId).then(function (response) {
                    $scope.itemProducts[index] = response.diverseItemSpecs;
                });
            }

            itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (response) {
                $scope.itemUnits[index] = response.units;

            });
        }
        $scope.saveOrUpdateMaterialTemplate = function () {
            $scope.loading = true;
            if (materialTemplateId) {
                materialTemplateService.updateMaterialTemplate(materialTemplateId, $scope.materialTemplate).then(function (response) {
                    $scope.loading = false;
                    if (response.error) {
                        lincUtil.errorPopup("Error:" + response.error);
                        return;
                    }
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go("fd.materialTemplate.list");
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
            } else {
                materialTemplateService.createMaterialTemplate($scope.materialTemplate).then(function (response) {
                    $scope.loading = false;
                    if (response.error) {
                        lincUtil.errorPopup("Error:" + response.error);
                        return;
                    }
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go("fd.materialTemplate.list");
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
            }

        }
        $scope.cancelBtn = function () {
            $state.go("fd.materialTemplate.list");
        }

    };


    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemService', 'materialTemplateService'];

    return controller;
});
