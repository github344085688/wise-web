'use strict';

define([
    'angular'
], function (angular) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemService) {
        var DIVERSE_ENTRY = { items: [{}] };
        var ctrl = this;
        var itemSpecId;

        initBundle();
        function initBundle() {
            $scope.itemBundle = DIVERSE_ENTRY;
            $scope.submitLabel = "Create";

            if ($stateParams.customerIds) {
                $scope.itemCustomerId = $stateParams.customerIds[0];
            }
            itemSpecId = $stateParams.itemSpecId;
            if (itemSpecId) {
                getItemDiverses(itemSpecId);
                searchBundle(itemSpecId);
            }
        };

        ctrl.biKidItemOnSelect = function (itemSpec, bi, isFirstLoad) {
            if (!isFirstLoad) {
                bi.unitId = null;
                bi.productIds = null;
                bi.products = null;
                bi.itemPropertyMap = null;
            }
            if (itemSpecId) {

                itemService.getDiverseByItemSpec(itemSpec.id).then(function (response) {
                    bi.products = response.diverseItemSpecs;
                    bi.itemPropertyMap = response.itemPropertyMap;
                });
                getUnitsByItemSpecId(itemSpec.id, bi);
            }
        };

        function getUnitsByItemSpecId(itemSpecId, bi) {
            itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (unitsObj) {
                bi.itemSpecUnits = unitsObj.units;
                if (!bi.unitId) {
                    angular.forEach(unitsObj.units, function (unit) {
                        if (unit.isDefaultUnit) {
                            bi.unitId = unit.id;
                            return;
                        }
                    });
                }
            });
        }

        ctrl.searchAvailableItems = function (search) {
            itemService.itemSearch({ name: search }).then(function (response) {
                $scope.availableItems = response;
            });
        };

        ctrl.saveOrUpdateBundle = function () {
            var diverse = angular.copy($scope.itemBundle);
            setSelectedProduct(diverse, function () {
                if (diverse.id) {
                    $scope.loading = true;
                    itemService.updateBundle(diverse).then(function (response) {
                        $scope.loading = false;
                        lincUtil.saveSuccessfulPopup(saveCbFun);
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                } else {
                    diverse.itemSpecId = $stateParams.itemSpecId;
                    $scope.loading = true;
                    itemService.addBundle(diverse).then(function (response) {
                        $scope.loading = false;
                        lincUtil.updateSuccessfulPopup(saveCbFun);
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                }
            });
        };

        function saveCbFun() {
            resetForm();
            searchBundle(itemSpecId);
        }

        ctrl.removeBundleItem = function (index) {
            $scope.itemBundle.items.splice(index, 1);
        };

        ctrl.addBundleItem = function () {
            $scope.itemBundle.items.push({});
        };

        ctrl.cancelBundle = function () {
            resetForm();
            $scope.itemBundle = DIVERSE_ENTRY;
        };
        function resetForm() {
            resetHighLight();
            $scope.itemBundle = DIVERSE_ENTRY;
            $scope.submitLabel = "Create";
            $scope.forms.retailerCodeForm.$setPristine();
            $scope.forms.retailerCodeForm.$setUntouched();
        }

        function searchBundle(itemSpecId) {
            itemService.searchBundle({ itemSpecId: itemSpecId }).then(function (response) {
                if (response.itemBundles.length > 0) {
                    $scope.submitLabel = "Update";
                    $scope.itemBundle = response.itemBundles[0];
                    if (!$scope.itemBundle.items || $scope.itemBundle.items.length === 0) {
                        $scope.itemBundle.items = [{}];
                    } else {
                        angular.forEach($scope.itemBundle.items, function (kidItem) {
                            ctrl.biKidItemOnSelect({ id: kidItem.itemSpecId }, kidItem, true);
                        });
                    }
                }

                $scope.propertiesMap = response.propertiesMapObj;
                $scope.lpItemMap = response.lpItemMap;
                $scope.kidItemMap = response.kidItemMap;
                $scope.itemUnitMap = response.itemUnitMap;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        };

        /**item property*/
        function getDiverseFieldsMap() {
            var fieldMap = {};
            angular.forEach($scope.diverseFields, function (diverse) {
                fieldMap[diverse.propertyId] = diverse;
            });
            $scope.fieldMap = fieldMap;
        }

        function getItemDiverses(itemSpecId) {
            itemService.getDiverseByItemSpec(itemSpecId).then(function (response) {
                $scope.products = response.diverseItemSpecs;
                $scope.productsMap = response.diverseMap;
            });
        }

        function setSelectedProduct(diverse, cbFunction) {
            var proList = [];
            angular.forEach(diverse.properties, function (property) {
                if (property.selectedProduct) {
                    proList.push({
                        propertyId: property.propertyId, value: property.selectedProduct.value,
                        unit: property.selectedProduct.unit
                    });
                }
            });
            diverse.properties = proList;
            cbFunction();
        }
        function resetHighLight() {
            $scope.hightLights = [];
        }
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemService'];

    return controller;
});
