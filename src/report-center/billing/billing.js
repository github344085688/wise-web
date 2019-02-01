'use strict';

define([
    'angular',
    'src/report-center/billing/billingCheckController'
], function(angular, billingCheckController) {
    angular.module('linc.rc.billing', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('rc.billing.check', {
                url: '/check',
                views: {
                    "unis-main@rc.billing.check": {
                        templateUrl: 'report-center/billing/template/billingCheck.html',
                        controller: 'BillingCheckController'
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
                    permissions: "report::billing_read"
                }
            });
        }])
        .controller('BillingCheckController', billingCheckController);
});

