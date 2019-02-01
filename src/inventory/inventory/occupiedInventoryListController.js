'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $http, inventoryService, lincUtil, orderPlanService) {


        $scope.pageSize = 10;
        $scope.search = {};
        $scope.search.locationIds = [], $scope.search.lpIds = [];
        $scope.searchOcuppiedInventories = function () {
            if ($scope.search.locationIds.length == 0 && $scope.search.lpIds.length == 0) {
                lincUtil.errorPopup("Please Select a LP or Location First");
            } else {
                var searchParam = angular.copy($scope.search);
                searchParam.state = "PENDING";
                if (searchParam) {
                    $scope.searchOcuppiedInventoryParam = angular.copy(searchParam);
                    searchPickStrategy();
                }
            }

        };

        function searchPickStrategy() {
            $scope.occupyLoading = true;

            orderPlanService.searchPickStrategy($scope.searchOcuppiedInventoryParam).then(function (response) {
                $scope.occupyLoading = false;
                $scope.pickStragetyLists = response.inventoryViews;
                $scope.loadOcuppiedInventorContent(1);
            }, function (error) {

                $scope.occupyLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadOcuppiedInventorContent = function (currentPage) {
            $scope.pickStragetyListView = $scope.pickStragetyLists.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.pickStragetyLists.length ? $scope.pickStragetyLists.length : currentPage * $scope.pageSize);
        };

        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchOcuppiedInventories();
            }
            $event.preventDefault();
        };


    };
    controller.$inject = ['$scope', '$http', 'inventoryService', 'lincUtil', 'orderPlanService'];
    return controller;
});