'use strict';

define([
    'angular',
    'src/yms/black-list/blackListController'
], function(angular, blackListCtrl) {
    angular.module('linc.yms.black-list', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('yms.black-list.blackList', {
                url: '/blackList',
                templateUrl: 'yms/black-list/template/blackList.html',
                controller: 'BlackListController',
            });
        }])
        .controller("BlackListController", blackListCtrl);
});
