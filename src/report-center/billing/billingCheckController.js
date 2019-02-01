
'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function($scope, $mdDialog, $http, billingRecordService, lincUtil) {
        $scope.types = ["InBound","OutBound","Manual"];
        $scope.billingStatus = ["Sent","UnSend"];
        $scope.search = {
            type: "InBound"
        };
        $scope.pageSize = 10;

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchByPaging();
            }
            $event.preventDefault();
        };

        $scope.isCanSendBilling = function (report) {
            var statues = ["CLOSED","FORCE_CLOSED","SHIPPED","PARTIAL_SHIPPED","SHORT_SHIPPED"];
            return _.includes(statues, report.Status);
        }

        function fomateSearchParam() {
            var searchParam = angular.copy($scope.search);

            if (searchParam.timeFrom) {
                searchParam.timeFrom = lincUtil.fomateStartDate(new Date(searchParam.timeFrom));
            }
            if (searchParam.timeTo) {
                searchParam.timeTo = lincUtil.fomateEndDate(new Date(searchParam.timeTo));
            }
            return searchParam;
        }

        var currentPage;
        $scope.searchByPaging = function(pgNo) {
            if ($scope.searching) return;
            $scope.searching = true;
            pgNo = pgNo || 1;
            currentPage = pgNo;

            var searchParam = fomateSearchParam();
            searchParam.paging = { pageNo: Number(pgNo), limit: $scope.pageSize};
            selectIds = [];

            billingRecordService.searchBillingCheckReport(searchParam).then(function (response) {
                $scope.reportData = response.results.data;
                $scope.reportHead = response.results.head;
                $scope.paging = response.paging;
                $scope.searching = false;
                if (searchParam.type !== "Manual" && _.isEmpty($scope.reportData)) {
                    lincUtil.messagePopup("Info", "Order or receipt may be unclosed!");
                }
            }, function (error) {
                $scope.searching = false;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;

            var searchParam = fomateSearchParam();

            $http.post("/report-center/billing/check/download", searchParam, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength === 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "billingCheckReport.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        var selectIds = [];
        $scope.checkAll = function () {
            if (selectIds.length > 0) {
                selectIds = [];
                return;
            }
            selectIds = _.map(_.filter($scope.reportData, function (report) {
                return !(report.Billing === 'SENT' && report.type ==='WEB_MANUAL');
            }), "ID");
        };
        $scope.selectAllChecked = function () {
            if (_.isEmpty($scope.reportData) || _.isEmpty(selectIds)) return false;
            return selectIds.length === $scope.reportData.length;
        };
        $scope.checkRow = function (report) {
            if (_.includes(selectIds, report.ID)) {
                _.remove(selectIds, report.ID);
            } else {
                selectIds.push(report.ID);
            }
        };
        $scope.isChecked = function (report) {
            return _.includes(selectIds, report.ID);
        };
        $scope.sendReport = function(report) {
            $scope.sending = true;
            if ($scope.search.type === "InBound") {
                billingRecordService.sendBillingReceivingReport({receiptIds:[report.ID]}).then(function (res) {
                    $scope.sending = false;
                    $scope.searchByPaging(currentPage);

                }, function (error) {
                    $scope.sending = false;
                    lincUtil.processErrorResponse(error);
                });
            } else if ($scope.search.type === "OutBound") {
                billingRecordService.sendBillingShippingReport({orderIds:[report.ID]}).then(function (res) {
                    $scope.sending = false;
                    $scope.searchByPaging(currentPage);

                }, function (error) {
                    $scope.sending = false;
                    lincUtil.processErrorResponse(error);
                });
            } else if ($scope.search.type === "Manual") {
                billingRecordService.sendBillingManualChargeReport({ids:[report.ID]}).then(function (res) {
                    $scope.sending = false;
                    $scope.searchByPaging(currentPage);

                }, function (error) {
                    $scope.sending = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        };
        $scope.batchSend = function () {
            if (!selectIds || selectIds.length === 0) {
                lincUtil.errorPopup("Please select row first!");
                return;
            }
            $scope.sending = true;
            if ($scope.search.type === "InBound") {
                billingRecordService.sendBillingReceivingReport({receiptIds:selectIds}).then(function (res) {
                    $scope.sending = false;
                    $scope.searchByPaging(currentPage);

                }, function (error) {
                    $scope.sending = false;
                    lincUtil.processErrorResponse(error);
                });
            } else if ($scope.search.type === "OutBound") {
                billingRecordService.sendBillingShippingReport({orderIds:selectIds}).then(function (res) {
                    $scope.sending = false;
                    $scope.searchByPaging(currentPage);

                }, function (error) {
                    $scope.sending = false;
                    lincUtil.processErrorResponse(error);
                });
            } else if ($scope.search.type === "Manual") {
                billingRecordService.sendBillingManualChargeReport({ids:selectIds}).then(function (res) {
                    $scope.sending = false;
                    $scope.searchByPaging(currentPage);

                }, function (error) {
                    $scope.sending = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        };

        $scope.detail = {};
        $scope.showDetail = function (report) {
            $scope.detail = report;
            $scope.lpDetailHead = $scope.detail.ID.indexOf("RN-") >= 0 ? receiptLPHead : shippedLPHead;

            $mdDialog.show({
                contentElement: '#billingDetail',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
            })
        };
        $scope.closeDetail = function () {
            $mdDialog.hide();
        };

        var receiptLPHead = [
            "LPNo",
            "ReceivedQty",
            "ReceivedEAQty",
            "ReceivedCSQty",
            "PalletType",
            "PalletQty",
            "ContainerType",
            "ContainerNo",
            "TrailerType",
            "TrailerNo",
            "EntryID"
        ];
        var shippedLPHead = [
            "LPNo",
            "ReceiptID",
            "DevannedDate",
            "ShippedQty",
            "ShippedEAQty",
            "ShippedCSQty",
            "PalletType",
            "PalletQty",
            "EntryID",
            "LoadNo",
            "OrgLPNo",
            "OrgLPNoCleared"
        ];
        $scope.lpDetailHead = receiptLPHead;

        $scope.detailTabActiveId = "Materials";
        $scope.tabActive = function (tab) {
            $scope.detailTabActiveId = tab;
            $scope.lpDetailHead = $scope.detail.ID.indexOf("RN-") >= 0 ? receiptLPHead : shippedLPHead;
        };
    };

    controller.$inject = ['$scope', '$mdDialog', '$http', 'billingRecordService', 'lincUtil'];
    return controller;
});