'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope,  $http,  lincUtil, reportService) {
        $scope.search = {};
        $scope.pageSize = 10;
        $scope.orderStatuses = [{ name: 'Shipped', dbName: 'SHIPPED' }, { name: 'Short Shipped', dbName: 'SHORT_SHIPPED' }, { name: 'Partial Shipped', dbName: 'PARTIAL_SHIPPED' }];
        $scope.search.statuses=['SHIPPED','SHORT_SHIPPED','PARTIAL_SHIPPED' ]
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
            var param ={}
            _.forEach($scope.search, function(value, key) {
                if(value){
                    param[key]=value;
                }
            });
            if(param.shippedTimeFrom){
                param.shippedTimeFrom=lincUtil.fomateStartDate(new Date(param.shippedTimeFrom));
            }
            if(param.shippedTimeTo){
                param.shippedTimeTo=lincUtil.fomateEndDate(new Date(param.shippedTimeTo));
            }
            if(param.orderedDateFrom){
                param.orderedDateFrom=lincUtil.fomateStartDate(new Date(param.orderedDateFrom));
            }
            if(param.orderedDateTo){
                param.orderedDateTo=lincUtil.fomateEndDate(new Date(param.orderedDateTo));
            }
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            reportService.searchShippingReport(param).then(function (response) {
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
                case 'Order Level':
                    exportUrl='/report-center/outbound/shipping-report/order-level/download';
                    exportName="orderLevelReport.xlsx";
                    break;
                case 'Item Level (By Order)':
                    exportUrl='/report-center/outbound/shipping-report/itemline-level/download';
                    exportName="itemLevel-by-order.xlsx";
                    break;
                case 'Item Level (By Load)':
                    exportUrl='/report-center/outbound/shipping-report/item-level/split-by-shipment-ticket/download';
                    exportName="itemLevel-by-load.xlsx";
                    break;
                default:
                    exportUrl='/report-center/outbound/shipping-report/order-level/download';
                    exportName="orderLevelReport.xlsx";
            };
            var exportData ={}
            _.forEach($scope.search, function(value, key) {
                if(value){
                    exportData[key]=value;
                }
            });
            if(exportData.shippedTimeFrom){
                exportData.shippedTimeFrom=lincUtil.fomateStartDate(new Date(exportData.shippedTimeFrom));
            }
            if(exportData.shippedTimeTo){
                exportData.shippedTimeTo=lincUtil.fomateEndDate(new Date(exportData.shippedTimeTo));
            }
            if(exportData.orderedDateFrom){
                exportData.orderedDateFrom=lincUtil.fomateStartDate(new Date(exportData.orderedDateFrom));
            }
            if(exportData.orderedDateTo){
                exportData.orderedDateTo=lincUtil.fomateEndDate(new Date(exportData.orderedDateTo));
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
                lincUtil.processErrorResponse(error);
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
