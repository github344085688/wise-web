'use strict';

define([
    'angular',
    './pluginStepController'
], function(angular, pluginStepCtrl) {
    angular.module('linc.wms.task.plugin-step-into-task', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.pluginStepIntoTask.plugin', {
                    url: '/plugin',
                    templateUrl: 'wms/task/plugin-step-into-task/template/pluginStep.html',
                    controller: 'pluginStepController',
                    data: {
                        permissions: "task::pluginStep_read"
                    }
                });
        }])
        .controller('pluginStepController', pluginStepCtrl);

});
