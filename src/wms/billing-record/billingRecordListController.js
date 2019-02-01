'use strict';

define(["lodash"], function(_) {
    var $scope = function($scope, $http, billingRecordService, billingCodeService, lincUtil) {
        $scope.pageSize = 10;
        $scope.searchInfo = {};

        function searchBillingRecord(searchParam, currentPage) {
            $scope.loading = true;

            var param = angular.copy(searchParam);
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };

            billingRecordService.searchBillingRecordByPaging(param).then(function(data) {
                $scope.loading = false;
                $scope.paging = data.paging;
                $scope.recordView = data.billings;
            }, function(error) {
                $scope.loading = false;
                lincUtil.errorPopup(error);
            });
        }

        $scope.search = function() {
            searchBillingRecord($scope.searchInfo, 1);
        };

        $scope.loadContent = function(currentPage) {
            searchBillingRecord($scope.searchInfo, currentPage);
        };

        $scope.export = function() {
            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/wms-app/billing-record/export", $scope.searchInfo, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "billing.xls");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        function searchBillingCode(searchParam) {
            billingCodeService.searchBillingCode(searchParam).then(function(data) {
                $scope.billingCodes = data;
            });
        }

        function _init() {
            searchBillingRecord({}, 1);
            searchBillingCode({});
        }

        _init();
    };
    $scope.$inject = ['$scope', '$http', 'billingRecordService', 'billingCodeService', 'lincUtil'];
    return $scope;
});
