'use strict';

define([
    'angular',
    'src/company-facility/facility/resource/location-tag/locationTagListController',
    'src/company-facility/facility/resource/location-tag/editLocationTagController'
], function(angular, locationTagListController, editLocationTagController) {
    angular.module('linc.cf.facility.resource.locationTag', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.facility.resource.locationTag.list', {
                url: '/list',
                views: {
                    "unis-main@cf.facility.resource.locationTag.list": {
                        templateUrl: 'company-facility/facility/resource/location-tag/template/locationTagList.html',
                        controller: 'LocationTagListController',
                        controllerAs: "ctrl"
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
                    permissions: "facility::locationTag_read"
                }
            }).state('cf.facility.resource.locationTag.add', {
                url: '/add',
                views: {
                    "unis-main@cf.facility.resource.locationTag.add": {
                        templateUrl: 'company-facility/facility/resource/location-tag/template/editLocationTag.html',
                        controller: 'EditLocationTagController',
                        controllerAs: "ctrl"
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
                    permissions: "facility::locationTag_write"
                }
            }).state('cf.facility.resource.locationTag.edit', {
                url: '/edit/:tagId',
              
                views: {
                    "unis-main@cf.facility.resource.locationTag.edit": {
                        templateUrl: 'company-facility/facility/resource/location-tag/template/editLocationTag.html',
                        controller: 'EditLocationTagController',
                        controllerAs: "ctrl"
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
                    'isAddAction' : function(){
                        return false;
                    }
                },
                data: {
                    permissions: "facility::locationTag_read"
                }
            });
        }])
        .controller("LocationTagListController", locationTagListController)
        .controller("EditLocationTagController", editLocationTagController);
});
