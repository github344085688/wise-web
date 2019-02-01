'use strict';

define([
    'angular',
    'src/foundation-data/pending/pendingListPageController'
], function(angular, pendingListCtrl) {

    angular.module('linc.fd.pending', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('fd.pending.list', {
                url: '/list',
                views: {
                    "unis-main@fd.pending.list": {
                        templateUrl: 'foundation-data/pending/template/list.html',
                        controller: 'PendingListCtrl',
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
                    permissions: "pending_read"
                }
            });
        }])
        .controller("PendingListCtrl", pendingListCtrl);

});
