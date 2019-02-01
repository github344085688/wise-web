'use strict';

define([
  'angular',
  'lodash'
], function (angular, _) {
  var controller = function ($scope, $http, lincUtil, reportService) {
    $scope.search = {};
    $scope.pageSize = 10;
    $scope.statuses = ['Receiving', 'Available', 'Damage', 'Picked',
      'Packed', 'Loaded', 'UnShipped', 'OnHold', 'Reserved'];
    $scope.reportName = "";
    $scope.keyUpSearch = function ($event) {
      if (!$event) {
        return;
      }
      if ($event.keyCode === 13) {
        $scope.searchReports();
      }
      $event.preventDefault();
    }

    $scope.searchReports = function (reportName) {
      $scope.loadContent(1, reportName);
    };

    $scope.loadContent = function (currentPage, reportName) {
      var param = angular.copy($scope.search);
      if (!param.customerId) {
        $scope.isRequire = true;
        return;
      }
      if (param.statuses && param.statuses === 'UnShipped') {
        param.statuses = ['Available', 'Loaded', 'Packed', 'Picked', 'Damage', 'OnHold']
      } else if (param.statuses) {
        param.statuses = [param.statuses];
      }
      param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
      if (reportName == "Lp Level") {
        $scope.reportName = "Lp Level";
        param.reportCategory = "INVENTORY_LP_LEVEL";
        searchLpLevel(param);
      }
    };

    $scope.onSelect = function () {
      if ($scope.search.customerId) {
        $scope.isRequire = false;
      }
      else {
        $scope.isRequire = true;
      }
    }
    function searchLpLevel (param) {
      $scope.loading = true;
      reportService.searchLpLevel(param).then(function (response) {
        $scope.loading = false;
        $scope.paging = response.paging;
        $scope.reportHead = response.results.head;
        $scope.reportData = response.results.data;
      }, function (error) {
        lincUtil.processErrorResponse(error);
        $scope.loading = false;
      });
    }

    $scope.export = function (url) {
      if ($scope.exporting) return;
      var exportUrl;
      var exportName;
      var exportData = angular.copy($scope.search);

      if (exportData.statuses && exportData.statuses === 'UnShipped') {
        exportData.statuses = ['Available', 'Loaded', 'Packed', 'Picked', 'Damage', 'OnHold']
      } else if (exportData.statuses) {
        exportData.statuses = [exportData.statuses];
      }
      if (!exportData.customerId) {
        $scope.isRequire = true;
        return;
      }
      switch (url) {
        case 'Lp Level':
          exportUrl = '/report-center/inventory/lp-level/download';
          exportName = "lpLevelReport.xlsx";
          exportData.reportCategory = "INVENTORY_LP_LEVEL";
          break;
      }
      $scope.exporting = true;
      $http.post(exportUrl, exportData, {
        responseType: 'arraybuffer'
      }).then(function (res) {
        if (res.data.byteLength == 0) {
          lincUtil.errorPopup("Export failed!");
          $scope.exporting = false;
          return;
        }
        lincUtil.exportFile(res, exportName);
        $scope.exporting = false;

      }, function (error) {
        lincUtil.errorPopup(error);
        $scope.exporting = false;
      });
    };

  };
  controller.$inject = ['$scope', '$http', 'lincUtil', 'reportService'];
  return controller;
});
