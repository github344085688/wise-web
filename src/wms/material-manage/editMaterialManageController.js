'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $resource, lincResourceFactory, itemService, receiptService, orderService, materialLineService, organizationService, filterDiverseService,
        $state, $stateParams, lincUtil) {

        var CREATE_TITLE = "Add Material Line";
        var EDIT_TITLE = "Edit Material Line";
        var currentSelectItem;
        var diverses = [];
        $scope.isAddAction = true;
        $scope.materialLine = {};
        $scope.ifProductExit = true;
        initSet();

        function initSet() {

            getFieldUnits();
            if ($stateParams.materialLineId) {
                $scope.isAddAction = false;
                $scope.formTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                getMaterialLine($stateParams.materialLineId);

            }
            else {
                $scope.materialLine = {};
                $scope.formTitle = CREATE_TITLE;
                $scope.submitLabel = "Save";
                $scope.itemSpecFields = {};
            }
        }
        function getMaterialLine(materialLineId) {
            materialLineService.getMaterialLine(materialLineId).then(function (response) {
                $scope.materialLine = response;
                selectItemSpec(response.itemSpecId, true);
                if (response.receiptId) {
                    $scope.nameTip = 'Inbound';
                    $scope.materialLine.type = 'Inbound';
                }
                if (response.orderId) {
                    $scope.nameTip = 'Outbound';
                    $scope.materialLine.type = 'Outbound';
                }

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });

        }
        function selectItemSpec(itemSpecId, ifSetValue) {
            getDiverses(itemSpecId, ifSetValue);
            itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (unitsObj) {
                $scope.itemSpecUnits = unitsObj.units;
                if (!$scope.materialLine.unit) {
                    angular.forEach(unitsObj.units, function (unit) {
                        if (unit.isDefaultUnit) {
                            $scope.materialLine.unit = unit;
                            return;
                        }
                    });
                }
            });
        }

        function getDiverses(itemSpecId, ifSetValue) {
            itemService.getItemByIdAndProductId(itemSpecId, null, true, ["Active", "Discontinue"]).then(function (response) {
                $scope.diverseFields = response.diverseFields;
                if (ifSetValue) setDiverseFieldsValue($scope.diverseFields);
                itemService.getDiverseByItemSpec(itemSpecId).then(function (diversesObj) {
                    diverses = diversesObj.diverseItemSpecs;
                    $scope.diverseValuesMap = filterDiverseService.getInitDiverseValuesMap($scope.diverseFields, diverses);
                });
            });
        }

        // $scope.resetFilter = function () {
        //     $scope.diverseValuesMap = angular.copy(filterDiverseService.orginalDiverseValuesMap);
        //     $scope.diverseFields = angular.copy(filterDiverseService.orginalDiverseFields);
        //     filterDiverseService.resetFilter($scope.diverseFields);
        // };

        $scope.diverseValuesSelected = function (field) {
            $scope.ifProductExit = true;
            if ($scope.diverseValuesMap) {
                filterDiverseService.filterDiverseByField(field.propertyId, $scope.diverseValuesMap);
            }
        };

        function setDiverseFieldsValue(diverseFields) {
            var propertieMap = {};
            angular.forEach($scope.materialLine.properties, function (property) {
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
            $scope.materialLine.unit = null;
            if (item)
                selectItemSpec(item.id, false);
        };

        $scope.submit = function () {
            var saveItemLine = angular.copy($scope.materialLine);
            saveItemLine.unitId = saveItemLine.unit.id;
            if (currentSelectItem) {
                saveItemLine.itemSpecName = currentSelectItem.name;
            }
            if ($scope.diverseFields && $scope.diverseFields.length > 0){
                setSelectedProduct($scope.diverseFields, saveItemLine, function () {
                    validateIfExitProduct(saveItemLine, function () {
                        if ($scope.ifProductExit) {
                            AddOrUpdateMaterialLine(saveItemLine);
                        }
                    });
                });
            }
            else{
                AddOrUpdateMaterialLine(saveItemLine);
            }
               

        };

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

        function getReceipts(receiptInput) {
            var param = { scenario: 'Auto Complete' };
            if (receiptInput) {
                param["receiptId"] = receiptInput;
            }
            receiptService.searchReceipt(param).then(function (response) {
                $scope.receiptLists = _.map(response, 'id');
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function getOrders(orderInput) {
            var param = { scenario: 'Auto Complete' };
            if (orderInput) {
                param["orderId"] = orderInput;
            }
            orderService.searchOrder(param).then(function (orders) {
                $scope.OrderLists = _.map(orders, 'id');
            }, function (err) {
                lincUtil.errorPopup("Error:" + err.data.error);
            });

        }
        $scope.getReceiptList = function (receiptInput) {
            getReceipts(receiptInput);
        }
        $scope.getOrderList = function (orderInput) {
            getOrders(orderInput);
        }

        function AddOrUpdateMaterialLine(saveItemLine) {
            $scope.loading = true;
            if ($stateParams.materialLineId) {
                materialLineService.updateMaterialLine($stateParams.materialLineId, saveItemLine)
                    .then(function (res) {
                        lincUtil.updateSuccessfulPopup();
                        $scope.loading = false;
                        $state.go("wms.material-manage.list");
                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                        $scope.loading = false;
                    });
            } else {
                materialLineService.createMaterialLine(saveItemLine)
                    .then(function (response) {
                        $scope.loading = false;
                        lincUtil.saveSuccessfulPopup();
                        $state.go("wms.material-manage.list");
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
            }
        }
        $scope.selectMateriaType = function (name) {
            $scope.nameTip = name;
            $scope.materialLine.receiptId = null;
            $scope.materialLine.orderId = null;
        }
        $scope.cancel = function () {
            $state.go("wms.material-manage.list");
        }
    };
    controller.$inject = ['$scope', '$resource', 'lincResourceFactory', 'itemService', 'receiptService', 'orderService', 'materialLineService', 'organizationService', 'filterDiverseService', '$state', '$stateParams', 'lincUtil'];
    return controller;
});