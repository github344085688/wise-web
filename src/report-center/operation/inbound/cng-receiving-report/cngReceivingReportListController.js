'use strict';

define(['angular', 'lodash', 'moment'], function (angular, _, moment) {
    var controller = function ($scope, lincUtil, reportService, $http, lincResourceFactory) {
        $scope.pageSize = 10;
        $scope.searchInfo = {};

        $scope.searchCngRecevingReport = function () {
            $scope.searchLoading = true;
            $scope.cngRecevingReports = [];
            reportService.cngRecevingReport($scope.searchInfo).then(function (data) {
                $scope.searchLoading = false;
                $scope.cngRecevingReports = data.results.data;
                $scope.reportHeads = data.results.head;
                $scope.loadContent(1);
            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.searchLoading = false;
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.cngRecevingReportsView = $scope.cngRecevingReports.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.cngRecevingReports.length ? $scope.cngRecevingReports.length : currentPage * $scope.pageSize);
        };

        $scope.onselectCustomer =function(){
            if(!$scope.searchInfo.customerId){
                $scope.isShowAka =false;
            }else{
                $scope.isShowAka =true;
            }
            
        }

        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchCngRecevingReport();
            }
            $event.preventDefault();
        }



        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;
            $http.post("/report-center/inbound/inbound-report/cng-sn-level/download", $scope.searchInfo, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "cngReceiptReoport.xls");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.bufferErrorPopup(error);
                $scope.exporting = false;
            });
        };

        function getReceiptStatus() {
            return lincResourceFactory.getReceiptStatus().then(function (response) {
                $scope.statusList = response;
            });
        };

        function init() {
            $scope.searchCngRecevingReport();
            getReceiptStatus();
        }

        init();
    };
    controller.$inject = ['$scope', 'lincUtil', 'reportService', '$http', 'lincResourceFactory'];
    return controller;
});