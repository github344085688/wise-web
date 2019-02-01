'use strict';

define([
    'angular',
    'src/admin/service/main/main',
    'src/admin/config/main/main',
    'src/admin/parking/parking'
], function (angular) {

    angular.module('linc.admin.main', ['linc.admin.service', 'linc.admin.config',
             'linc.admin.parking'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('admin.service', {
                    url: '/service',
                    template: '<ui-view></ui-view>'
                })
                .state('admin.config', {
                    url: '/config',
                    template: '<ui-view></ui-view>'
                })
                .state('admin.parking', {
                    url: '/parking',
                    templateUrl: 'admin/parking/template/parking.html'
                });
        }]);
});
