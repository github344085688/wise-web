'use strict';

define(['angular', 'lodash', 'moment'], function (angular, _, moment) {
    var controller = function ($scope, lincUtil, reportService, itemService, fileService, session) {
        $scope.pageSize = 10;
        $scope.searchCompleted = true;
        $scope.search = { statuses: ['New', 'Running', 'Done','Exception'], type: "Outbound_finished" };

        $scope.searchReports = function () {
            var searchParam = angular.copy($scope.search);
            if (searchParam) {

                if ($scope.diverseFields && $scope.diverseFields.length > 0) {
                    searchParam.properties = setSelectedProduct($scope.diverseFields);
                }
                getReports(searchParam);
            }
        };

        $scope.searchReports();

        function getReports(param) {
            $scope.loading = true;
            reportService.searchReport(param).then(function (response) {
                $scope.reports = response.reports;
                $scope.itemMap = response.itemMap;
                $scope.loadContent(1);
                $scope.loading = false;
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.reportView = $scope.reports.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.reports.length ? $scope.reports.length : currentPage * $scope.pageSize);
        };

        $scope.itemSpecIdOnSelect = function (itemSpecId) {
            if (itemSpecId) {
                itemService.getItemByIdAndProductId(itemSpecId, null, true).then(function (response) {
                    $scope.diverseFields = response.diverseFields;
                });
            } else {
                $scope.diverseFields = null;
            }
        };


        $scope.deleteReport = function (reportId) {
            lincUtil.deleteConfirmPopup('Would you like to remove the this report?', function () {
                reportService.deleteReport(reportId).then(function () {
                    angular.forEach($scope.reports, function (item, key) {
                        if (item.id === reportId) {
                            $scope.reports.splice(key, 1);
                        }
                    });
                    angular.forEach($scope.reportView, function (item1, key1) {
                        if (item1.id === reportId) {
                            $scope.reportView.splice(key1, 1);
                        }
                    });
                }, function (error) {
                        lincUtil.errorPopup('Delete Error! ' + error.data.error);
                    });
            });
        };

        function setSelectedProduct(diverseFields) {
            var proList = [];
            angular.forEach(diverseFields, function (field) {
                if (field.selectedProduct) {
                    proList.push({
                        propertyId: field.propertyId, propertyName: field.itemProperty.name, value: field.selectedProduct.value,
                        unit: field.selectedProduct.unit
                    });
                }
            });
            return proList;
        }

        $scope.clearQuery = function () {
            $scope.search = { statuses: ["Done"], type: "Outbound_finished" };
        }

        $scope.getDownload = function (report) {
            lincUtil.getFile(report.fileId, session.getUserToken(), function (fileName,data) {
                $scope.loading = true;
                if (data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.loading = false;
                    return;
                }
                var createdWhen = "";
                if(!report.createdWhen){
                    createdWhen = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss");
                }else{
                    createdWhen = report.createdWhen;
                }
                createdWhen = "_" + createdWhen + ".";
                lincUtil.exportFile(data, fileName.replace(".", createdWhen));
                $scope.loading = false;
            });
        };
    };
    controller.$inject = ['$scope', 'lincUtil', 'reportService', 'itemService', 'fileService', 'session'];
    return controller;
});