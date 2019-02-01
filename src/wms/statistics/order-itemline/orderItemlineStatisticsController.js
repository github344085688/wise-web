'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var orderItemlineStatisticsController = function ($scope, $state,  $stateParams, lincUtil , orderService,statisticsService, lincResourceFactory) {
        $scope.pager = {pageSize : 500};
        $scope.searchInfo = {};
        $scope.orderIds = [];
        $scope.showOrder = false;


        function setupOrderIds(from, to) {
            if(!from || !to ) {
                lincUtil.errorPopup("Please fill the From order ID number and To order ID number ");
            } else {
                if(to - from > $scope.pager.pageSize) {
                    lincUtil.errorPopup("Allow only 500 orders at most,  please narrow the range")
                } else {
                    var calOrderIds = [] , min = from, max = to;
                    if(from > to ) {
                        min = to;
                        max = from;
                    }
                    for(var i= min; i <= max; i ++ ){
                        calOrderIds.push("DN-" + i);
                    }
                    return calOrderIds;
                }
            }
            return [];
        }

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
                lincUtil.processErrorResponse(err);
            });
        }

        function orderItemlineSummary(orderIds) {
            if(orderIds.length > 0){
                $scope.orderIds = orderIds;
                statisticsService.summaryOrderItemline(orderIds).then(function(res){
                    $scope.orderItemlineSummary = res;
                    $scope.isLoading = false;
                }, function(err){
                    $scope.isLoading = false;
                    lincUtil.processErrorResponse(err);
                })
            } else {
                $scope.isLoading = false;
            }
        }

        $scope.searchAndAnalysis = function(searchInfo) {
            $scope.isLoading = true;
            $scope.orderItemlineSummary = {};
            $scope.orderIds = [];
             if(searchInfo.fromOrderIdNumber || searchInfo.toOrderIdNumber) {
                 orderItemlineSummary(setupOrderIds(searchInfo.fromOrderIdNumber, searchInfo.toOrderIdNumber));
             } else {
                 searchOrderAndSummary(searchInfo);
             }

        };

        $scope.getStatusList = function(name) {
            return lincResourceFactory.getOrderStatus(name).then(function (response) {
                $scope.statusList = response;
            });
        };

    };

    orderItemlineStatisticsController.$inject = ['$scope', '$state', '$stateParams', 'lincUtil',
        'orderService','statisticsService', 'lincResourceFactory'];
    return orderItemlineStatisticsController;

});
