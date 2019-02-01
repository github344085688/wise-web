'use strict';

define([
    'angular',
    'src/admin/config/inventory/main/main',
    'src/admin/config/pick-rule/pickRuleConf'
], function(angular, controller) {

    angular.module('linc.admin.config', ['linc.admin.config.inventory', 'linc.admin.config.pick.pick-rule-config'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('admin.config.inventory', {
                    url: '/inventory',
                    template: '<ui-view></ui-view>'
                })
                .state('admin.config.pick', {
                    url: '/pick',
                    template: '<ui-view></ui-view>'
                });
        }]);
});
