'use strict';

define(['angular', 'lodash', 'moment'], function(angular, _, moment) {
    var controller = function($scope, $state, lincUtil, reportService, itemService, lincResourceFactory) {

        init();

        function init() {
            $scope.reportModel = { includeZeroQty: "Exclude",type:"Outbound_finished"};
        }
        
        $scope.submit = function(form) {
            var report = angular.copy($scope.reportModel);
            if($scope.diverseFields && $scope.diverseFields.length > 0)
            {
                report.properties = setSelectedProduct($scope.diverseFields);
            }
            addReport(report);
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
        
        function formatEndTime(time) {
            var arr = _.split(time, "T");
            return arr[0] + "T23:59:59";
        }

        function addReport(report) {
            if(report.endTime)
            {
                report.endTime = formatEndTime(report.endTime);
            }
            if(report.scheduleTimeEnd)
            {
                report.scheduleTimeEnd = formatEndTime(report.scheduleTimeEnd);
            }

            $scope.loading = true;
            reportService.addReport(report).then(function () {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('rc.operation.outbound.shippingReport.list');
                });
            },function(error) {
                $scope.loading = false;
                lincUtil.errorPopup('Save Report Error! ' + error.data.error);
            });
        }

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

        $scope.cancel = function() {
            $state.go('rc.operation.outbound.shippingReport.list');
        };

    };
    controller.$inject = ['$scope','$state', 'lincUtil', 'reportService', 'itemService', 'lincResourceFactory'];
    return controller;
});