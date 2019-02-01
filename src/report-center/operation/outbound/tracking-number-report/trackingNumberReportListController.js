'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, lincUtil, reportService, $http, lincResourceFactory) {
        $scope.pageSize = 10;
        $scope.searchCompleted = true;
        $scope.search = { };
        $scope.paging = {};
        $scope.reportData = [];
        $scope.reportHead = [];

        $scope.searchReports = function () {
            $scope.loadContent(1);
        };


        $scope.loadContent = function (currentPage) {
            $scope.reportView = $scope.reports.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.reports.length ? $scope.reports.length : currentPage * $scope.pageSize);
        };

        $scope.loadContent = function (currentPage) {
            var searchParam = angular.copy($scope.search);
            var searchValues = _.compact(_.values(searchParam));
            if(_.isEmpty(searchValues)) {
                lincUtil.messagePopup("Tip", "Please enter query parameter at least one!");
                return;
            }
            $scope.loading = true;
            searchParam.paging = { pageNo: Number(currentPage), limit: $scope.pageSize};
            reportService.searchTrackingNoReport(searchParam).then(function (response) {
                $scope.reportData = response.results.data;
                $scope.reportHead = response.results.head;
                $scope.paging = response.paging;
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };


        $scope.clearQuery = function () {
            $scope.search = { };
        };

        $scope.exporting = false;
        $scope.export = function () {
            if ($scope.exporting) return;
            var searchParam = angular.copy($scope.search);
            var searchValues = _.compact(_.values(searchParam));
            if(_.isEmpty(searchValues)) {
                lincUtil.messagePopup("Tip", "Please enter query parameter at least one!");
                return;
            }
            $scope.exporting = true;
            $http.post("/report-center/outbound/trackingno-report/download", searchParam, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                $scope.exporting = false;
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    return;
                }
                lincUtil.exportFile(res, "trackingNo.xlsx");
            }, function (error) {
                lincUtil.bufferErrorPopup(error);
                $scope.exporting = false;
            });
        };

        function init() {
            lincResourceFactory.getOrderStatus().then(function (response) {
                $scope.statusList = response;
            });
        }

        init();
    };
    controller.$inject = ['$scope', 'lincUtil', 'reportService', '$http', 'lincResourceFactory'];
    return controller;
});