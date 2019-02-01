'use strict';

define([
    './factories',
    'lodash',
    'angular'
], function(factories, _, angular) {
    factories.factory('receiveExceptionService', function($resource) {
        var service = {};

        service.getTaskExceptions = function(taskId) {
            return $resource("/bam/inbound/task/exception/" + taskId).query().$promise;
        };
        return service;
    });


});
