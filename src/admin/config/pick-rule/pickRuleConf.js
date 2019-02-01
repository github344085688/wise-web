'use strict';

define([
    'angular',
    'src/admin/config/pick-rule/pickRuleConfController'
], function(angular, controller) {
    angular.module('linc.admin.config.pick.pick-rule-config', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('admin.config.pick.pick-rule', {
                    url: '/pick-rule',
                    templateUrl: 'admin/config/pick-rule/template/pickRuleConf.html',
                    controller: 'PickRuleConfController',
                    data: {
                        permissions: "config::pick_read",
                        title: "Pick Rule Configuration"
                    }
                });
        }])

        .controller('PickRuleConfController', controller);
});