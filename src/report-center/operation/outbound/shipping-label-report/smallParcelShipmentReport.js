define([
    'angular',
    'src/report-center/operation/outbound/shipping-label-report/smallParcelShipmentReportController'

], function (angular, smallParcelShipmentReportController) {

    angular.module('linc.rc.operation.outbound.smallParcelShipmentReport', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.outbound.smallParcelShipmentReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.outbound.smallParcelShipmentReport.list": {
                        templateUrl: 'report-center/operation/outbound/shipping-label-report/template/smallParcelShipmentReport.html',
                        controller: 'smallParcelShipmentReportController'
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    permissions: "report::smallParcelShipmentReport_read"
                }
            })
        }])
        .controller('smallParcelShipmentReportController', smallParcelShipmentReportController);

});
