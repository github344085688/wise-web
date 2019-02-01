define([
  'angular',
  'src/report-center/operation/outbound/out-of-stock-report/outOfStockReportListController',
], function (angular, outOfStockReportListController) {

  angular.module('linc.rc.operation.outbound.outOfStockReport', [])
      .config(['$stateProvider', function ($stateProvider) {
          $stateProvider.state('rc.operation.outbound.outOfStockReport.list', {
              url: '/list',
              views: {
                  "unis-main@rc.operation.outbound.outOfStockReport.list": {
                      templateUrl: 'report-center/operation/outbound/out-of-stock-report/template/outOfStockReportList.html',
                      controller: 'outOfStockReportListController'
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
                  permissions: "report::outOfStock_read"
              }
          });

      }])
      .controller('outOfStockReportListController', outOfStockReportListController);


});
