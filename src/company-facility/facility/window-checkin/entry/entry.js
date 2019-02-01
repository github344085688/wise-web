'use strict';

define([
    'angular',
    'src/company-facility/facility/window-checkin/entry/entryListController',
    'src/company-facility/facility/window-checkin/entry/waittingListController'
], function(angular, entryListCtrl, waittingListCtrl) {
    angular.module('linc.cf.facility.window-checkin.entry', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.facility.windowCheckin.entry.entryList', {
                url: '/entryList',
                views: {
                    "unis-main@cf.facility.windowCheckin.entry.entryList": {
                        templateUrl: 'company-facility/facility/window-checkin/entry/template/entryList.html',
                        controller: 'EntryListController'
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
                    title: "Entry List",
                    permissions: "facility::checkinEntry_read"
                }
            }).state('cf.facility.windowCheckin.entry.waittingList', {
                url: '/waittingList',
                templateUrl: 'company-facility/facility/window-checkin/entry/template/waittingList.html',
                controller: 'WaittingListController',
                data: {
                    title: "Waiting List",
                    permissions: "facility::checkinWaiting_read"
                }
            });
        }])
        .controller('EntryListController', entryListCtrl)
        .controller('WaittingListController', waittingListCtrl);
});
