'use strict';

define([
    'angular',
    'src/wms/task/general-task/generalTask',
    'src/wms/task/receive-task/receiveTask',
    'src/wms/task/load-task/loadTask',
    'src/wms/task/pick-task/pickTask',
    'src/wms/task/qc-task/qcTask',
    'src/wms/task/pack-task/packTask',
    'src/wms/task/putaway-task/putAwayTask',
    'src/wms/task/plugin-step-into-task/pluginStepIntoTask',
    'src/wms/task/configuration-change-task/configurationChangeTask',
    'src/wms/task/replenishment-task/replenishmentTask',
    'src/wms/task/put-back-task/putBackTask',
    'src/wms/task/transload-task/transloadTask',
    'src/wms/task/movement-task/movementTask',
    'src/wms/task/inventory-movement-task/inventoryMovementTask',
    'src/wms/task/unassigned-task/unassignedTask'
], function(angular) {
    angular.module('linc.wms.task',
        ['linc.wms.task.general-task', 'linc.wms.task.receive-task',
            'linc.wms.task.load-task', 'linc.wms.task.pick-task',"linc.wms.task.qc-task",
            'linc.wms.task.pack-task','linc.wms.task.putaway-task',
            'linc.wms.task.plugin-step-into-task',
            'linc.wms.task.configuration-change-task', 'linc.wms.task.replenishment-task',
            'linc.wms.task.put-back-task',  'linc.wms.task.transload-task',
            'linc.wms.task.movement-task', 'linc.wms.task.inventory-movement-task',
            'linc.wms.task.unassigned-task'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.generalTask', {
                url: '/general-task',
                templateUrl: 'wms/task/general-task/template/generalTask.html',
                controller: 'GeneralTaskController',
                data:{
                    title:"General Task"
                }
            }).state('wms.task.putAwayTask', {
                url: '/putaway-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Put Away Task"
                }
            }).state('wms.task.receiveTask', {
                url: '/receive-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Receive Task"
                }
            }).state('wms.task.loadTask', {
                url: '/load-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Load Task"
                }
            }).state('wms.task.pickTask', {
                url: '/pick-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Pick Task"
                }
            }).state('wms.task.qcTask', {
                url: '/qc-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"QC Task"
                }
            }).state('wms.task.packTask', {
                url: '/pack-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Pack Task"
                }
            }).state('wms.task.pluginStepIntoTask', {
                url: '/plugin-step-into-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Plugin Step Into Task"
                }
            }).state('wms.task.configurationChangeTask', {
                url: '/configuration-change-task',
                templateUrl: 'wms/task/configuration-change-task/template/configurationChange.html',
                data:{
                    title:"Configuration Change Task"
                }
            }).state('wms.task.replenishmentTask', {
                url: '/replenishment-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Replenishment Task"
                }
            }).state('wms.task.putBackTask', {
                url: '/put-back-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Put Back Task"
                }
            }).state('wms.task.transloadTask', {
                url: '/transload-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Transload Task"
                }
            }).state('wms.task.movementTask', {
                url: '/movement-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Movement Task"
                }
            }).state('wms.task.inventoryMovementTask', {
                url: '/inventory-movement-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"Movement Task"
                }
            }).state('wms.task.unassignedTask', {
                url: '/unassigned-task',
                template: '<ui-view></ui-view>',
                data:{
                    title:"unassigned Task"
                }
            });
    }]);
});
