'use strict';

define([
    'angular',
    './blackSNListController',
    './addBlackSNController',
    './importBlackSNController'
], function(angular, blackSNListController, addBlackSNController, importBlackSNController ) {
    angular.module('linc.fd.item.black-sn', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('fd.item.blackSN.list', {
                    url: '/list',
                    views: {
                        "unis-main@fd.item.blackSN.list": {
                            templateUrl: 'foundation-data/item/black-sn/template/blackSNList.html',
                            controller: 'BlackSNListController'
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
                        permissions: "item::itemBlackSN_read"
                    }
                }).state('fd.item.blackSN.add', {
                    url: '/add',
                    views: {
                        "unis-main@fd.item.blackSN.add": {
                            templateUrl: 'foundation-data/item/black-sn/template/addBlackSN.html',
                            controller: 'AddBlackSNController'
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
                        permissions: "item::itemBlackSN_write"
                    }
                })
                .state('fd.item.blackSN.import', {
                    url: '/import',
                    views: {
                        "unis-main@fd.item.blackSN.import": {
                            templateUrl: 'foundation-data/item/black-sn/template/importBlackSN.html',
                            controller: 'ImportBlackSNController'
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
                        permissions: "item::itemBlackSN_write"
                    }
                });
        }])
        .controller('BlackSNListController', blackSNListController)
        .controller('AddBlackSNController', addBlackSNController)
        .controller('ImportBlackSNController', importBlackSNController);
});
