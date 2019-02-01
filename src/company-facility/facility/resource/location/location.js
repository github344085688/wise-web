'use strict';

define([
    'angular',
    'src/company-facility/facility/resource/location/locationListController',
    'src/company-facility/facility/resource/location/editLocationController',
    'src/company-facility/facility/resource/location/quickAddLocationController'
], function(angular, locationListCtrl, editLocationCtrl,quickAddLocationCtrl) {
    angular.module('linc.cf.facility.resource.location', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.facility.resource.location.list', {
                url: '/list',
                templateUrl: 'company-facility/facility/resource/location/template/locationList.html',
                controller: 'LocationListController',
                controllerAs: "ctrl",
                data: {
                    permissions: "facility::location_read"
                }
            }).state('cf.facility.resource.location.add', {
                url: '/add',
                templateUrl: 'company-facility/facility/resource/location/template/editLocation.html',
                controller: 'EditLocationPageController',
                controllerAs: "ctrl",
                resolve: {
                    'isAddAction': function(){
                        return true;
                    }
                },
                data: {
                    permissions: "facility::location_write"
                }
            }).state('cf.facility.resource.location.edit', {
                url: '/edit/:locationId',
                templateUrl: 'company-facility/facility/resource/location/template/editLocation.html',
                controller: 'EditLocationPageController',
                controllerAs: "ctrl",
                resolve: {
                    'isAddAction' : function(){
                        return false;
                    }
                },
                data: {
                    permissions: "facility::location_write"
                }
            }).state('cf.facility.resource.location.quickAdd', {
                url: '/quickAdd',
                templateUrl: 'company-facility/facility/resource/location/template/quickAddLocation.html',
                controller: 'QuickAddLocationController',
                controllerAs: "ctrl",
                resolve: {
                    'isAddAction' : function(){
                        return false;
                    }
                },
                data: {
                    permissions: "facility::location_write"
                }
            });
        }])
        .controller("LocationListController", locationListCtrl)
        .controller("EditLocationPageController", editLocationCtrl)
        .controller("QuickAddLocationController",quickAddLocationCtrl);

});
