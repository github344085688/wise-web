define([
  'angular',
  'src/report-center/operation/inventory/turns-report/turnsListController'
], function (angular,turnsListController) {

  angular.module('linc.rc.operation.inventory.turns', [])
      .config(['$stateProvider', function ($stateProvider) {
          $stateProvider.state('rc.operation.inventory.turns.list', {
              url: '/list',
              views: {
                  "unis-main@rc.operation.inventory.turns.list": {
                      templateUrl: 'report-center/operation/inventory/turns-report/template/turnsList.html',
                      controller: 'turnsListController'
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
                  permissions: "report::inventoryTurns_read"
              }
          });

      }])
      .controller('turnsListController', turnsListController);

});
