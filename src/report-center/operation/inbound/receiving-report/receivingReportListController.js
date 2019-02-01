'use strict';
    define([
        'angular',
        'lodash'
    ], function (angular, _) {
        var controller = function ($scope,  $http,  lincUtil, reportService) {
            $scope.search = {};
            $scope.pageSize = 10;
            var currentViewPage;
            $scope.receiptStatus= [{ name: 'In Yard', dbName: 'IN_YARD' }, { name: 'In Progress', dbName: 'IN_PROGRESS' }, { name: 'Task Completed', dbName: 'TASK_COMPLETED' }, { name: 'Exception', dbName: 'EXCEPTION' }, { name: 'Closed', dbName: 'CLOSED' }, { name: 'Force Closed', dbName: 'FORCE_CLOSED' }, { name: 'Cancelled', dbName: 'CANCELLED' }, { name: 'Reopened', dbName: 'REOPENED' }];
             $scope.search.receiptStatuses =['IN_YARD','IN_PROGRESS','TASK_COMPLETED','EXCEPTION','CLOSED','FORCE_CLOSED','CANCELLED','REOPENED']
            $scope.search.reportType = "INBOUND_FINISHED";
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

                var param ={}
                _.forEach($scope.search, function(value, key) {
                    if(value){
                        param[key]=value;
                    }
                });
                if(param.startTime){
                    param.startTime=lincUtil.fomateStartDate(new Date(param.startTime));
                }
                if(param.endTime){
                    param.endTime=lincUtil.fomateEndDate(new Date(param.endTime));
                }
                param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
                reportService.searchReceiptReport(param).then(function (response) {
                    $scope.loading = false;
                    $scope.paging = response.paging;
                    $scope.reportHead = response.results.head;
                    $scope.reportData = response.results.data;

                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });

            };

            $scope.export = function(url) {
                if ($scope.exporting) return;
                $scope.exporting = true;
                var exportUrl;
                var exportName;
                switch(url)
                {
                    case 'Receipt Level':
                        exportUrl='/report-center/inbound/inbound-report/receipt-level/download';
                        exportName="receiptReport.xlsx";
                        break;
                    case 'Item Level':
                        exportUrl='/report-center/inbound/inbound-report/item-level/download';
                        exportName="itemLevel.xlsx";
                        break;
                    case 'LP Level':
                        exportUrl='/report-center/inbound/inbound-report/lp-level/download';
                        exportName="LPLevel.xlsx";
                        break;
                    case 'SN Level':
                        exportUrl='/report-center/inbound/inbound-report/sn-level/download';
                        exportName="SNLevel.xlsx";
                        break;
                    default:
                        exportUrl='/report-center/inbound/inbound-report/receipt-level/download';
                        exportName="receiptReport.xlsx";
                }
                var exportData ={}
                _.forEach($scope.search, function(value, key) {
                    if(value){
                        exportData[key]=value;
                    }
                });
                if(exportData.startTime){
                    exportData.startTime=lincUtil.fomateStartDate(new Date(exportData.startTime));
                }
                if(exportData.endTime){
                    exportData.endTime=lincUtil.fomateEndDate(new Date(exportData.endTime));
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

            function init() {
                $scope.loadContent(1);
            }

            init();

        };
        controller.$inject = ['$scope', '$http',  'lincUtil', 'reportService'];
        return controller;
    });
