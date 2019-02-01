'use strict';

define(['angular', 'lodash', 'moment'], function(angular, _, moment) {
    var controller = function($scope, lincUtil, reportService, itemService, fileService) {
        $scope.pageSize = 10;
        $scope.searchCompleted = true;
        $scope.search = {statuses:["Done"]};

       $scope.searchReports = function () {
            var searchParam = angular.copy($scope.search);
            if(searchParam)
            {
                if(searchParam.type != "Outbound_schedule"||searchParam.type != "Outbound_finished")
                {
                    delete searchParam.startScheduleTimeFrom;
                    delete searchParam.startScheduleTimeTo;
                    delete searchParam.endScheduleTimeFrom;
                    delete searchParam.endScheduleTimeTo;
                }
                if($scope.diverseFields && $scope.diverseFields.length > 0)
                {
                    searchParam.properties = setSelectedProduct($scope.diverseFields);
                }
                getReports(searchParam);
            }
        };

        $scope.searchReports();

        function getReports(param) {
            reportService.searchReport(param).then(function(response) {
                $scope.reports = response.reports;
                $scope.itemMap = response.itemMap;
                $scope.loadContent(1);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.reportView = $scope.reports.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.reports.length ? $scope.reports.length : currentPage * $scope.pageSize);
        };

        $scope.itemSpecIdOnSelect = function (itemSpecId) {
            if(itemSpecId)
            {
                itemService.getItemByIdAndProductId(itemSpecId, null, true).then(function(response) {
                    $scope.diverseFields = response.diverseFields;
                });
            }else
            {
                $scope.diverseFields = null;
            }
        };
      
        $scope.typeOnSelect = function (type) {
            $scope.timeName = $scope.getTimeName(type);
        };

        $scope.getTimeName = function(type) {
            var name;
            if(type == "Inbound_finished"||type == "Inbound_schedule")
            {
                name = "Devanned";
            }else if(type == "Outbound_schedule"||type == "Outbound_finished")
            {
                name = "Shipped ";
            }
            return name;
        }

        $scope.deleteReport = function (reportId) {
            lincUtil.deleteConfirmPopup('Would you like to remove the this report?', function()
            {
                reportService.deleteReport(reportId).then(function (){
                    angular.forEach($scope.reports, function(item, key) {
                        if (item.id === reportId)
                        {
                            $scope.reports.splice(key, 1);
                        }
                    });
                    angular.forEach($scope.reportView, function(item1, key1) {
                        if (item1.id === reportId)
                        {
                            $scope.reportView.splice(key1, 1);
                        }
                    });
                },function(error)
                {
                    lincUtil.errorPopup('Delete Error! ' + error.data.error);
                });
            });
        };

        function setSelectedProduct(diverseFields) {
            var proList = [];
            angular.forEach(diverseFields, function (field)
            {
                if(field.selectedProduct)
                {
                    proList.push({propertyId: field.propertyId, propertyName:field.itemProperty.name, value: field.selectedProduct.value,
                        unit: field.selectedProduct.unit});
                }
            });
            return proList;
        }


        $scope.getDownload = function (report) {
            var download = "";
            var a = document.createElement('a');
            a.href = fileService.buildDownloadUrl(report.fileId);
            if(!report.createdWhen){
                var createdWhen = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss");
                download = report.type +" " + createdWhen + ".xls";
            }else{
                download = report.type +" " + report.createdWhen+ ".xls";
            }
            a.download = $scope.download = download;

            a.target = '_blank';
            a.click();
        };
    };
    controller.$inject = ['$scope','lincUtil', 'reportService', 'itemService', 'fileService'];
    return controller;
});