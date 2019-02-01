
'use strict';

define([
    'angular',
    'lodash',
    './triggerReportController'
], function(angular, _ , triggerReportController) {
    var controller = function($scope, reportService, session, lincUtil, $mdDialog,autoDailyService) {
        $scope.reportTypes = [
            "Daily Order Process Report By Transload",
            "Daily Order Process Report",
            "Daily Inbound Report",
            "Daily Outbound Report",
            "Daily Inventory Report",
            'Imports Group Inventory Report',
            'Container POD Monitor Daily Report',
            'Daily Data Comparison Report For TPV and AMTRAN RC/DC'
        ];

        $scope.pageSize = 10;
        $scope.totalCount = 0;
        var configuration = [];
        $scope.search={
            customerId:null,
            reportType:null
        };

        function init() {
            autoReportTraceSearch(1,$scope.search);
        }

        $scope.searchReportTraces = function () {
            var searchParam = angular.copy($scope.search);
            autoReportTraceSearch(1,searchParam);
        };

        var searchInfo = {};

        function autoReportTraceSearch(currentPage, param) {
            searchInfo = param;
            param.paging={pageNo: Number(currentPage),limit:Number($scope.pageSize)};
            $scope.isLoading = true;
            autoDailyService.autoReportTraceSearch(param).then(function (data) {
                $scope.isLoading = false;
               $scope.autoReportTraces = data.autoReportTraces;
                $scope.paging = data.paging;
            },function(error) {
                $scope.isLoading = false;
                lincUtil.errorPopup(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            autoReportTraceSearch(currentPage, searchInfo);
        };

        $scope.popUpToTriggerReport  = function (item) {
            var form = {
                templateUrl: 'report-center/configuration/auto-report/template/triggerReport .html',
                locals: {
                    reportTypes: $scope.reportTypes,
                    orderId: '',
                    carrierId: ''
                },
                autoWrap: true,
                controller: triggerReportController
            };
            $mdDialog.show(form).then(function (response) {

            });
        };

        function sendReport(reportPromise,index) {
            reportPromise.then(function (data) {
                $scope.autoReportTraces[index].isReportLoading = false;
                $scope.autoReportTraces[index].status = true;
                lincUtil.saveSuccessfulPopup();
            }, function (error) {
                $scope.autoReportTraces[index].isReportLoading = false;
                lincUtil.errorPopup(error);
            });
        }

        $scope.resendReport   = function (item,index) {
            var params = {
                sendDate: item.sendTo,
                customerId: item.customerId,
                reportType: item.reportType,
            }
            switch (item.reportType) {
                case 'Daily Order Process Report By Transload':
                    item.isReportLoading=true;
                    sendReport(autoDailyService.autoDailyOrderProcessReportTpv(params),index);
                    break;
                case 'Daily Order Process Report':
                    item.isReportLoading=true;
                    sendReport(autoDailyService.autoDailyOrderProcessReport(params),index);
                    break;
                case 'Daily Inbound Report':
                    item.isReportLoading=true;
                    sendReport(autoDailyService.autoDailyInboundReport(params),index);
                    break;
                case 'Daily Outbound Report':
                    item.isReportLoading=true;
                    sendReport(autoDailyService.autoDailyoutboundReport(params),index);
                    break;
                case 'Daily Inventory Report':
                    item.isReportLoading=true;
                    sendReport(autoDailyService.autoDailyInventoryReport(params),index);
                    break;
                case 'Imports Group Inventory Report':
                    item.isReportLoading=true;
                    sendReport(autoDailyService.importsGroupInventoryReport(params),index);
                    break;
                default:
            }
        };

        init();

    };

    controller.$inject = ['$scope', 'reportService', 'session', 'lincUtil','$mdDialog','autoDailyService'];
    return controller;
});