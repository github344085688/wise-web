'use strict';

define([
    'angular',
    './itemGroupListPageController',
    './editItemGroupPageController'
], function(angular,itemGroupListPageController, editItemGroupPageController ) {
    angular.module('linc.fd.item.itemGroup', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('fd.item.itemGroup.list', {
                    url: '/list',
                    templateUrl: 'foundation-data/item/item-group/template/itemGroupList.html',
                    controller: 'ItemGroupListPageController',
                    controllerAs: 'ctrl',
                    data: {
                        permissions: "item::itemGroup_read"
                    }
                }).state('fd.item.itemGroup.add', {
                url: '/add',
                templateUrl: 'foundation-data/item/item-group/template/editItemGroup.html',
                controller: 'EditItemGroupPageController',
                controllerAs: 'ctrl',
                resolve: {
                    'isAddAction': function(){
                        return true;
                    }
                },
                data: {
                    permissions: "item::itemGroup_write"
                }
            }).state('fd.item.itemGroup.edit', {
                url: '/edit/:itemGroupId',
                templateUrl: 'foundation-data/item/item-group/template/editItemGroup.html',
                controller: 'EditItemGroupPageController',
                controllerAs: 'ctrl',
                resolve: {
                    'isAddAction': function(){
                        return false;
                    }
                },
                data: {
                    permissions: "item::itemGroup_write"
                }
            });
        }])
        .controller('ItemGroupListPageController',itemGroupListPageController)
        .controller('EditItemGroupPageController',editItemGroupPageController);
});
