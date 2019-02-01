'use strict';

define(['lodash',
    './factories',], function (_, factories) {

        factories.factory('taskTemplateService', function ($resource) {
            var service = {};
            var config = {
                'update': {
                    method: 'PUT'
                },
                'search': {
                    method: 'POST'

                }

            }
            service.getTaskTemplateById = function (id) {
                return $resource('/fd-app/task-template/:templateId', { templateId: id }).get().$promise;
            };

            service.searchTaskTemplateGroupFromBam = function (param) {

                return $resource('/bam/task-template/search', null, config).search(param).$promise;

            };
             service.searchTaskTemplate = function (param) {

                return $resource('/task-template/search', null, config).search(param).$promise;

            };
                       
            service.deleteTaskTemplate = function (id) {
                return $resource('/fd-app/task-template/:templateId', { templateId: id }).delete().$promise;
            };

            service.updateTaskTemplate = function (id, param) {
                return $resource('/fd-app/task-template/:templateId', { templateId: id }, config).update(param).$promise;
            };

            service.createTaskTemplate = function (param) {
                return $resource('/fd-app/task-template').save(param).$promise;
            };
            
            return service;
        });
    });
