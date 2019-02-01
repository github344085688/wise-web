'use strict';

define([
    'angular'
], function (angular) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemService, diverseUnitService, lincResourceFactory) {
        var DIVERSE_ENTRY = { properties: [{ propertyId: "", value: "" }] };
        var itemSpecId;
        $scope.submitLabel = "Create";
        $scope.saveOrUpdate = function () {
            if ($scope.diverseUnit.properties.length === 0) {
                lincUtil.messagePopup("Tip", "There is at least one property, Please!");
            } else {
                var diverseUnit = angular.copy($scope.diverseUnit);
                setSelectedProduct(diverseUnit, function () {
                    $scope.loading = true;
                    if (diverseUnit.id) {
                        diverseUnitService.updateDiverseUnit(diverseUnit).then(function (response) {
                            $scope.loading = false;
                            lincUtil.saveSuccessfulPopup(saveCbFun);
                        }, function (error) {
                            $scope.loading = false;
                            lincUtil.processErrorResponse(error);
                        });
                    } else {
                        diverseUnit.itemSpecId = itemSpecId;
                        diverseUnitService.addDiverseUnit(diverseUnit).then(function (response) {
                            $scope.loading = false;
                            lincUtil.saveSuccessfulPopup(saveCbFun);
                        }, function (error) {
                            $scope.loading = false;
                            lincUtil.processErrorResponse(error);
                        });
                    }
                });
            }
        };

        function setSelectedProduct(diverseUnit, cbFunction) {
            var proList = [];
            angular.forEach(diverseUnit.properties, function (property) {
                if (property.selectedProduct) {
                    proList.push({
                        propertyId: property.propertyId, value: property.selectedProduct.value,
                        unit: property.selectedProduct.unit
                    });
                }
            });
            diverseUnit.properties = proList;
            cbFunction();
        }

        function saveCbFun() {
            $scope.submitLabel = "Create";
            $scope.cancel($scope.diverseUnitForm);
            searchItemUnits(itemSpecId);
        }

        $scope.removeDiverseUnit = function (index) {
            lincUtil.deleteConfirmPopup('Are you sure to delete this record?', function () {
                diverseUnitService.removeDiverseUnit($scope.diverseUnits[index].id).then(function () {
                   // $scope.diverseUnits.splice(index, 1);
                     init();
                });
            });
        };

        $scope.editDiverseUnit = function (index) {
            resetHighLight();
            $scope.hightLights[index] = true;
            $scope.submitLabel = "Update";
            $scope.diverseUnit = angular.copy($scope.diverseUnits[index]);
            setDiverseFieldsValue($scope.diverseUnit);
        };

        function setDiverseFieldsValue(diverseUnit) {
            angular.forEach(diverseUnit.properties, function (property) {
                property.selectedProduct = angular.copy(property);
            });
        }

        $scope.addProperty = function () {
            $scope.diverseUnit.properties.push({});
        };


        $scope.removeProperty = function (index) {
            var propertyId = $scope.diverseUnit.properties[index].propertyId;
            $scope.diverseUnit.properties.splice(index, 1);
            // if($scope.fieldMap[propertyId])
            // {
            //     $scope.fieldMap[propertyId].hasSelect = false;
            // }
        };

        $scope.cancel = function (form) {
            form.$setPristine();
            form.$setUntouched();
            $scope.diverseUnit = angular.copy(DIVERSE_ENTRY);
            initSetDiverseFields();
            $scope.submitLabel = "Create";
        };

        function initSetDiverseFields() {
            angular.forEach($scope.diverseFields, function (diverseField) {
                diverseField.hasSelect = false;
            });
        }

        $scope.propertyNameOnSelect = function (diverse) {
            // diverse.hasSelect = true;
        };

        function init() {
            $scope.diverseUnit = angular.copy(DIVERSE_ENTRY);
            getFieldUnits();
            itemSpecId = $stateParams.itemSpecId;
            if (itemSpecId) {
                searchItemUnits(itemSpecId);
                getItemUnits(itemSpecId);
                getItemDiverses(itemSpecId);
            }
        }

        function searchItemUnits(itemSpecId) {
            diverseUnitService.searchDiverseUnit({ itemSpecId: itemSpecId }).then(function (response) {
                $scope.diverseUnits = response.diverseUnits;
                $scope.propertiesMap = response.propertiesMapObj;
            });
        }

        function getItemDiverses(itemSpecId) {
            itemService.getItemByIdAndProductId(itemSpecId, null, false).then(function (response) {
                $scope.diverseFields = response.diverseFields;
                getDiverseFieldsMap();
            });
        }

        function getDiverseFieldsMap() {
            var fieldMap = {};
            angular.forEach($scope.diverseFields, function (diverse) {
                fieldMap[diverse.propertyId] = diverse;
            });
            $scope.fieldMap = fieldMap;
        }

        function getItemUnits(itemSpecId) {
            itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (response) {
                $scope.units = response.units;
            });
        }

        function getFieldUnits() {
            lincResourceFactory.getFieldUnits().then(function (response) {
                $scope.fieldUnits = response;
            });
        }
        init();
        function resetHighLight() {
            $scope.hightLights = [];
        }
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemService', 'diverseUnitService', 'lincResourceFactory'];

    return controller;
});
