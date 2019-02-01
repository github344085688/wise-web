'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('appointmentService', function ($resource) {
        var service = {};

        var searchConfig = {
            'postSearch': {
                method: 'POST',
                isArray: true
            }
        };
        var updateConfig = {
            'update': {
                method: 'PUT'
            }
        };

        service.loadAppointmentList = function (param) {
            return $resource('/wms-app/appointment/search', null, searchConfig).postSearch(param).$promise;
        };

        service.addAppointment = function (appointment) {
            if (appointment.entryType === 'Receipt') {
                return $resource("/bam/appointment/inbound").save(appointment).$promise;
            }
            return $resource("/bam/appointment/outbound").save(appointment).$promise;
        };

        service.updateAppointment = function (id, appointment) {
            if (appointment.entryType === 'Receipt') {
                return $resource("/bam/appointment/inbound/:id", null, updateConfig).update({ id: id }, appointment).$promise;
            }
            return $resource("/bam/appointment/outbound/:id", null, updateConfig).update({ id: id }, appointment).$promise;
        };

        service.getAppointmentById = function (id) {
            return $resource("/wms-app/appointment/:id").get({ id: id }).$promise;
        };

        service.removeAppointment = function (id) {
            return $resource("/bam/appointment/:id").delete({ id: id }).$promise;
        };

        service.getAppointmentData = function (param) {
            return $resource("/bam/appointment/daily-peroid-sum", null, {
                'postSearch': {
                    method: 'POST'
                }
            }).postSearch(param).$promise;
        };

        service.appointmentStatistics = function (param) {
            return $resource('/bam/appointment/statistics', null, {
                'postSearch': {
                    method: 'POST'
                }
            }).postSearch(param).$promise;
        };

        return service;
    });
});
