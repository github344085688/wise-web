'use strict';

define(['angular',
    'lodash',

], function (angular, _) {
    var controller = function ($scope, fileService, $state, $stateParams, lincUtil, $mdDialog, reportService, session) {

        $scope.pageSize = 10;
        var reportId = $stateParams.reportId;
        var currentViewPage;
        var SORT_DEFAULT = "default";
        var SORT_ASC = "asc";
        var SORT_DESC = "desc";
    
        $scope.colDefs = [
            { headerName: 'Customer ID', field: 'id', sort: true },
            { headerName: 'Title', field: 'TITLE', sort: true },
            { headerName: 'Order NO.', field: 'ORDER NO.', sort: true },
            { headerName: 'Account ID', field: 'ACCOUNT ID', sort: true },
            { headerName: 'Item ID', field: 'ITEM ID', sort: true },
            { headerName: 'Item Description', field: 'ITEM DESCRIPTION', sort: true },
            { headerName: 'Grade', field: 'GRADE', sort: true },
            { headerName: 'Reference No.', field: 'REFERENCE NO.', sort: true },
            { headerName: 'Po No.', field: 'PO NO.', sort: true },
            { headerName: 'Source', field: 'SOURCE', sort: true },
            { headerName: 'Item Cft', field: 'ITEM CFT', sort: true },
            { headerName: 'Item Wgt(lb.)', field: 'ITEM WGT(lb.)', sort: true },
            { headerName: 'Load NO.', field: 'LOAD NO.', sort: true },
            { headerName: "Status", field: "STATUS", sort: true },
            { headerName: "Shipped Date", field: "SHIPPED DATE", sort: true },
            { headerName: "Ship TO", field: "SHIP TO", sort: true },
            { headerName: "Store NO.", field: "STORE NO.", sort: true },
            { headerName: "Carrier NO.", field: "CARRIER NO.", sort: true },
            { headerName: "Seal NO.", field: "SEAL NO.", sort: true },
            { headerName: "Pro NO..", field: "PRO NO.", sort: true },
            { headerName: "Schedule Date", field: "SCHEDULE DATE", sort: true },
            { headerName: 'AppointMent Date', field: 'APPOINTMENT DATE', sort: true },
            { headerName: 'In Yard Date', field: 'IN YARD DATE', sort: true },
            { headerName: "Master Ship TO", field: "MASTER SHIP TO", sort: true },
            { headerName: "SHIPPED Qty", field: "SHIPPED QTY", sort: true },
            { headerName: "Order Qty", field: "ORDER QTY", sort: true },
            { headerName: "Carton Qty", field: "CARTON QTY", sort: true },
            { headerName: "Pallet Qty", field: "PALLET QTY", sort: true },
            { headerName: "Pallet Type", field: "PALLET TYPE", sort: true },
            { headerName: "Units Pallet", field: "UNITS PALLET", sort: true },

        ];

        function initSorts() {
            $scope.sorts = [];
            var len = $scope.colDefs.length;
            for (var i = 0; i < len; i++) {
                $scope.sorts.push(SORT_DEFAULT);
            }
            $scope.sortsClass = {
                default: 'order-sorting',
                asc: 'order-sorting order-sorting-asc',
                desc: 'order-sorting order-sorting-desc'
            };
        }

        $scope.getSortClass = function (index) {
            if ($scope.colDefs[index].sort) {
                return $scope.sortsClass[$scope.sorts[index]];
            }
        }

        $scope.sortClick = function (index) {
            if (!$scope.colDefs[index].sort) {
                return;
            }
            var sort = $scope.sorts[index];
            var sortField = $scope.colDefs[index].field;
            switch (sort) {
                case SORT_DEFAULT:
                    sortDefault(index);
                    scheduleByReceipts([sortField], "");
                    break;
                case SORT_ASC:
                    $scope.sorts[index] = SORT_DESC;
                    scheduleByReceipts([sortField], ["desc"]);
                    break;
                case SORT_DESC:
                    $scope.sorts[index] = SORT_ASC;
                    scheduleByReceipts([sortField], ["asc"]);
                    break;
            }
        };


        function sortDefault(index) {
            angular.forEach($scope.sorts, function (value, key) {
                $scope.sorts[key] = (key === index) ? SORT_ASC : SORT_DEFAULT;
            });
        }

        function scheduleByReceipts(fieldName, sort) {
      
            $scope.scheduleReport = _.orderBy($scope.scheduleReport, fieldName, sort);
            $scope.loadContent(currentViewPage);
        }


        $scope.getDownload = function () {
            lincUtil.getFile($scope.report.fileId, session.getUserToken(), function (fileName,data) {
                $scope.loading = true;
                if (data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.loading = false;
                    return;
                }
                var createdWhen = "";
                if(!$scope.report.createdWhen){
                    createdWhen = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss");
                }else{
                    createdWhen = $scope.report.createdWhen;
                }
                createdWhen = "_" + createdWhen + ".";
                lincUtil.exportFile(data, fileName.replace(".", createdWhen));
                $scope.loading = false;
            });
        };


        $scope.cancel = function () {
            $state.go('rc.operation.outbound.sheduleReport');

        };


        function _init() {
            initSorts();
            getReportById(reportId);

        }
        function getReportById(reportId) {
            reportService.getReportById(reportId).then(function (report) {
                $scope.report = report;
                getReportViewByFileId(report.fileId)

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }
        function getReportViewByFileId(fileId) {
            reportService.getReportViewByFileId(fileId).then(function (data) {
                $scope.scheduleReport = data.jsonArray.slice(1);
                $scope.loadContent(1);
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }
        _init();

        $scope.loadContent = function (currentPage) {
            currentViewPage = currentPage;
            $scope.scheduleReportView = $scope.scheduleReport.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.scheduleReport.length ? $scope.scheduleReport.length : currentPage * $scope.pageSize);
        };

    }
    controller.$inject = ['$scope', 'fileService', '$state', '$stateParams', 'lincUtil', '$mdDialog', 'reportService', 'session'];
    return controller;
});