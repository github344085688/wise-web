'use strict';

define(['lodash',
    './factories',], function (_, factories) {

        factories.factory('materialTemplateService', function ($resource) {
            var service = {};
            var config = {
                'update': {
                    method: 'PUT'
                },
                'search': {
                    method: 'POST'

                }

            }
            service.getMaterialTemplateById = function (id) {
                return $resource('/fd-app/material-template/:id', { id: id }).get().$promise;
            };

            service.searchMaterialTemplate = function (param) {

                return $resource('/bam/material-template/search', null, config).search(param).$promise;

            };

            service.deleteMaterialTemplate = function (id) {
                return $resource('/fd-app/material-template/:id', { id: id }).delete().$promise;
            };

            service.updateMaterialTemplate = function (id, param) {
                return $resource('/fd-app/material-template/:id', { id: id }, config).update(param).$promise;
            };

            service.createMaterialTemplate = function (param) {
                return $resource('/fd-app/material-template').save(param).$promise;
            };

            return service;
        });
    });
