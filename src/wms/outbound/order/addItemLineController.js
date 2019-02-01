'use strict';

define(['angular', 'lodash', './editableSettingForOrder'], function (angular, _, editableSettingForOrder) {
    var controller = function ($scope, $resource, lincResourceFactory, itemService, filterDiverseService,
        $mdDialog, $state, itemLine, customerId, orderStatus, customerService, lincUtil,orderService) {

        var CREATE_TITLE = "Add Item Line";
        var EDIT_TITLE = "Edit Item Line";
        var currentSelectItem;
        var diverses = [];
        var productStatuses = ["Active", "Discontinue"];

        $scope.itemHasSerialNumber = false;
        $scope.ifProductExit = true;
        $scope.ifFitStatus = true;
        var customer;
        initSet();

        function initSet() {
            $scope.customerId = customerId;
            getFieldUnits();
            if (itemLine) {
                $scope.isAddItemline = false;
                $scope.currentItem = angular.copy(itemLine);
                $scope.currentItem.snList = _.join($scope.currentItem.snList, ',');
                $scope.formTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                selectItemSpec(itemLine.itemSpecId, true);
                searchOrderLineLpTemplate(itemLine.itemSpecId);
                getCustomerByCustomerId(customerId);
            }
            else {
                $scope.isAddItemline = true;
                $scope.currentItem = {source:"MANUAL"};
                $scope.formTitle = CREATE_TITLE;
                $scope.submitLabel = "Save";
                $scope.itemSpecFields = {};
                searchOrderLineLpTemplate();
            }
            getCustomerOutboundReceiptFilterFileds();
            getFieldEditableSet();
            getOrderItemLineDynamicFields();
        }

        function getCustomerByCustomerId(customerId) {
            customerService.getCustomerByOrgId(customerId).then(function(response) {
                customer = response;
            });
        }

        function getFieldEditableSet() {
            if (orderStatus) {
                $scope.isDisabledMap = lincUtil.organizationFieldIsDisabledMap(
                    editableSettingForOrder, orderStatus, true);
            }
        }

        function getOrderItemLineDynamicFields() {
            customerService.getOrderItemLineDynamicFields(customerId).then(function (response) {
                $scope.dynamicFields = response;
            });
        }
        function selectItemSpec(itemSpecId, ifSetValue) {
            getDiverses(itemSpecId, ifSetValue);
            getItemUnits(itemSpecId);
            if (!ifSetValue) {
                $scope.currentItem.lpConfigurationId = null;
            }
            searchOrderLineLpTemplate(itemSpecId);
        }

        function getItemUnits(itemSpecId) {
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

        function searchOrderLineLpTemplate(itemSpecId) {
            $scope.orderLineLpTemplates = [];
            var params = {customerId: $scope.customerId };
            if(itemSpecId)
               params.itemSpecId = itemSpecId;
            orderService.searchOrderLineLpTemplate(params).then(function (response) {
                $scope.orderLineLpTemplates = response;
                $scope.orderLineLpTemplatesMap=_.keyBy(response,'id');
            });
        }

        function getDiverses(itemSpecId, ifSetValue) {
            itemService.getItemByIdAndProductId(itemSpecId, null, true, productStatuses).then(function (response) {
                $scope.itemHasSerialNumber = response.hasSerialNumber;
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
            $scope.ifFitStatus = true;
            if ($scope.diverseValuesMap) {
                filterDiverseService.filterDiverseByField(field.propertyId, $scope.diverseValuesMap);
            }
        };

        function getCustomerOutboundReceiptFilterFileds() {
            customerService.getCustomerByOrgId($scope.customerId).then(function (response) {
                var receiptProperties = [];
                var receiptProMap = {};
                if (itemLine) {
                    angular.forEach(itemLine.receiptProperties, function (receiptPro) {
                        receiptProMap[receiptPro.field] = receiptPro.value;
                    });
                }
                angular.forEach(response.receiptFields, function (field) {
                    if (field == "poNos") receiptProperties.push({
                        field: field,
                        fieldName: "Purchase Order No.",
                        value: receiptProMap[field]
                    });
                    else if (field == "containerNo") receiptProperties.push({
                        field: field,
                        fieldName: "Container",
                        value: receiptProMap[field]
                    });
                });
                $scope.currentItem.receiptProperties = receiptProperties;
            });
        }

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
            if (!item) return;
            $scope.ifProductExit = true;
            $scope.ifFitStatus = true;
            currentSelectItem = item;
            $scope.currentItem.unit = null;
            selectItemSpec(item.id, false);
        };

        $scope.titleOnSelect = function (selectObj) {
            if (selectObj) {
                $scope.currentItem.titleName = selectObj.name;
            } else {
                $scope.currentItem.titleName = "";
                $scope.currentItem.titleId = null;
            }
        };

        $scope.lpConfigsOnSelect = function (selectObj) {
            if (selectObj) {
                $scope.currentItem.lpConfigName = selectObj.name;
            } else {
                $scope.currentItem.lpConfigName = "";
                $scope.currentItem.lpConfigurationId = null;
            }
        }

        $scope.supplierOnSelect = function (selectObj) {
            if (selectObj) {
                $scope.currentItem.supplierName = selectObj.name;
            } else {
                $scope.currentItem.supplierName = "";
                $scope.currentItem.supplierId = null;
            }
        };

        $scope.unitOnSelect = function (unit) {
            $scope.currentItem.unitId = unit.id;
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.submit = function () {
            removeNullReceiptPropertiesFields();
           
            var saveItemLine = angular.copy($scope.currentItem);
            var snList = saveItemLine.snList ? saveItemLine.snList.split(",") : [];
            saveItemLine.snList = snList;
            saveItemLine.unitId = saveItemLine.unit.id;
            if (currentSelectItem) {
                saveItemLine.itemSpecName = currentSelectItem.name;
                saveItemLine.bundle = currentSelectItem.bundle;
                saveItemLine.desc = currentSelectItem.desc;
            }
            if(saveItemLine.lpConfigurationId){
                saveItemLine.lpTemplateName=$scope.orderLineLpTemplatesMap[saveItemLine.lpConfigurationId].name;
            }
            if ($scope.diverseFields && $scope.diverseFields.length > 0)
                setSelectedProduct($scope.diverseFields, saveItemLine, function () {
                    validateIfExitProduct(saveItemLine, function (productId) {
                        if ($scope.ifProductExit) {
                            hideDialog(saveItemLine);
                        }
                    });
                });
            else {
                saveItemLine.properties = [];
                hideDialog(saveItemLine);
            }
        };

        function removeNullReceiptPropertiesFields() {
            _.remove($scope.currentItem.receiptProperties, function (receiptProperty) {
                return _.isEmpty(receiptProperty.value);
            });
        }

        function hideDialog(saveItemLine) {
            if ($scope.formTitle == CREATE_TITLE)
                $mdDialog.hide({ itemLine: saveItemLine });
            else
                $mdDialog.hide({ itemLine: saveItemLine });
        }

        function setSelectedProduct(diverseFields, itemLine, cbFunction) {
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
            itemLine.properties = proList;
            cbFunction();
        }

        function validateIfExitProduct(itemLine, cbFunction) {
            itemService.diverseSearch({
                itemSpecId: itemLine.itemSpecId,
                diverseProperties: itemLine.properties
            }).then(function (response) {
                if (response.length <= 0) {
                    $scope.ifProductExit = false;
                } else {
                    $scope.ifProductExit = true;
                    var product = response[0];
                    if (productStatuses.indexOf(product.status) < 0) {
                        $scope.ifFitStatus = false;
                    } else {
                        $scope.ifFitStatus = true;
                        itemLine.productId = product.id;
                        cbFunction();
                    }
                }
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
        };

        $scope.isTxtDynamicField = function (dynamicName) {
            if (dynamicName.indexOf('dynTxtProperty') > -1) {
                return true;
            }
            return false;
        };

        $scope.isUpdateItemLineDisabled = function (pro) {
            if(!$scope.isDisabledMap) return false;
            if(customer && customer.allowUpdateOrderDetailWIP) {
                return false;
            }
            return $scope.isDisabledMap[pro];
        };
    };
    controller.$inject = ['$scope', '$resource', 'lincResourceFactory', 'itemService', 'filterDiverseService',
        '$mdDialog', '$state', 'item', 'customerId', 'orderStatus', 'customerService', 'lincUtil','orderService'];
    return controller;
});