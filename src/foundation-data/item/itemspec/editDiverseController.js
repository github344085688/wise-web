'use strict';

define([
    'angular'
], function(angular) {
    var controller = function($scope, $state, $stateParams, lincUtil, itemService, lincResourceFactory) {
        var itemSpecId;
        var copyFieldMap;
        
        $scope.showfieldsOther = [];
        initDiverse();
        function initDiverse() {
            $scope.submitLabel = "Create";
            itemSpecId = $stateParams.itemSpecId;
            $scope.diverse = {itemSpecId: itemSpecId, status: "Active"};
            getItemDiverseInfo();
            getFieldUnits();
        }

        function getItemDiverseInfo() {
            getItemDiverses($stateParams.itemSpecId);
            getItemById($stateParams.itemSpecId);
        }

        function getItemDiverses(itemSpecId) {
            itemService.diverseSearch({itemSpecId: itemSpecId}).then(function(response) {
                $scope.itemDiverses = response;
            }, function(error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function getItemById(itemSpecId) {
            itemService.getItemByIdAndProductId(itemSpecId, null, false).then(function(response) {
                $scope.diverseFields = response.diverseFields;
                if(!$scope.fieldMap) {
                    initDiverseFieldsMap();
                }else {
                    $scope.fieldMap = angular.copy(copyFieldMap);
                    copyFieldMap = {};
                }
                addOtherToDiverseFieldOptions();
            });
        }

        function initDiverseFieldsMap() {
            $scope.fieldMap = {};
            angular.forEach($scope.diverseFields, function (field, key) {
                $scope.fieldMap[field.propertyId] = angular.copy(field);
            });
        }

        $scope.diverseValuesSelected = function (index, valueObj) {
            if(valueObj.value === "Other")    $scope.showfieldsOther[index] = true;
            else  $scope.showfieldsOther[index] = false;
        };

        function addOtherToDiverseFieldOptions() {
            angular.forEach($scope.diverseFields, function (field, key) {
                var values = field.availableDiverseValues;
                if(values && values.length > 0 && field.itemProperty.type != "Select")
                {
                    field.availableDiverseValues.push({value:"Other", unit:null});
                }
                $scope.showfieldsOther[key] = false;
            });
        }

        $scope.saveItemDiverse = function (){
            var diverse = angular.copy($scope.diverse);
            diverse.diverseProperties = createDiverse($scope.diverseFields);
            if(diverse.id)
            {
                $scope.loading = true;
                itemService.updateDiverse(diverse).then(function (response) {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(itemDiverseSaveCbFun);
                },  function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }else
            {
                $scope.loading = true;
                itemService.addDiverse(diverse).then(function (response) {
                    $scope.loading = false;
                    lincUtil.saveSuccessfulPopup(itemDiverseSaveCbFun);
                },  function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        };

        $scope.editDiverse = function (itemDiverse,index) {
            resetHighLight();
            $scope.hightLights[index] = true;
            lincUtil.confirmPopup("Tip", "May affect the inventory, are you sure to change this diverse?", function () {
                $scope.diverse = angular.copy(itemDiverse);
                $scope.submitLabel = "Update";
                setEditDiverseValue($scope.diverse);
            });
        };

        function createDiverse(diverseFields) {
            copyFieldMap = angular.copy($scope.fieldMap);
            var proList = [];
            angular.forEach(diverseFields, function (diverseField, index)
            {
                var field = $scope.fieldMap[diverseField.propertyId];
                var pro = {propertyId: field.propertyId, name:field.itemProperty.name};
                if($scope.showfieldsOther[index])
                {
                    pro.value = field.otherValue;
                    pro.unit = field.otherUnit;
                    copyFieldMap[diverseField.propertyId].selectedProduct = angular.copy(pro);
                    copyFieldMap[diverseField.propertyId].otherValue = null;
                    copyFieldMap[diverseField.propertyId].otherUnit = null;
            }else
                {
                    if(field.selectedProduct)
                    {
                        pro.value = field.selectedProduct.value;
                        pro.unit = field.selectedProduct.unit;
                    }else
                    {
                        pro.value = field.value;
                        pro.unit = field.unit;
                    }
                }
                proList.push(pro);
            });
            return proList;
        }

        function setEditDiverseValue(diverse)
        {
            var propertyMap = {};
            angular.forEach(diverse.diverseProperties, function (property) {
                propertyMap[property.propertyId] =  property;
             });
            angular.forEach($scope.diverseFields, function (field)
            {
                var property =  propertyMap[field.propertyId];
                $scope.fieldMap[field.propertyId].selectedProduct = {value:property.value, unit: property.unit};
            });
        }

        function itemDiverseSaveCbFun () {
            resetForm();
            getItemDiverseInfo();
        }

        $scope.resetItemDiverse = function()
        {
            resetForm();
            initDiverseFieldsMap();
        };

        function resetForm() {
            resetHighLight();
            $scope.submitLabel = "Create";
            $scope.diverse = {itemSpecId: itemSpecId, status: "Active"};
            $scope.itemDiverseForm.$setPristine();
            $scope.itemDiverseForm.$setUntouched();
        }

        function getFieldUnits() {
            lincResourceFactory.getFieldUnits().then(function (response) {
                $scope.fieldUnits = response;
            });
        }

        $scope.getStatusList = function(name) {
            return lincResourceFactory.getItemStatus(name).then(function(response) {
                $scope.statusList = response;
            });
        };
          function resetHighLight() {
            $scope.hightLights = [];
        }
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemService', 'lincResourceFactory'];

    return controller;
});
    