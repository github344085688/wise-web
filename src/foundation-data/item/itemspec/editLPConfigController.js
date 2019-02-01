'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemService, inheritPropertiesService,
        lincResourceFactory, lpConfigurationTemplateService, organizationService, customerService) {
        var ctrl = this;
        var itemSpecId;
        $scope.submitLabel = "Create";
        initLPConfig();
        function initLPConfig() {
            $scope.scenes = ['stock', 'outbound', 'inbound'];
            itemSpecId = $stateParams.itemSpecId;
            $scope.lpconf = {};
            itemService.searchLPConfigs({ itemSpecId: itemSpecId }).then(function (response) {
                $scope.lpConfigs = response.lpConfigs;
                $scope.organizationMap = response.organizationMap;
                $scope.unitMap = response.unitMap;
                $scope.lpTemplateMap = response.lpTemplateMap;
                goToEditModeIfParamHasLPConfigId();
            });
            inheritProperties(itemSpecId);
            getFieldUnits();
        }

        function goToEditModeIfParamHasLPConfigId() {
             if($stateParams.lpConfigId) {
                 var foundIndex = _.findIndex($scope.lpConfigs, function(lpConfig) { return lpConfig.id === $stateParams.lpConfigId} );
                 if(foundIndex != -1) {
                     ctrl.editLPConfig(foundIndex);
                 }
             }
        }

        function inheritProperties(itemSpecId) {
            itemService.getItemById(itemSpecId).then(function (item) {
                $scope.customerId = item.customerId;
                customerService.getCustomerByOrgId(item.customerId).then(function (customer) {
                    $scope.lpconf.linearUnit = customer.linearUnit;
                    $scope.lpconf.lpConfigurationTemplateId = customer.defaultLpConfigurationTemplateId;
                });
            });
        }

        ctrl.editLPConfig = function (index) {
            resetHighLight();
            $scope.hightLights[index] = true;
            $scope.submitLabel = "Update";
            $scope.lpconf = angular.copy($scope.lpConfigs[index]);
        };

        ctrl.getItemByLP = function () {
            itemService.getItemByGroupType('Material').then(function (response) {
                $scope.availableLPTypes = response;
            });
        };

        ctrl.itemSpecIdOnSelect = function (item, productId) {
            selectItemSpec(item.id, productId);
        };

        function selectItemSpec(itemSpecId, productId, cbFunc) {
            itemService.getItemByIdAndProductId(itemSpecId, productId, false).then(function (response) {
                $scope.diverseFields = response.diverseFields;
                cbFunc(response.diverseFields);
            });
        }

        ctrl.biOnSelectPackaging = function (itemSpec) {
            ctrl.biConItemOnSelect(itemSpec.id);
        };

        ctrl.biItemDiverseValuesSelected = function (index, value, showFieldsOther) {
            diverseValuesSelected(index, value, showFieldsOther);
        };

        ctrl.lpDiverseValuesSelected = function (index, value) {
            diverseValuesSelected(index, value, $scope.lpShowfieldsOther);
        };

        function diverseValuesSelected(index, valueObj, showFieldsOther) {
            if (valueObj.value === "Other") showFieldsOther[index] = true;
            else showFieldsOther[index] = false;
        }

        function createDiverse(diverseFields, showfieldsOther, itemSpecId, cbFunction) {
            var proList = [];
            angular.forEach(diverseFields, function (field, index) {
                if (showfieldsOther[index]) {
                    proList.push({ propertyId: field.propertyId, value: field.otherValue, unit: field.otherUnit });
                } else {
                    if (field.selectedProduct) {
                        proList.push({
                            propertyId: field.propertyId, value: field.selectedProduct.value,
                            unit: field.selectedProduct.unit
                        });
                    } else {
                        proList.push({
                            propertyId: field.propertyId, value: field.value,
                            unit: field.unit
                        });
                    }
                }
            });
            itemService.searchOrUpadateDiverse(itemSpecId, proList).then(function (response) {
                cbFunction(response);
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);

            });
        }

        ctrl.saveOrUpdateLPConfig = function () {
            $scope.loading = true;
            $scope.loading = true;
            saveLpConfig();
        };

        function saveLpConfig() {
            if ($scope.lpconf.scene == "stock") {
                delete $scope.lpconf.retailerId;
            }
            if ($scope.lpconf.id) {
                itemService.updateLPConfig($scope.lpconf).then(function (response) {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(lpConfiSaveCbFun);
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            } else {
                $scope.lpconf.itemSpecId = itemSpecId;
                $scope.lpconf.channel = 'MANUAL';
                itemService.addLPConfig($scope.lpconf).then(function (response) {
                    $scope.loading = false;
                    lincUtil.saveSuccessfulPopup(lpConfiSaveCbFun);
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        }

        function lpConfiSaveCbFun() {
            $scope.lpconf = {};
            $scope.lpDiverseFields = [];
            $scope.lpShowfieldsOther = [];
            resetForm();
            initLPConfig();
        }

        ctrl.deleteLPConfig = function (index) {
            lincUtil.disableConfirmPopup('Are you sure to disable this record?', function () {
                itemService.removeLPConfig($scope.lpConfigs[index].id).then(function () {
                    lincUtil.messagePopup("Message", "Disable Successful.");
                    $scope.lpConfigs[index].status = "DISABLE";

                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });

        };

        ctrl.enableLPConfig = function (index) {
            lincUtil.enableConfirmPopup('Are you sure to enable this record?', function () {
                $scope.lpConfigs[index].status = 'ENABLE';
                itemService.updateLPConfig($scope.lpConfigs[index]).then(function () {
                    lincUtil.messagePopup("Message", "Enable Successful.");
                    $scope.lpConfigs[index].status = "ENABLE";

                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        ctrl.resetLPConfig = function () {
            lpConfiSaveCbFun();
        };

        function resetForm() {
            resetHighLight();
            $scope.submitLabel = "Create";
            $scope.forms.lpconfForm.$setPristine();
            $scope.forms.lpconfForm.$setUntouched();
        }

        ctrl.searchAvailableItemUnits = function () {

            itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (response) {
                $scope.item.units = response.units;
                $scope.unitIdMap = response.unitsMap;
            });
        };

        function getFieldUnits() {
            lincResourceFactory.getFieldUnits().then(function (response) {
                $scope.fieldUnits = response;
            });
        }

        ctrl.getLpConfigurationTemplates = function () {
            lpConfigurationTemplateService.searchLpConfigurationSingleTemplate({ "customerId": $scope.customerId}).then(function (response) {
                $scope.lpConfigurationTemplates = response;
            });
        };

        function resetHighLight() {
            $scope.hightLights = [];
        }
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemService', 'inheritPropertiesService',
        'lincResourceFactory', 'lpConfigurationTemplateService', 'organizationService', 'customerService'];

    return controller;
});
