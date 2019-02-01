/**
 * Created by Giroux on 2017/1/18.
 */

'use strict';

define([
    'angular',
    './generalTaskController'
], function(angular, GeneralTaskController) {
    angular.module('linc.wms.task.general-task', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('wms.task.generalTask.list', {
                    url: '/list',
                    templateUrl: 'wms/task/general-task/template/generalTask.html',
                    controller: 'GeneralTaskController',
                    data: {
                        permissions: "task::generalTask_read"
                    }
                });
        }])
        .controller('GeneralTaskController', GeneralTaskController)
});
