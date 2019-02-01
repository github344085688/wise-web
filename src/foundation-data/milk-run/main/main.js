'use strict';

define([
    'angular',
    'src/foundation-data/milk-run/milkRunListController',
    'src/foundation-data/milk-run/editMilkRunController',
], function (angular, milkRunListController, editMilkRunController) {
    angular.module('linc.fd.milkRun', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('fd.milkRun.list', {
                url: '/list',
                templateUrl: 'foundation-data/milk-run/template/milkRunList.html',
                controller: 'milkRunListController',
                controllerAs: "ctrl",
                data: {
                    permissions: "milkRun_read"
                }
            }).state('fd.milkRun.edit', {
                url: '/edit/:milkRunId',
                templateUrl: 'foundation-data/milk-run/template/editMilkRun.html',
                controller: 'EditmilkRunController',
                controllerAs: "ctrl",
                data: {
                    permissions: "milkRun_write"
                }
            }).state('fd.milkRun.add', {
                url: '/add',
                templateUrl: 'foundation-data/milk-run/template/editMilkRun.html',
                controller: 'EditmilkRunController',
                controllerAs: "ctrl",
                data: {
                    permissions: "milkRun_write"
                }
            });
        }])
        .controller("milkRunListController", milkRunListController)
        .controller("EditmilkRunController", editMilkRunController);

});
