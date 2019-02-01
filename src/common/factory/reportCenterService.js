'use strict';

define([
    './factories'
], function (factories) {
    factories.factory('reportCenterService', function ($q, $resource) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };
        var service = {};

        service.getAgingReportById = function (reportId) {
            return $resource('/fd-app/facility/:id').get({
                id: orgId
            }).$promise;
        };

        service.searchAgingReport = function (params) {
            // return $resource("data/rc-test.json", null, resourceConfig).search(params).$promise;
            return $resource('/data/rc-test.json').get().$promise;
        };

        service.searchActivityReport = function (params) {
            // return $resource("data/rc-test.json", null, resourceConfig).search(params).$promise;
            return $resource('/data/rc-test.json').get().$promise;
        };

        service.searchHistoryQuery = function (params) {
            // return $resource("data/rc-test.json", null, resourceConfig).search(params).$promise;
            return $resource('/data/rc-test.json').get().$promise;
        };
        service.searchCountReport = function (params) {
            // return $resource("data/rc-test.json", null, resourceConfig).search(params).$promise;
            return $resource('/data/rc-test.json').get().$promise;
        };


        service.createAgingReport = function (report) {
            return $resource("/fd-app/", resourceConfig).update(report).$promise;
        };

        service.deleteAgingReport = function (orgId) {
            return $resource("/fd-app/facility/:id", { id: orgId }).delete().$promise;
        };

        service.deliverConfirmationReport = function (param) {

            return $resource("/bam/report-center/deliver-confirmation-report", null, { 'search': { 'method': 'POST' } }).search(param).$promise;

        }
        return service;
    });
});
