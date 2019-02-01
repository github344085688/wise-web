'use strict';

define([
    'angular',
    'src/company-facility/facility/resource/location/location',
    'src/company-facility/facility/resource/virtual-location-group/virtualLocationGroup',
    'src/company-facility/facility/resource/location-tag/locationTag',
    'src/company-facility/facility/resource/item-location/itemAndLocation',
    'src/company-facility/facility/resource/location-item/locationItem',
    'src/company-facility/facility/resource/conveyor-line/conveyorLine',
    'src/company-facility/facility/resource/conveyor-branch/conveyorBranch',
    'src/company-facility/facility/resource/equipment/equipment'
], function (angular) {
    angular.module('linc.cf.facility.resource', ['linc.cf.facility.resource.location','linc.cf.facility.resource.virtualLocationGroup','linc.cf.facility.resource.locationTag','linc.cf.facility.resource.itemAndLocation'
    ,'linc.cf.facility.resource.locationItem','linc.cf.facility.resource.conveyorLine','linc.cf.facility.resource.conveyorBranch', 'linc.cf.facility.resource.equipment']).config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('cf.facility.resource.location', {
            url: '/location',
            template: '<ui-view></ui-view>'
        }).state('cf.facility.resource.virtualLocationGroup', {
            url: '/virtualLocationGroup',
            template: '<ui-view></ui-view>'
        }).state('cf.facility.resource.locationTag', {
            url: '/locationTag',
            template: '<ui-view></ui-view>'
        }).state('cf.facility.resource.itemAndLocation', {
            url: '/itemAndLocation',
            template: '<ui-view></ui-view>'
        }).state('cf.facility.resource.locationItem', {
            url: '/locationItem',
            template: '<ui-view></ui-view>'
        }).state('cf.facility.resource.conveyorLine', {
            url: '/conveyorLine',
            template: '<ui-view></ui-view>'
        }).state('cf.facility.resource.conveyorBranch', {
            url: '/conveyorBranch',
            template: '<ui-view></ui-view>'
        }).state('cf.facility.resource.equipment', {
            url: '/equipment',
            template: '<ui-view></ui-view>'
        });
    }]);
});
