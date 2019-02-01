'use strict';

define([
    'angular'
], function (angular) {
    var controller = function ($scope, $state, $stateParams,
                               lincUtil, itemService, inheritPropertiesService) {
        var DIVERSE_ENTRY = { properties: [{ propertyId: "", value: "" }] };
        var ctrl = this;
        $scope.submitLabel = "Create";
        var itemSpecId;

        ctrl.shippingRules = ['FIFO','LIFO', 'FEFO', 'LSFO'];
        ctrl.cycle = ["Day", "Week", "Month"];
        ctrl.scenes = ["ReceiveTime", "ProductionTime"];

        init();
        function init() {
            $scope.shippingRule = angular.copy(DIVERSE_ENTRY);

            itemSpecId = $stateParams.itemSpecId;
            if (itemSpecId) {
                getItemDiverses(itemSpecId);
                searchShippingRules(itemSpecId);
            }

            initSetInheritProperties(itemSpecId);

        }

        function initSetInheritProperties(itemSpecId) {
            itemService.getItemById(itemSpecId).then(function (item) {
                if(item.groupId) {
                    inheritPropertiesService.inheritPropertiesFromGroupByGroupId($scope.shippingRule, item.groupId);
                }else {
                    inheritPropertiesService.inheritPropertiesFromCustomerByCustomerId($scope.shippingRule, item.customerId);
                }
            });
        }

        ctrl.saveOrUpdateShippingRule = function () {
            var diverse = angular.copy($scope.shippingRule);
            setSelectedProduct(diverse, function () {
                $scope.loading = true;
                if (diverse.id) {
                    itemService.updateShippingRule(diverse).then(function (response) {
                        $scope.loading = false;
                        lincUtil.saveSuccessfulPopup(saveCbFun);
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                } else {
                    diverse.itemSpecId = $stateParams.itemSpecId;
                    itemService.addShippingRule(diverse).then(function (response) {
                        $scope.loading = false;
                        lincUtil.saveSuccessfulPopup(saveCbFun);
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                }
            });
        };

        function saveCbFun() {
            resetForm();
            searchShippingRules(itemSpecId);
        }

        function searchShippingRules(itemSpecId) {
            itemService.searchShippingRules({ itemSpecId: itemSpecId }).then(function (response) {
                if (response) {
                    $scope.itemShippingRules = response.diverseShippingRules;
                    $scope.propertiesMap = response.propertiesMapObj;
                }
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }


        ctrl.resetItemShippingRule = function () {
            $scope.shippingRule = {};
            resetForm();
        };

        ctrl.editShippingRule = function (index) {
            resetHighLight();
            $scope.hightLights[index] = true;
            $scope.submitLabel = "Update";
            $scope.shippingRule = angular.copy($scope.itemShippingRules[index]);
            setDiverseFieldsValue($scope.shippingRule);
        };

        ctrl.delShippingRule = function (index) {
            lincUtil.deleteConfirmPopup('Are you sure to delete this record?', function () {
                itemService.removeShippingRule($scope.itemShippingRules[index].id).then(function () {
                    //$scope.itemShippingRules.splice(index, 1);
                    init();
                });
            });
        };

        function resetForm() {
            resetHighLight();
            $scope.forms.shippingRuleForm.$setPristine();
            $scope.forms.shippingRuleForm.$setUntouched();

            $scope.diverseUnit = angular.copy(DIVERSE_ENTRY);
            $scope.submitLabel = "Create";
        }

        /**item property*/
        function getItemDiverses(itemSpecId) {
            itemService.getDiverseByItemSpec(itemSpecId).then(function (response) {
                $scope.products = response.diverseItemSpecs;
                $scope.productsMap = response.diverseMap;
            });
        }

        function getDiverseFieldsMap() {
            var fieldMap = {};
            angular.forEach($scope.diverseFields, function (diverse) {
                fieldMap[diverse.propertyId] = diverse;
            });
            $scope.fieldMap = fieldMap;
        }

        $scope.propertyNameOnSelect = function (diverse) {
            diverse.hasSelect = true;
        };

        function setDiverseFieldsValue(diverse) {
            angular.forEach(diverse.properties, function (property) {
                property.selectedProduct = angular.copy(property);
            });
        }

        $scope.addProperty = function () {
            $scope.shippingRule.properties.push({});
        };

        $scope.removeProperty = function (index) {
            var propertyId = $scope.shippingRule.properties[index].propertyId;
            $scope.shippingRule.properties.splice(index, 1);
            if ($scope.fieldMap[propertyId]) {
                $scope.fieldMap[propertyId].hasSelect = false;
            }
        };


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
        /**end*/
    };

    controller.$inject = ['$scope', '$state', '$stateParams',
        'lincUtil', 'itemService', 'inheritPropertiesService'];

    return controller;
});
