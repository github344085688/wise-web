'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $resource, lincResourceFactory,
                               itemService, receiptService, customerService, organizationService, lincUtil,
        $mdDialog, $state, itemLine, customerId, status) {

        var CREATE_TITLE = "Add Item Line";
        var EDIT_TITLE = "Edit Item Line";
        $scope.itemHasSerialNumber = false;
        $scope.showfieldsOther = [];
        $scope.ifFitStatus = true;
        var currentSelectItem;
        var currentSelectSupplier;
        initSet();
        function initSet() {
            $scope.customerId = customerId;
            $scope.status = status;
            getFieldUnits();
            if (itemLine) {
                $scope.currentItem = angular.copy(itemLine);
                $scope.currentItem.snList = _.join($scope.currentItem.snList, ',');
                $scope.formTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                getItemDetail(itemLine.itemSpecId, itemLine.productId);
            }
            else {
                $scope.currentItem = {source:"MANUAL"};
                $scope.formTitle = CREATE_TITLE;
                $scope.itemSpecFields = {};
                $scope.submitLabel = "Save";
            }
            getFieldEditableSet();
            getReceiptItemLineDynamicFields();
        }

        function getReceiptItemLineDynamicFields() {
            customerService.getReceiptItemLineDynamicFields(customerId).then(function (response) {
                $scope.dynamicFields = response;
            })
        }

        function getFieldEditableSet() {
            if (status) {
                receiptService.getFieldEditableSet(status, true, function (isDisabledMap) {
                    $scope.isDisabledMap = angular.copy(isDisabledMap);
                });
            }
        }

        $scope.diverseValuesSelected = function (index, valueObj) {
            $scope.ifFitStatus = true;
            if (valueObj.value === "Other") $scope.showfieldsOther[index] = true;
            else $scope.showfieldsOther[index] = false;
        };

        function addOtherToDiverseFieldOptions() {
            angular.forEach($scope.diverseFields, function (field, key) {
                $scope.showfieldsOther[key] = false;
                var values = field.availableDiverseValues;
                if (values && values.length > 0 && field.itemProperty.type != "Select") {
                    field.availableDiverseValues.push({ value: "Other", unit: null });
                }
            });
        }

        $scope.itemSpecIdOnSelect = function (item) {
            currentSelectItem = item;
            $scope.ifFitStatus = true;
            $scope.currentItem.unit = null;
            if (item) {
                getItemDetail(item.id, $scope.currentItem.productId);
            } else {
                $scope.itemHasSerialNumber = null;
                $scope.diverseFields = [];
            }
        };

        $scope.supplierOnSelect = function (supplier) {
            currentSelectSupplier = supplier;
        };

        function getItemDetail(itemSpecId, productId) {
            itemService.getItemByIdAndProductId(itemSpecId, productId, false, ["Active"]).then(function (response) {
                $scope.itemHasSerialNumber = response.hasSerialNumber;
                $scope.diverseFields = response.diverseFields;
                $scope.requireCollectLotNoOnReceive = response.requireCollectLotNoOnReceive;
                addOtherToDiverseFieldOptions();
                if(response.suppliers && response.suppliers.length == 1) {
                    $scope.currentItem.supplierId = response.suppliers[0].id;
                }
            });

            itemService.searchItemUnits({ itemSpecId: itemSpecId,status: "ENABLE"}).then(function (unitsObj) {
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

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
            var saveItemLine = angular.copy($scope.currentItem);
            var str = saveItemLine.snList ? saveItemLine.snList.split(",") : [];
            saveItemLine.snList = str;
            saveItemLine.unitId = saveItemLine.unit.id;
            if (currentSelectItem) {
                saveItemLine.itemSpecName = currentSelectItem.name;
                saveItemLine.bundle = currentSelectItem.bundle;
                saveItemLine.desc = currentSelectItem.desc;
            }
            if (!saveItemLine.supplierId) {
                saveItemLine.supplierId = null;
            } else if (currentSelectSupplier) {
                saveItemLine.supplierName = currentSelectSupplier.name;
            }
            if(!saveItemLine.source) {
                saveItemLine.source = "MANUAL";
            } 
            if ($scope.diverseFields && $scope.diverseFields.length > 0)
                createDiverse($scope.diverseFields, saveItemLine.itemSpecId, function (response, properties) {
                    if (response.status != "Active") {
                        $scope.ifFitStatus = false;
                    } else {
                        $scope.ifFitStatus = true;
                        saveItemLine.productId = response.id;
                        saveItemLine.diverse = { diverseProperties: properties };
                        hideDialog(saveItemLine);
                    }
                });
            else {
                saveItemLine.productId = null;
                saveItemLine.diverse = { diverseProperties: [] };
                hideDialog(saveItemLine);
            }
        };

        function hideDialog(saveItemLine) {
            if ($scope.formTitle == CREATE_TITLE)
                $mdDialog.hide({ itemLine: saveItemLine });
            else
                $mdDialog.hide({ itemLine: saveItemLine });
        }

        $scope.getTitles = function (param) {
            return lincResourceFactory.getTitles(param).then(function (response) {
                $scope.titleList = response;
            });
        };

        function createDiverse(diverseFields, itemSpecId, cbFunction) {
            var proList = [];
            angular.forEach(diverseFields, function (field, index) {
                var pro = { propertyId: field.propertyId, name: field.itemProperty.name };
                if ($scope.showfieldsOther[index]) {
                    pro.value = field.otherValue;
                    pro.unit = field.otherUnit;
                } else {
                    if (field.selectedProduct) {
                        pro.value = field.selectedProduct.value;
                        pro.unit = field.selectedProduct.unit;
                    } else {
                        pro.value = field.value;
                        pro.unit = field.unit;
                    }
                }
                proList.push(pro);
            });

            itemService.searchOrUpadateDiverse(itemSpecId, proList).then(function (response) {
                cbFunction(response, proList);
            });
        }

        function getFieldUnits() {
            lincResourceFactory.getFieldUnits().then(function (response) {
                $scope.fieldUnits = response;
            });
        }
        $scope.isDataDynamicField = function (dynamicName) {

            if (dynamicName.indexOf('dynDateProperty') > -1) {
                return true;
            }

            return false;
        }

        $scope.isTxtDynamicField = function (dynamicName) {
            if (dynamicName.indexOf('dynTxtProperty') > -1) {
                return true;
            }
            return false;
        }
    };
    controller.$inject = ['$scope', '$resource', 'lincResourceFactory', 'itemService', 'receiptService',
        'customerService', 'organizationService', 'lincUtil',
        '$mdDialog', '$state', 'itemLine', 'customerId', 'status'];
    return controller;
});