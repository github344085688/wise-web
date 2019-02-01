'use strict';

define([
    'angular',
    'src/wms/edi/ediLogListController',
    'src/wms/edi/ediLogViewController'
], function (angular, ediLogListController, ediLogViewController) {
    angular.module('linc.wms.edi', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('wms.edi.list', {
                url: '/list',
                views: {
                    "unis-main@wms.edi.list": {
                        templateUrl: 'wms/edi/template/ediLogList.html',
                        controller: 'EdiLogListController'
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
            }).state('wms.edi.view', {
                url: '/view/:ediId',
                views: {
                    "unis-main@wms.edi.view": {
                        templateUrl: 'wms/edi/template/ediLogView.html',
                        controller: 'EdiLogViewController'
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
            });
        }])
        .controller("EdiLogListController", ediLogListController)
        .controller("EdiLogViewController", ediLogViewController);


});
