'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $resource,
                               $mdDialog, $state, lincUtil, reportTypes,orderId,carrierId,autoDailyService) {
        $scope.ifProductExit = true;
        initSet();
        function initSet() {
            $scope.isLoading=false;
            $scope.reportTypes=reportTypes;
            $scope.shipments=
                {
                    carrierId:carrierId,
                    trackingNo:"",
                    itemLineDetails:[]
                };
        }
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        function sendReport(reportPromise) {
            reportPromise.then(function (data) {
                $scope.isLoading = false;
                lincUtil.saveSuccessfulPopup();
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.errorPopup(error);
            });
        }

        $scope.submit = function () {
            if($scope.search.reportType && $scope.search.customerId && $scope.search.sendDate){
                switch ($scope.search.reportType) {
                    case 'Daily Order Process Report By Transload':
                        $scope.isLoading=true;
                        sendReport(autoDailyService.autoDailyOrderProcessReportTpv($scope.search));
                        break;
                    case 'Daily Order Process Report':
                         $scope.isLoading=true;
                        sendReport(autoDailyService.autoDailyOrderProcessReport($scope.search));
                        break;
                    case 'Daily Inbound Report':
                        $scope.isLoading=true;
                        sendReport(autoDailyService.autoDailyInboundReport($scope.search));
                        break;
                    case 'Daily Outbound Report':
                        $scope.isLoading=true;
                        sendReport(autoDailyService.autoDailyoutboundReport($scope.search));
                        break;
                    case 'Daily Inventory Report':
                        $scope.isLoading=true;
                        sendReport(autoDailyService.autoDailyInventoryReport($scope.search));
                        break;
                    case 'Imports Group Inventory Report':
                        $scope.isLoading=true;
                        sendReport(autoDailyService.importsGroupInventoryReport($scope.search));
                        break;
                    case 'Container POD Monitor Daily Report':
                        $scope.isLoading=true;
                        sendReport(autoDailyService.containerPODMonitorDailyReport($scope.search));
                        break;
                    case 'Daily Data Comparison Report For TPV and AMTRAN RC/DC':
                        $scope.isLoading=true;
                        sendReport(autoDailyService.dailyDataComparisonReportForTPVandAMTRANRCDC($scope.search));
                        break;
                    default:
                }
            }
        };
    };
    controller.$inject = ['$scope', '$resource',
        '$mdDialog', '$state', 'lincUtil', 'reportTypes','orderId','carrierId','autoDailyService'];
    return controller;
});