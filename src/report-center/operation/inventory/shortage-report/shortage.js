define([
    'angular',
    'src/report-center/operation/inventory/shortage-report/shortageReportController'
], function (angular,shortageReportController) {

    angular.module('linc.rc.operation.inventory.shortage', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('rc.operation.inventory.shortageReport.list', {
                url: '/list',
                views: {
                    "unis-main@rc.operation.inventory.shortageReport.list": {
                        templateUrl: 'report-center/operation/inventory/shortage-report/template/shortageReport.html',
                        controller: 'shortageReportController'
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
                    permissions: "report::inventoryShortage_read"
                }
            });

        }])
        .controller('shortageReportController', shortageReportController)

});
