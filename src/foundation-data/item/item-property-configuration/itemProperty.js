'use strict';

define([
    'angular',
    './itemPropertyListPageController',
    './editItemPropertyPageController'
], function(angular, itemPropertyListPageController, editItemPropertyPageController ) {
    angular.module('linc.fd.item.itemProperty', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('fd.item.itemProperty.list', {
                    url: '/list',
                    templateUrl: 'foundation-data/item/item-property-configuration/template/itemPropertyList.html',
                    controller: 'ItemPropertyListPageController',
                    controllerAs: 'ctrl',
                    data: {
                        permissions: "item::itemProperty_read"
                    }
                }).state('fd.item.itemProperty.add', {
                    url: '/add',
                    templateUrl: 'foundation-data/item/item-property-configuration/template/editItemProperty.html',
                    controller: 'EditItemPropertyPageController',
                    controllerAs: 'ctrl',
                    resolve: {
                        'isAddAction': function(){
                            return true;
                        }
                    },
                    data: {
                        permissions: "item::itemProperty_write"
                    }
                }).state('fd.item.itemProperty.edit', {
                    url: '/edit/:itemPropertyId',
                    templateUrl: 'foundation-data/item/item-property-configuration/template/editItemProperty.html',
                    controller: 'EditItemPropertyPageController',
                    controllerAs: 'ctrl',
                    resolve: {
                        'isAddAction': function(){
                            return false;
                        }
                    },
                    data: {
                        permissions: "item::itemProperty_write"
                    }
                });
        }])
        .controller('ItemPropertyListPageController', itemPropertyListPageController)
        .controller('EditItemPropertyPageController', editItemPropertyPageController);
});
