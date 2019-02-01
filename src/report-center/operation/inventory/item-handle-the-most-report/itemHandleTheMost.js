define([
  'angular',
  'src/report-center/operation/inventory/item-handle-the-most-report/itemHandleTheMostReportListController'
], function (angular,itemHandleTheMostReportListController) {

  angular.module('linc.rc.operation.inventory.itemHandleTheMostReport', [])
      .config(['$stateProvider', function ($stateProvider) {
          $stateProvider.state('rc.operation.inventory.itemHandleTheMostReport.list', {
              url: '/list',
              views: {
                  "unis-main@rc.operation.inventory.itemHandleTheMostReport.list": {
                      templateUrl: 'report-center/operation/inventory/item-handle-the-most-report/template/itemHandleTheMostReportList.html',
                      controller: 'itemHandleTheMostReportListController'
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
                  permissions: "report::itemHandleTheMost_read"
              }
          });

      }])
      .controller('itemHandleTheMostReportListController', itemHandleTheMostReportListController);

});
