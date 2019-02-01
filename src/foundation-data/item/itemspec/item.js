'use strict';

define([
    'angular',
    './itemListController',
    './editItemPageController',
    './editItemInfoController',
    './editItemAkaController',
    './editDiverseController',
    './editItemUnitController',
    './editItemReplenishController',
    './editLPConfigController',
    './editItemBundleController',
    './editItemPickRuleController',
    './editItemDiverseUnitController',
    // './editItemShippingRuleController',
    './editLpMultipleConfigurationController',
    './editItemMaterialTemplateController',
    './editItemUOMPickSettingController'
], function (angular, itemListController, editItemPageController, editItemInfoController, editItemAkaController,  editDiverseController,
    editItemUnitController, editItemReplenishController, editLPConfigController,
    editItemBundleController, editItemPickRuleController,
    editItemDiverseUnitController, editLpMultipleConfigurationController, editItemMaterialTemplateController,editItemUOMPickSettingController) {
        angular.module('linc.fd.item.itemspec', [])
            .config(['$stateProvider', function ($stateProvider) {
                $stateProvider.state('fd.item.itemspec.list', {
                    url: '/list',
                    templateUrl: 'foundation-data/item/itemspec/template/itemList.html',
                    controller: 'ItemListController',
                    data: {
                        permissions: "item::itemSpec_read"
                    }
                }).state('fd.item.itemspec.edit', {
                    url: '/edit/:itemSpecId',
                    templateUrl: 'foundation-data/item/itemspec/template/editItem.html',
                    controller: 'EditItemPageController',
                    controllerAs: "ctrl",
                    params: { itemSpecId: null , activeTab: null, lpConfigId: null},
                    data: {
                        permissions: "item::itemSpec_read"
                    }
                }).state('fd.item.itemspec.edit.info', {
                        url: '/info',
                        templateUrl: 'foundation-data/item/itemspec/template/editItemInfo.html',
                        controller: 'EditItemInfoController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null },
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    })
                    .state('fd.item.itemspec.edit.aka', {
                        url: '/aka',
                        templateUrl: 'foundation-data/item/itemspec/template/editItemAka.html',
                        controller: 'EditItemAkaController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null },
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    })
                    
                    .state('fd.item.itemspec.edit.diverse', {
                        url: '/diverse',
                        templateUrl: 'foundation-data/item/itemspec/template/editDiverse.html',
                        controller: 'EditDiverseController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null },
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    })
                    .state('fd.item.itemspec.edit.unit', {
                        url: '/unit',
                        templateUrl: 'foundation-data/item/itemspec/template/editItemUnit.html',
                        controller: 'EditItemUnitController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null },
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    })
                    .state('fd.item.itemspec.edit.replenishment', {
                        url: '/replenishment',
                        templateUrl: 'foundation-data/item/itemspec/template/editItemReplenish.html',
                        controller: 'EditItemReplenishController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null },
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    })
                    .state('fd.item.itemspec.edit.lpConfig', {
                        url: '/lpConfig',
                        templateUrl: 'foundation-data/item/itemspec/template/editLPConfig.html',
                        controller: 'EditLPConfigController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null , lpConfigId: null},
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    })
                    .state('fd.item.itemspec.edit.materialTemplate', {
                        url: '/materialTemplate',
                        templateUrl: 'foundation-data/item/itemspec/template/editItemMaterialTemplate.html',
                        controller: 'EditItemMaterialTemplateController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null },
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    })
                    .state('fd.item.itemspec.edit.bundle', {
                        url: '/bundle',
                        templateUrl: 'foundation-data/item/itemspec/template/editItemBundle.html',
                        controller: 'EditItemBundleController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null, customerIds: null },
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    })
                    .state('fd.item.itemspec.edit.pickRule', {
                        url: '/pick-rule',
                        templateUrl: 'foundation-data/item/itemspec/template/editItemPickRule.html',
                        controller: 'EditItemPickRuleController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null },
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    })
                    .state('fd.item.itemspec.edit.diverseUnit', {
                        url: '/diverse-unit',
                        templateUrl: 'foundation-data/item/itemspec/template/editItemDiverseUnit.html',
                        controller: 'EditItemDiverseUnitController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null } ,
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    }).state('fd.item.itemspec.edit.itemUOMPickSetting', {
                        url: '/uom-pick-setting',
                        templateUrl: 'foundation-data/item/itemspec/template/editItemUOMPickSetting.html',
                        controller: 'EditItemUOMPickSettingController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null } ,
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    })
                    // .state('fd.item.itemspec.edit.shippingRule', {
                    //     url: '/shipping-rule',
                    //     templateUrl: 'foundation-data/item/itemspec/template/editShippingRule.html',
                    //     controller: 'EditItemShippingRuleController',
                    //     controllerAs: 'ctrl',
                    //     params: { itemSpecId: null }
                    // })
                    .state('fd.item.itemspec.edit.cartonConfiguration', {
                        url: '/carton-configuration',
                        templateUrl: 'foundation-data/item/itemspec/template/editLpMultipleConfiguration.html',
                        controller: 'EditLpMultipleConfigurationController',
                        controllerAs: 'ctrl',
                        params: { itemSpecId: null },
                        data: {
                            permissions: "item::itemSpec_read"
                        }
                    });

            }])
            .controller('ItemListController', itemListController)
            .controller('EditItemPageController', editItemPageController)
            .controller('EditItemInfoController', editItemInfoController)
            .controller('EditItemAkaController', editItemAkaController)
    

            .controller('EditDiverseController', editDiverseController)
            .controller('EditItemUnitController', editItemUnitController)
            .controller('EditItemReplenishController', editItemReplenishController)
            .controller('EditItemMaterialTemplateController', editItemMaterialTemplateController)

            .controller('EditLPConfigController', editLPConfigController)
            .controller('EditItemBundleController', editItemBundleController)
            .controller('EditItemPickRuleController', editItemPickRuleController)

            .controller('EditItemDiverseUnitController', editItemDiverseUnitController)
            .controller('EditItemUOMPickSettingController', editItemUOMPickSettingController)
            // .controller('EditItemShippingRuleController', editItemShippingRuleController)
            .controller('EditLpMultipleConfigurationController', editLpMultipleConfigurationController);
    });
