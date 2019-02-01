'use strict';

define([
    'angular',
    'src/foundation-data/location-group/locationGroupListController',
    'src/foundation-data/location-group/editLocationGroupController',
   
], function(angular, locationGroupListCtrl, editLocationGroupCtrl) {
    angular.module('linc.fd.location-group', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('fd.location-group.list', {
                url: '/list',
                views: {
                    "unis-main@fd.location-group.list": {
                        templateUrl: 'foundation-data/location-group/template/locationGroupList.html',
                        controller: 'LocationGroupListController',
                        controllerAs: "ctrl"
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    permissions: "locationGroup_read"
                }
            }).state('fd.location-group.add', {
                url: '/add',
                views: {
                    "unis-main@fd.location-group.add": {
                        templateUrl: 'foundation-data/location-group/template/editLocationGroup.html',
                        controller: 'EditLocationGroupPageController',
                        controllerAs: "ctrl"
                    },
                    "@": {
                        template: ""
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
                    permissions: "locationGroup_write"
                }
            }).state('fd.location-group.edit', {
                url: '/edit/:locationGroupId',
                views: {
                    "unis-main@fd.location-group.edit": {
                        templateUrl: 'foundation-data/location-group/template/editLocationGroup.html',
                        controller: 'EditLocationGroupPageController',
                        controllerAs: "ctrl"
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                resolve: {
                    'isAddAction' : function(){
                        return false;
                    }
                },
                data: {
                    permissions: "locationGroup_write"
                }
            });
        }])
        .controller("LocationGroupListController", locationGroupListCtrl)
        .controller("EditLocationGroupPageController", editLocationGroupCtrl)

});


