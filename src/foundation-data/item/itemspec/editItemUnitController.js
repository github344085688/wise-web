'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemService,
                               uomDefinitionService, lincResourceFactory, customerService) {
        var ctrl = this;
        $scope.unit = {};

        initItemUnit();
        function initItemUnit() {
            $scope.submitLabel = "Create";
            $scope.unit.isDefaultUnit = false;
            $scope.unit.isBaseUnit = false;
            if ($stateParams.itemSpecId) {
                itemService.searchItemUnits({ itemSpecId: $stateParams.itemSpecId }).then(function (response) {
                    $scope.item = {};
                    $scope.item.units = response.units;
                    $scope.unitIdMap = response.unitsMap;
                });
                uomDefinitionService.searchUomDefinitionsByItemId({itemSpecId: $stateParams.itemSpecId})
                    .then(function (response) {
                    $scope.uomDefinitions = response;
                });
            }
            getFieldUnits();
            inheritProperties($stateParams.itemSpecId);
        }

        function inheritProperties(itemSpecId) {
            itemService.getItemById(itemSpecId).then(function (item) {
                customerService.getCustomerByOrgId(item.customerId).then(function (customer) {
                    $scope.unit.linearUnit = customer.linearUnit;
                    $scope.unit.weightUnit = customer.weightUnit;
                    $scope.unit.priceUnit = customer.currency;
                });
            });
        }

        ctrl.getUnitName = function (unitId) {
            if ($scope.unitIdMap && $scope.unitIdMap[unitId]) {
                return $scope.unitIdMap[unitId].name;
            } else return "";
        };

        ctrl.insideUnitSelect = function (unit) {
            $scope.insideUnit = unit;
        };

        function validateUnitName() {
            if ($scope.unit.id) {
                var unit = $scope.item.units[_.findIndex($scope.item.units, function (unit) {
                    return unit.id === $scope.unit.insideUnitId;
                })];
                if (unit) return unit.name !== $scope.unit.name;

            } else {
                _.forEach($scope.item.units, function (insideUnit) {
                    if ($scope.unit.name === insideUnit.name) {
                        return false;
                    }
                });
            }
            return true;
        }

        ctrl.saveOrUpdateItemUnit = function () {
            if (!validateUnitName()) {
                lincUtil.messagePopup("UnitName already existed!");
                return;
            }
            var unit = angular.copy($scope.unit);
            if (unit.id) {
                if (unit.isBaseUnit) {
                    unit.qty = null;
                    unit.insideUnitId = null;
                }
                itemService.updateItemUnit(unit).then(function (response) {
                    lincUtil.saveSuccessfulPopup();
                    $scope.unit = {};
                    resetForm();
                    initItemUnit();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            } else {
                //Add
                unit.itemSpecId = $stateParams.itemSpecId;
                if (!unit.defaultConf) {
                    unit.defaultConf = false;
                }
                itemService.addItemUnit(unit).then(function (response) {
                    lincUtil.saveSuccessfulPopup();
                    $scope.unit = {};
                    resetForm();
                    initItemUnit();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }
        };

        ctrl.deleteItemUnit = function (index) {
            lincUtil.disableConfirmPopup('Are you sure to disable this record?', function () {
                itemService.removeItemUnit($scope.item.units[index].id).then(function () {
                    lincUtil.messagePopup("Message", "Disable Successful.");
                    $scope.item.units[index].status = "DISABLE";

                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        ctrl.enableItemUnit = function (index) {

            lincUtil.enableConfirmPopup('Are you sure to enable this record?', function () {
                $scope.item.units[index].status = 'ENABLE';
                itemService.updateItemUnit($scope.item.units[index]).then(function () {
                    lincUtil.messagePopup("Message", "Enable Successful.");
                    $scope.item.units[index].status = "ENABLE";

                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        }
        ctrl.editItemUnit = function (index) {
            resetHighLight();
            $scope.hightLights[index] = true;
            $scope.unit = angular.copy($scope.item.units[index]);
            $scope.submitLabel = "Update";
        };

        ctrl.resetItemUnit = function () {
            resetForm();
            $scope.unit = {};
        };

        function resetForm() {
            resetHighLight();
            $scope.submitLabel = "Create";
            $scope.forms.unitForm.$setPristine();
            $scope.forms.unitForm.$setUntouched();
        }

        function getFieldUnits() {
            lincResourceFactory.getFieldUnits().then(function (response) {
                $scope.fieldUnits = response;
            });
        }
        function resetHighLight() {
            $scope.hightLights = [];
        }
        $scope.setQtyAndUom = function (){
            $scope.unit.qty = null;
            $scope.unit.insideUnitId = null;
        }
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil',
        'itemService', 'uomDefinitionService', 'lincResourceFactory', 'customerService'];

    return controller;
});
