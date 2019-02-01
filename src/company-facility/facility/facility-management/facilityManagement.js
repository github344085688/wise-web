'use strict';

define([
    'angular',
    'src/company-facility/facility/facility-management/facilityListController',
    'src/company-facility/facility/facility-management/editFacilityController'
], function (angular, facilityListController, editFacilityController) {
    angular.module('linc.cf.facility.facility-management', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('cf.facility.facility-management.list', {
                url: '/list',
                templateUrl: 'company-facility/facility/facility-management/template/facilityList.html',
                controller: 'FacilityListCtrl',
                data: {
                    permissions: "facility::management_read"
                }
            }).state('cf.facility.facility-management.edit', {
                url: '/edit/:facilityId',
                templateUrl: 'company-facility/facility/facility-management/template/editFacility.html',
                controller: 'EditFacilityCtrl',
                resolve: {
                    'isAddAction': function () {
                        return false;
                    }
                },
                data: {
                    permissions: "facility::management_write"
                }
            });
        }])
        .controller("FacilityListCtrl", facilityListController)
        .controller("EditFacilityCtrl", editFacilityController);

});
