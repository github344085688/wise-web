'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $http, lincUtil, reportService,lincResourceFactory) {
        $scope.search = {};
        $scope.pageSize = 10;
        $scope.orderStatuses = [];
        $scope.search.statuses = [
            "Imported",
            "Open",
            "Partial Committed",
            "Commit Blocked",
            "Commit Failed",
            "Committed",
            "Planned",
            "Picking",
            "Picked",
            "Packing",
            "Packed",
            "Staged",
            "Loading",
            "Loaded",
            "Shipped",
            "Partial Shipped",
            "Short Shipped",
            "Reopen",
            "Cancelled"
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
            if (param.shippedTimeFrom) {
                param.shippedTimeFrom = lincUtil.fomateStartDate(new Date(param.shippedTimeFrom));
            }
            if (param.shippedTimeTo) {
                param.shippedTimeTo = lincUtil.fomateEndDate(new Date(param.shippedTimeTo));
            }
            if (param.createdTimeFrom) {
                param.createdTimeFrom = lincUtil.fomateStartDate(new Date(param.createdTimeFrom));
            }
            if (param.createdTimeTo) {
                param.createdTimeTo = lincUtil.fomateEndDate(new Date(param.createdTimeTo));
            }
            if (param.appointmentTimeTo) {
                param.appointmentTimeTo = lincUtil.fomateEndDate(new Date(param.appointmentTimeTo));
            }
            
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageSize)};
            reportService.searchOrderStatusReport(param).then(function (response) {
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
            if ($scope.exporting) return;
            $scope.exporting = true;
            var exportData = {}
            _.forEach($scope.search, function (value, key) {
                if (value) {
                    exportData[key] = value;
                }
            });
            if (exportData.shippedTimeFrom) {
                exportData.shippedTimeFrom = lincUtil.fomateStartDate(new Date(exportData.shippedTimeFrom));
            }
            if (exportData.shippedTimeTo) {
                exportData.shippedTimeTo = lincUtil.fomateEndDate(new Date(exportData.shippedTimeTo));
            }
            if (exportData.createdTimeFrom) {
                exportData.createdTimeFrom = lincUtil.fomateStartDate(new Date(exportData.createdTimeFrom));
            }
            if (exportData.createdTimeTo) {
                exportData.createdTimeTo = lincUtil.fomateEndDate(new Date(exportData.createdTimeTo));
            }
            if (exportData.appointmentTimeTo) {
                exportData.appointmentTimeTo = lincUtil.fomateEndDate(new Date(exportData.appointmentTimeTo));
            }

            $http.post("/report-center/outbound/order-status-report/download", exportData, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "orderItemReport.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        function init() {
            lincResourceFactory.getOrderStatus(name).then(function (response) {
                $scope.orderStatuses = response;
            });
        }

        init();

    };
    controller.$inject = ['$scope', '$http', 'lincUtil', 'reportService','lincResourceFactory'];
    return controller;
});
