'use strict';

define([
    'angular',
    'src/yms/entry/entryListController'
], function(angular, entryListCtrl) {
    angular.module('linc.yms.entry', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('yms.entry.entryList', {
                url: '/entryList',
                templateUrl: 'yms/entry/template/entryList.html',
                controller: 'YMSEntryListController',
            });
        }])
        .controller('YMSEntryListController', entryListCtrl);
});
