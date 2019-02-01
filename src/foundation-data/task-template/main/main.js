'use strict';

define([
    'angular',
    'src/foundation-data/task-template/taskTemplateListController',
    'src/foundation-data/task-template/editTaskTemplateController',
], function (angular, taskTemplateListController, editTaskTemplateController) {
    angular.module('linc.fd.taskTemplate', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('fd.taskTemplate.list', {
                url: '/list',
                templateUrl: 'foundation-data/task-template/template/taskTemplateList.html',
                controller: 'TaskTemplateListController',
                controllerAs: "ctrl",
                data: {
                    permissions: "taskTemplate_read"
                }
            }).state('fd.taskTemplate.edit', {
                url: '/edit/:taskTemplateId',
                templateUrl: 'foundation-data/task-template/template/editTaskTemplate.html',
                controller: 'EditTaskTemplateController',
                controllerAs: "ctrl",
                data: {
                    permissions: "taskTemplate_write"
                }
            }).state('fd.taskTemplate.add', {
                url: '/add',
                templateUrl: 'foundation-data/task-template/template/editTaskTemplate.html',
                controller: 'EditTaskTemplateController',
                controllerAs: "ctrl",
                data: {
                    permissions: "taskTemplate_write"
                }
            });
        }])
        .controller("TaskTemplateListController", taskTemplateListController)
        .controller("EditTaskTemplateController", editTaskTemplateController);

});
