'use strict';

define(['angular'], function (angular) {
    var controller = function ($scope, $http, lincUtil, reportService) {
        $scope.search = {};
        $scope.pageSize = 10;
        $scope.reportHead = [
            "TASKID",
            "TASKTYPE",
            "CUSTOMERID",
            "SHIPTO",
            "DN",
            "PICKING",
            "STARTTIME",
            "ENDTIME",
            "TIMESPAN (MINS)",
            "ITEM",
            "ITEM DESCRIPTION",
            "LOTNO.",
            "FROMLPNO.",
            "TOLPNO.",
            "IS ENTIRE LP PICK",
            "PICKQTY",
            "UOM",
            "PALLETPICKQTY",
            "CASEPICKQTY",
            "INNERPICKQTY",
            "PIECEPICKQTY",
            "CASE RELOCATE QTY",
            "INNER RELOCATE QTY",
            "PIECE RELOCATE QTY",
            "UNITS PALLET (CASE)",
            "UNITS PALLET (INNER)",
            "UNITS PALLET (PIECE)",
            "LP CONFIGURATION",
            "ITEM CFT",
            "ITEM WGT",
            "REFERENCE NO.",
            "PO NO.",
            "PRO NO.",
            "SONO."
        ];

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchByPaging();
            }
            $event.preventDefault();
        }

        function fomateSearchParam() {
            var searchParam = angular.copy($scope.search);
            if(searchParam.timeFrom){
                searchParam.timeFrom=lincUtil.fomateStartDate(new Date(searchParam.timeFrom));
            }
            if(searchParam.timeTo){
                searchParam.timeTo=lincUtil.fomateEndDate(new Date(searchParam.timeTo));
            }
            if(searchParam.shippedTimeFrom){
                searchParam.shippedTimeFrom=lincUtil.fomateStartDate(new Date(searchParam.shippedTimeFrom));
            }
            if(searchParam.shippedTimeTo){
                searchParam.shippedTimeTo=lincUtil.fomateEndDate(new Date(searchParam.shippedTimeTo));
            }
            return searchParam;
        }

        $scope.searchByPaging = function(pgNo) {
            if ($scope.searching) return;
            $scope.searching = true;
            pgNo = pgNo || 1;
            var searchParam = fomateSearchParam();
            searchParam.paging = { pageNo: Number(pgNo), limit: $scope.pageSize};

            reportService.searchPickDetailReport(searchParam).then(function (response) {
                $scope.reportData = response.results.data;
                $scope.reportHead = response.results.head;
                $scope.paging = response.paging;
                $scope.searching = false;
            }, function (error) {
                $scope.searching = false;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;

            var searchParam = fomateSearchParam();

            $http.post("/report-center/task/pick-detail-report/download", searchParam, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "pickDetail.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };
    };

    controller.$inject = ['$scope', '$http', 'lincUtil', 'reportService'];
    return controller;
});