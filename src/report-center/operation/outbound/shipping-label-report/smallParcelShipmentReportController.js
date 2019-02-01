'use strict';

define(['angular', 'lodash', 'moment'], function (angular, _, moment) {
    var controller = function ($scope, $http, lincUtil,printService) {
        $scope.pageSize = 10;
        $scope.search = {};

        $scope.searchReports = function () {
                $scope.loadContent(1);
        };

        $scope.loadContent = function (currentPage) {
            $scope.loading = true;
            var param = angular.copy($scope.search);
            if (param.createdWhenTo) { 
                param.createdWhenTo = param.createdWhenTo.replace("00:00:00", "23:59:59");
            }
            param.isShippingLabelPrinted =true ;
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            printService.searchSmallParcelShipmentThroughBam(param).then(function (response) {
                $scope.loading=false;
                $scope.shipments=response.shipments;
                $scope.paging = response.paging;
              }, function (error) {
                $scope.loading=false;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.export = function () {
            if (! $scope.shipments ||  $scope.shipments.length === 0) {
                lincUtil.errorPopup("Not data export");
                return;
            }
            if ($scope.exporting) return;
            $scope.exporting = true;
            var param = angular.copy($scope.search);
            if (!param.createdWhenFrom) { 
                lincUtil.messagePopup('Message','Please select Created From!');
                $scope.exporting = false;
                return;
            }
            if (param.createdWhenTo) { 
                param.createdWhenTo = param.createdWhenTo.replace("00:00:00", "23:59:59");
            }
            $http.post("/report-center/outbound/small-parcel-shipment/download", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "SmallParcelShipmentReport.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        function _init() {
            $scope.searchReports();
        }

        _init();

    }
    controller.$inject = ['$scope', '$http', 'lincUtil','printService',];
    return controller;
});