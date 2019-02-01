'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, lincUtil, orderPlanService, lincResourceFactory) {

        $scope.pageSize = 10;
        $scope.orderPlan = {};

        $scope.orderPlanStatuses = ['Building', 'Pick Suggested', 'Task Created', 'Scheduled', 'Released', 'Completed', 'Cancelled'];
        $scope.searchOrderPlans = function () {
            var searchParam = angular.copy($scope.orderPlan);
            getOrderPlans(1, searchParam);
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchOrderPlans();
            }
            $event.preventDefault();
        }

        getOrderPlans(1, {});

        var searchInfo = {};
        function getOrderPlans(currentPage, param) {
            $scope.loading = true;
            $scope.orderPlanView = [];
            searchInfo = param;
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            orderPlanService.searchOrderPlanByPaging(param).then(function(response) {
                $scope.orderPlanView = response.orderPlans;
                $scope.paging = response.paging;
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            getOrderPlans(currentPage, searchInfo);
        };

        $scope.deleteOrderPlan = function(orderPlanId) {
            lincUtil.deleteConfirmPopup('Would you like to remove this order plan', function()
            {
                orderPlanService.deleteOrderPlan(orderPlanId).then(function (){
                    angular.forEach($scope.receiptView, function(item1, key1) {
                        if (item1.id === orderPlanId)
                        {
                            $scope.orderPlanView.splice(key1, 1);
                        }
                    });
                },function(error)
                {
                    lincUtil.errorPopup('Delete Error! ' + error.data.error);
                });
            });
        };

        $scope.getPickTypes = function() {
            return lincResourceFactory.getPickTypes().then(function(response) {
                $scope.pickTypes = response;
            });
        };

        $scope.getPickWays = function() {
            return lincResourceFactory.getPickWays().then(function(response) {
                $scope.pickWays = response;
            });
        };

    };

    controller.$inject = ['$scope', '$state', 'lincUtil', 'orderPlanService', 'lincResourceFactory'];
    return controller;
});