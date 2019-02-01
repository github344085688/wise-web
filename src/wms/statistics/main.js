'use strict';

define([
    'angular',
    'src/wms/statistics/order-itemline/order-itemline'
], function (angular) {
    angular.module('linc.wms.statistics', ['linc.wms.statistics.order-itemline'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('wms.statistics', {
                    url: '/statistics',
                    template: '<ui-view></ui-view>'
                })
        }]);
});
