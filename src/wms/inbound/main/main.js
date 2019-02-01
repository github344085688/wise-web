'use strict';

define([
    'angular',
    'src/wms/inbound/receipt/receipt'
], function(angular) {
    angular.module('linc.wms.inbound', ['linc.wms.inbound.receipt'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.inbound.receipt', {
                    url: '/receipt',
                    templateUrl: 'wms/inbound/receipt/template/receipt.html'
            });
        }]);
});
