'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $http, lincUtil, reportService,lincResourceFactory) {
        $scope.search = {};
        $scope.pageSize = 10;


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
            $scope.loading = true;
            var param ={customerId:$scope.search.customerId};
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageSize)};
            reportService.searchLpNotShippedReportReport(param).then(function (response) {
                $scope.loading = false;
                $scope.paging = response.paging;
                $scope.reportHead = response.results.head;
                $scope.reportData = response.results.data;

            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });

        };

        $scope.export = function () {
            if(!$scope.search.customerId){
                lincUtil.errorPopup('Please select customer first !');
                return;
            }
            $scope.exporting = true;
            var exportData = { customerId: $scope.search.customerId };

            $http.post("/report-center/lp/lp-notshiped-report/download", exportData, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "lpNotShippedIn24HoursReport.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };



    };
    controller.$inject = ['$scope', '$http', 'lincUtil', 'reportService','lincResourceFactory'];
    return controller;
});
