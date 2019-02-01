'use strict';
    define([
        'angular',
        'lodash'
    ], function (angular, _) {
        var controller = function ($scope,  $http,  lincUtil, reportService) {
            $scope.search = {};
            $scope.pageSize = 10;
            var currentViewPage;
            $scope.receiptStatus= [{ name: 'Imported', dbName: 'IMPORTED' }, { name: 'Open', dbName: 'OPEN' }, { name: 'Appointment Made', dbName: 'APPOINTMENT_MADE' }];
             $scope.search.receiptStatuses =['IMPORTED','OPEN','APPOINTMENT_MADE']
            $scope.search.reportType = "INBOUND_SCHEDULE";
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
                if(param.createdTimeFrom){
                    param.createdTimeFrom=lincUtil.fomateStartDate(new Date(param.createdTimeFrom));
                }
                if(param.createdTimeTo){
                    param.createdTimeTo=lincUtil.fomateEndDate(new Date(param.createdTimeTo));
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
                if(exportData.createdTimeFrom){
                    exportData.createdTimeFrom=lincUtil.fomateStartDate(new Date(exportData.createdTimeFrom));
                }
                if(exportData.createdTimeTo){
                    exportData.createdTimeTo=lincUtil.fomateEndDate(new Date(exportData.createdTimeTo));
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
