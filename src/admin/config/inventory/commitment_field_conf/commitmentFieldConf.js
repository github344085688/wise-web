'use strict';

define([
    'angular',
    'src/admin/config/inventory/commitment_field_conf/commitmentFieldConfPageController'
], function(angular, controller) {
    angular.module('linc.admin.config.inventory.commitFieldConf', [])
        .controller('CommitmentFieldConfPageController', controller);
});