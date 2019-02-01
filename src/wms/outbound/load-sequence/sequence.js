'use strict';

define([
    'angular',
    './loadSequenceController',
    './orderSequenceController'
], function(angular, controller, orderSequenceController) {

    angular.module('linc.wms.outbound.sequence', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.outbound.sequence.orderSequence', {
                    url: '/order-sequence/:loadId',
                    templateUrl: 'wms/outbound/load-sequence/template/orderSequence.html',
                    controller: 'OrderSequenceController'
                })
                .state('wms.outbound.sequence.loadSequence', {
                    url: '/load-sequence',
                    templateUrl: 'wms/outbound/load-sequence/template/loadSequence.html',
                    controller: 'LoadSequenceController'
                });
        }])
        .controller('SequenceController', ['$state', 'authFactory', function($state, authFactory) {
            if (!authFactory.isSignIn()) {
                $state.go('login');
            } else {
                $state.go('wms.outbound.sequence.loadSequence');
            }
        }])
        .controller('LoadSequenceController', controller)
        .controller('OrderSequenceController', orderSequenceController);
});
