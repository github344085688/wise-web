'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $resource, lincResourceFactory, itemService, organizationService, filterDiverseService,
                               $mdDialog, $state, materialLine, customerId) {

        var CREATE_TITLE = "Add Material Line";
        var EDIT_TITLE = "Edit Material Line";
        var currentSelectItem;
        $scope.customerId = customerId;
        var diverses = [];

        $scope.ifProductExit = true;
        initSet();
        function initSet() {

            getFieldUnits();
            if (materialLine) {
                $scope.isAddItemline = false;
                $scope.currentItem = angular.copy(materialLine);
                $scope.formTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                selectItemSpec(materialLine.itemSpecId, true);
            }
            else {
                $scope.isAddItemline = true;
                $scope.currentItem = {};
                $scope.formTitle = CREATE_TITLE;
                $scope.submitLabel = "Save";
                $scope.itemSpecFields = {};
            }
        }

        function selectItemSpec(itemSpecId, ifSetValue) {
            getDiverses(itemSpecId, ifSetValue);
            itemService.searchItemUnits({itemSpecId: itemSpecId}).then(function (unitsObj) {
                $scope.itemSpecUnits = unitsObj.units;
                if (!$scope.currentItem.unit) {
                    angular.forEach(unitsObj.units, function (unit) {
                        if (unit.isDefaultUnit) {
                            $scope.currentItem.unit = unit;
                            return;
                        }
                    });
                }
            });
        }

        function getDiverses(itemSpecId, ifSetValue) {
            itemService.getItemByIdAndProductId(itemSpecId, null, true,["Active", "Discontinue"]).then(function(response) {
                $scope.diverseFields = response.diverseFields;
                if (ifSetValue) setDiverseFieldsValue($scope.diverseFields);
                itemService.getDiverseByItemSpec(itemSpecId).then(function (diversesObj) {
                    diverses = diversesObj.diverseItemSpecs;
                    $scope.diverseValuesMap = filterDiverseService.getInitDiverseValuesMap($scope.diverseFields, diverses);
                });
            });
        }

        $scope.resetFilter = function () {
            $scope.diverseValuesMap = angular.copy(filterDiverseService.orginalDiverseValuesMap);
            $scope.diverseFields = angular.copy(filterDiverseService.orginalDiverseFields);
            filterDiverseService.resetFilter($scope.diverseFields);
        };

        $scope.diverseValuesSelected = function (field) {
            $scope.ifProductExit = true;
            if ($scope.diverseValuesMap) {
                filterDiverseService.filterDiverseByField(field.propertyId, $scope.diverseValuesMap);
            }
        };

        function setDiverseFieldsValue(diverseFields) {
            var propertieMap = {};
            angular.forEach($scope.currentItem.properties, function (property) {
                propertieMap[property.propertyId] = property;
            });
            angular.forEach(diverseFields, function (field) {
                var property = propertieMap[field.propertyId];
                if (property) {
                    field.selectedProduct = property;
                }
            });
        }

        $scope.itemSpecIdOnSelect = function (item) {
            $scope.ifProductExit = true;
            currentSelectItem = item;
            $scope.currentItem.unit = null;
            selectItemSpec(item.id, false);
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
            var saveItemLine = angular.copy($scope.currentItem);
            saveItemLine.unitId = saveItemLine.unit.id;
            if (currentSelectItem) {
                saveItemLine.itemSpecName = currentSelectItem.name;
            }
            if ($scope.diverseFields && $scope.diverseFields.length > 0)
                setSelectedProduct($scope.diverseFields, saveItemLine, function () {
                    validateIfExitProduct(saveItemLine, function () {
                        if ($scope.ifProductExit) {
                            hideDialog(saveItemLine);
                        }
                    });
                });
            else {
                hideDialog(saveItemLine);
            }
        };

        function hideDialog(saveItemLine) {
            if ($scope.formTitle == CREATE_TITLE)
                $mdDialog.hide({materialLine: saveItemLine});
            else
                $mdDialog.hide({materialLine: saveItemLine});
        }

        function setSelectedProduct(diverseFields, materialLine, cbFunction) {
            var proList = [];
            angular.forEach(diverseFields, function (field) {
                if (field.selectedProduct) {
                    proList.push({
                        propertyId: field.propertyId,
                        propertyName: field.itemProperty.name,
                        value: field.selectedProduct.value,
                        unit: field.selectedProduct.unit
                    });
                }
            });
            materialLine.properties = proList;
            cbFunction();
        }

        function validateIfExitProduct(materialLine, cbFunction) {
            itemService.diverseSearch({
                itemSpecId: materialLine.itemSpecId,
                diverseProperties: materialLine.properties
            }).then(function (response) {

                if (response.length <= 0) {
                    $scope.ifProductExit = false;
                } else {
                    $scope.ifProductExit = true;
                    cbFunction();
                }
            });
        }

        function getFieldUnits() {
            lincResourceFactory.getFieldUnits().then(function (response) {
                $scope.fieldUnits = response;
            });
        }

        $scope.titleOnSelect = function (selectObj) {
            $scope.currentItem.titleName = selectObj.name;
        }

        $scope.supplierOnSelect = function (selectObj) {
            $scope.currentItem.supplierName = selectObj.name;
        }
    };
    controller.$inject = ['$scope', '$resource', 'lincResourceFactory', 'itemService', 'organizationService', 'filterDiverseService',
        '$mdDialog', '$state', 'item', 'customerId'];
    return controller;
});