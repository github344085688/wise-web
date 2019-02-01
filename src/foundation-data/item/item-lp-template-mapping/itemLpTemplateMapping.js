'use strict';

define([
    'angular',
    './addMappingController',
    './mappingListController'
], function(angular, addMappingController, mappingListController ) {
    angular.module('linc.fd.item.item-lp-template-mapping', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('fd.item.lpTemplateMapping.list', {
                    url: '/list',
                    views: {
                        "unis-main@fd.item.lpTemplateMapping.list": {
                            templateUrl: 'foundation-data/item/item-lp-template-mapping/template/mappingList.html',
                            controller: 'ItemLpTemplate.mappingListController'
                        },
                        "@":{
                            template:""
                        },
                        "unis@": {
                            templateUrl: 'common/template/unis-main.html',
                            controller: 'DefaultMainPageController'
                        }
                    },
                    data: {
                        permissions: "item::itemLpTemplateMapping_read"
                    }
                }).state('fd.item.lpTemplateMapping.add', {
                    url: '/add',
                    views: {
                        "unis-main@fd.item.lpTemplateMapping.add": {
                            templateUrl: 'foundation-data/item/item-lp-template-mapping/template/addMapping.html',
                            controller: 'ItemLpTemplate.addMappingController'
                        },
                        "@":{
                            template:""
                        },
                        "unis@": {
                            templateUrl: 'common/template/unis-main.html',
                            controller: 'DefaultMainPageController'
                        }
                    },
                    resolve: {
                        'isAddAction': function(){
                            return true;
                        }
                    },
                    data: {
                        permissions: "item::itemLpTemplateMapping_write"
                    }
                }).state('fd.item.lpTemplateMapping.edit', {
                    url: '/edit/:id',
                    views: {
                        "unis-main@fd.item.lpTemplateMapping.edit": {
                            templateUrl: 'foundation-data/item/item-lp-template-mapping/template/addMapping.html',
                            controller: 'ItemLpTemplate.addMappingController'
                        },
                        "@":{
                            template:""
                        },
                        "unis@": {
                            templateUrl: 'common/template/unis-main.html',
                            controller: 'DefaultMainPageController'
                        }
                    },
                    resolve: {
                        'isAddAction': function(){
                            return false;
                        }
                    },
                    data: {
                        permissions: "item::itemLpTemplateMapping_write"
                    }
                });
        }])
        .controller('ItemLpTemplate.addMappingController', addMappingController)
        .controller('ItemLpTemplate.mappingListController', mappingListController);
});
