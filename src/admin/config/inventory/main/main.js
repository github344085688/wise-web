'use strict';

define([
    'angular',
    'src/admin/config/inventory/commitment_field_conf/commitmentFieldConf'

], function(angular, controller) {
    angular.module('linc.admin.config.inventory', ['linc.admin.config.inventory.commitFieldConf'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('admin.config.inventory.commitFieldConf', {
                url: '/cfc',
                templateUrl: 'admin/config/inventory/commitment_field_conf/template/commitmentFieldConf.html',
                controller: 'CommitmentFieldConfPageController',
                data: {
                    permissions: "config::inventory_read",
                    title: "Commitment Field Configuration"
                }
            });
        }]);
});