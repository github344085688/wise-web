'use strict';

define([
    'angular'
], function (angular) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemService) {
        var ctrl = this;
        var itemSpecId;
        $scope.submitLabel = "Create";
        var PackagingTypeNames;
        var oldPackagingTypeId;
        var cartonConfigCtrl = {
            init: function () {
                itemSpecId = $stateParams.itemSpecId;
                itemService.searchCartonConfigs({ itemSpecId: itemSpecId }).then(function (response) {
                    $scope.itemCartonConfig = {isDefault:false};
                    $scope.itemCartonConfigs = response.itemCartonConfigs;
                    $scope.lpTypeMap = response.lpTypeMap;
                    PackagingTypeNames = _.map(response.itemCartonConfigs, 'packageTypeItemSpecId');
                });
                searchUomByItemId();
            },
            edit: function (index) {
                $scope.submitLabel = "Update";
                $scope.itemCartonConfig = angular.copy($scope.itemCartonConfigs[index]);
                oldPackagingTypeId = $scope.itemCartonConfigs[index].packageTypeItemSpecId;
            },
            add: function () {
                $scope.itemCartonConfig.itemSpecId = itemSpecId;
                if (validatePackingType()) {
                    lincUtil.messagePopup("PackagingType already existed!");
                    return;
                } else {
                    itemService.addCartonConfig($scope.itemCartonConfig).then(function (response) {
                        $scope.loading = false;
                        lincUtil.saveSuccessfulPopup(cartonConfiSaveCbFun);
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                }
            },
            update: function () {
                if (validatePackingType() && oldPackagingTypeId != $scope.itemCartonConfig.packageTypeItemSpecId) {
                    lincUtil.messagePopup("PackagingType already existed!");
                    return;
                } else {
                    itemService.updateCartonConfig($scope.itemCartonConfig).then(function (response) {
                        $scope.loading = false;
                        lincUtil.updateSuccessfulPopup(cartonConfiSaveCbFun);
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                }

            },
            delete: function (index) {
                lincUtil.deleteConfirmPopup('Are you sure to delete this record?', function () {
                    itemService.removeCartonConfigById($scope.itemCartonConfigs[index].id).then(function () {
                        // $scope.itemCartonConfigs.splice(index, 1);
                        cartonConfigCtrl.init();
                    });
                });
            }
        }

        cartonConfigCtrl.init();

        ctrl.editCartonConfig = function (index) {
            resetHighLight();
            $scope.hightLights[index] = true;
            cartonConfigCtrl.edit(index);
        };

        ctrl.getItemByLP = function () {
            itemService.getItemByGroupType('Material').then(function (response) {
                $scope.availableLPTypes = response;
            });
        };

        ctrl.saveOrUpdateCartonConfig = function () {
            if ($scope.itemCartonConfig.id) {
                cartonConfigCtrl.update();
            } else {
                cartonConfigCtrl.add();
            }
        };

        function cartonConfiSaveCbFun() {
            $scope.itemCartonConfig = {isDefault:false};
            resetForm();
            cartonConfigCtrl.init();
        }

        function validatePackingType() {
            var tip = false;
            PackagingTypeNames.forEach(function (PackagingTypeName) {
                if (PackagingTypeName === $scope.itemCartonConfig.packageTypeItemSpecId)
                    return tip = true;
            });
            return tip;
        }
        ctrl.deleteCartonConfig = function (index) {
            cartonConfigCtrl.delete(index);
        };

        ctrl.resetCartonConfig = function () {
            cartonConfiSaveCbFun();
        };

        
        function searchUomByItemId() {
            itemService.searchItemUnits({ itemSpecId: $stateParams.itemSpecId }).then(function (response) {
                $scope.units = response.units;
                $scope.unitsMap =_.keyBy(response.units,'id');
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function resetForm() {
            resetHighLight();
            $scope.submitLabel = "Create";
            $scope.forms.lpCartonConfigForm.$setPristine();
            $scope.forms.lpCartonConfigForm.$setUntouched();
        }
        function resetHighLight() {
            $scope.hightLights = [];
        }
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemService'];

    return controller;
});