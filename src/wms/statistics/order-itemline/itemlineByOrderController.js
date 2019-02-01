'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var orderItemlineStatisticsController = function ($scope, $http, lincUtil, orderService, statisticsService, lincResourceFactory) {
        $scope.pager = {pageSize : 500};
        $scope.searchInfo = {};

        function searchOrderAndSummary(searchInfo) {
            var param = angular.copy(searchInfo);
            if(param.longHaulNos && param.longHaulNos.length > 0){
                param.longHaulNos = _.uniq(_.map(param.longHaulNos, "longHaulNo"));
            }
            param.paging = { pageNo: 1, limit: Number($scope.pager.pageSize) };
            orderService.searchOrderByPaging(param).then(function (response) {
                $scope.paging = response.paging;
                orderItemlineSummary(_.map(response.orders,"id"));
            }, function (err) {
                $scope.isLoading = false;
                lincUtil.errorPopup(err);
            });
        }

        function orderItemlineSummary(orderIds) {
            if(orderIds.length > 0){
                $scope.orderIds = orderIds;
                statisticsService.itemLineStatistics(orderIds).then(function(res){
                    $scope.orderItemlineSummary = res;
                    $scope.isLoading = false;
                }, function(err){
                    $scope.isLoading = false;
                    lincUtil.errorPopup(err);
                })
            } else {
                $scope.isLoading = false;
            }
        }

        $scope.searchAndAnalysis = function(searchInfo) {
            $scope.isLoading = true;
            $scope.orderItemlineSummary = {};
            $scope.orderIds = [];
            searchOrderAndSummary(searchInfo);
        };

        $scope.getStatusList = function(name) {
            return lincResourceFactory.getOrderStatus(name).then(function (response) {
                $scope.statusList = response;
            });
        };

        $scope.export = function () {
            if (!$scope.orderItemlineSummary || !$scope.orderItemlineSummary.totalItemLines || $scope.orderItemlineSummary.totalItemLines.length === 0) {
                lincUtil.errorPopup("Not data, please search first");
                return;
            }
            if ($scope.exporting) return;
            $scope.exporting = true;

            var param = {};
            param.data = $scope.orderItemlineSummary.totalItemLines;
            param.head = ["orderId", "itemLineCount", "csQty", "eaQty", "weight"];

            $http.post("/wms-app/report/export", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "itemLineStatistics.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

    };

    orderItemlineStatisticsController.$inject = ['$scope', '$http', 'lincUtil',
        'orderService','statisticsService', 'lincResourceFactory'];
    return orderItemlineStatisticsController;

});
