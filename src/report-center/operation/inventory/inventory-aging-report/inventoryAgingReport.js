define([
  'angular',
  'src/report-center/operation/inventory/inventory-aging-report/inventoryAgingReportListController'
], function (angular,inventoryAgingReportListController) {

  angular.module('linc.rc.operation.inventory.inventoryAgingReport', [])
      .config(['$stateProvider', function ($stateProvider) {
          $stateProvider.state('rc.operation.inventory.inventoryAgingReport.list', {
              url: '/list',
              views: {
                  "unis-main@rc.operation.inventory.inventoryAgingReport.list": {
                      templateUrl: 'report-center/operation/inventory/inventory-aging-report/template/inventoryAgingReportList.html',
                      controller: 'inventoryAgingReportListController'
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
                  permissions: "report::inventoryAging_read"
              }
          });

      }])
      .controller('inventoryAgingReportListController', inventoryAgingReportListController);

});
