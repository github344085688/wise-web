'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $http, lincUtil, reportService) {
        $scope.search = {};
        $scope.pageSize = 10;
        $scope.orderStatuses = [
            {name: 'Imported', dbName: 'IMPORTED'},
            { name: 'Open', dbName: 'OPEN' },
            {name: 'Committed', dbName: 'COMMITTED'},
            {name: 'Partial Committed', dbName: 'PARTIAL_COMMITTED'},
            {name: 'Commit Blocked', dbName: 'COMMIT_BLOCKED'},
            {name: 'Commit Failed', dbName: 'COMMIT_FAILED'},
            {name: 'On Hold', dbName: 'ON_HOLD'},
            {name: 'Planned', dbName: 'PLANNED'},
            {name: 'Picking',dbName: 'PICKING' },
            {name: 'Picked', dbName: 'PICKED'},
            {name: 'Packing', dbName: 'PACKING'},
            {name: 'Packed', dbName: 'PACKED'},
            {name: 'Loading', dbName: 'LOADING'},
            {name: 'Loaded', dbName: 'LOADED'},
            {name: 'reopen', dbName: 'REOPEN'},
            {name: 'cancelled', dbName: 'CANCELLED'}
          ];
        $scope.search.statuses = ['IMPORTED', 'OPEN', 'COMMITTED','PARTIAL_COMMITTED','COMMIT_BLOCKED','COMMIT_FAILED',
        'ON_HOLD','PLANNED','PICKING','PICKED','PACKING','PACKED','LOADING','LOADED','REOPEN','CANCELLED'
         ]
        var currentViewPage;

        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchReports();
            }
            $event.preventDefault();
        }

        $scope.searchReports = function () {
            $scope.loadContent(1);
        };

        $scope.loadContent = function (currentPage) {
            currentViewPage = currentPage;
            $scope.loading = true;
            var param = {}
            _.forEach($scope.search, function (value, key) {
                if (value) {
                    param[key] = value;
                }
            });
            if (param.scheduleDateFrom) {
                param.scheduleDateFrom = lincUtil.fomateStartDate(new Date(param.scheduleDateFrom));
            }
            if (param.scheduleDateTo) {
                param.scheduleDateTo = lincUtil.fomateEndDate(new Date(param.scheduleDateTo));
            }
            if (param.orderedDateFrom) {
                param.orderedDateFrom = lincUtil.fomateStartDate(new Date(param.orderedDateFrom));
            }
            if (param.orderedDateTo) {
                param.orderedDateTo = lincUtil.fomateEndDate(new Date(param.orderedDateTo));
            }
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageSize)};
            reportService.searchScheduleReport(param).then(function (response) {
                $scope.loading = false;
                $scope.paging = response.paging;
                $scope.reportHead = response.results.head;
                $scope.reportData = response.results.data;

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });

        };

        $scope.export = function (url) {
            if ($scope.exporting) return;
            $scope.exporting = true;
            var exportUrl;
            var exportName;
            switch (url) {
                case 'Order Level':
                    exportUrl = '/report-center/outbound/schedule-report/order-level/download';
                    exportName = "orderLevelReport.xlsx";
                    break;
                case 'Item Level':
                    exportUrl = '/report-center/outbound/schedule-report/itemline-level/download';
                    exportName = "itemLevel.xlsx";
                    break;
                default:
                    exportUrl = '/report-center/outbound/schedule-report/order-level/download';
                    exportName = "orderLevelReport.xlsx";
            }
            ;
            var exportData = {}
            _.forEach($scope.search, function (value, key) {
                if (value) {
                    exportData[key] = value;
                }
            });
            if (exportData.scheduleDateFrom) {
                exportData.scheduleDateFrom = lincUtil.fomateStartDate(new Date(exportData.scheduleDateFrom));
            }
            if (exportData.scheduleDateTo) {
                exportData.scheduleDateTo = lincUtil.fomateEndDate(new Date(exportData.scheduleDateTo));
            }
            if (exportData.orderedDateFrom) {
                exportData.orderedDateFrom = lincUtil.fomateStartDate(new Date(exportData.orderedDateFrom));
            }
            if (exportData.orderedDateTo) {
                exportData.orderedDateTo = lincUtil.fomateEndDate(new Date(exportData.orderedDateTo));
            }
    
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
        $scope.exportAsVizioFormat =function(){
            if ($scope.exportAsVizioFormatting) return;
            $scope.exportAsVizioFormatting = true;
              var  exportUrl = '/report-center/report/outbound-schedule-import/download';
              var exportName = "vizioFormat.xlsx";
              var exportData = {} ;
                if($scope.search.customerId){
                  exportData.customerId = $scope.search.customerId;
                }
                exportData.type = "Outbound";
                exportData.appointmentTimeFrom = lincUtil.fomateStartDate(new Date());;
                exportData.appointmentTimeTo =  lincUtil.fomateEndDate(new Date());
                $http.post(exportUrl, exportData, {
                    responseType: 'arraybuffer'
                }).then(function (res) {
                    if (res.data.byteLength == 0) {
                        lincUtil.errorPopup("Export failed!");
                        $scope.exportAsVizioFormatting = false;
                        return;
                    }
                    lincUtil.exportFile(res, exportName);
                    $scope.exportAsVizioFormatting = false;
    
                }, function (error) {
                    lincUtil.errorPopup(error);
                    $scope.exportAsVizioFormatting = false;
                });
        };
        function init() {
            $scope.loadContent(1);
        }

        init();

    };
    controller.$inject = ['$scope', '$http', 'lincUtil', 'reportService'];
    return controller;
});
