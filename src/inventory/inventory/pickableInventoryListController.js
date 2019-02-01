'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $http, inventoryService, lincUtil, orderPlanService) {


        $scope.pageSize = 10;
        $scope.search = {};

        $scope.searchPickableInventories = function () {
            if (!$scope.search.itemSpecIds) {
                lincUtil.errorPopup("Please Select a Item First");
            }
            else {
                var searchParam = angular.copy($scope.search);
                searchParam.itemSpecIds = [searchParam.itemSpecIds];
                searchParam.onlyForSearch = true;
                if (searchParam) {
                    $scope.searchPickableInventorParam = angular.copy(searchParam);
                    searchAvailablePickInventory();
                }
              
            }

        };


        function searchAvailablePickInventory() {

            $scope.pickableLoading = true;
            inventoryService.searchAvailablePickInventory($scope.searchPickableInventorParam).then(function (response) {
                $scope.pickableLoading = false;
                $scope.pickableInventory = response.pickableInventoryViews;
                $scope.loadPickableInventorContent(1);
            }, function (error) {
                $scope.pickableLoading = false;
                lincUtil.processErrorResponse(error);
             
            });
        }

        $scope.loadPickableInventorContent = function (currentPage) {

            $scope.pickableListView = $scope.pickableInventory.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.pickableInventory.length ? $scope.pickableInventory.length : currentPage * $scope.pageSize);
        };


        $scope.keyUpSearch = function ($event) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                $scope.searchPickableInventories();
            }
            $event.preventDefault();
        };

        $scope.getLocations = function (keyword) {
            var param = { regexName: keyword, scenario: 'Auto Complete' };
            locationService.getLocationList(param).then(function (response) {
                $scope.locations = response;
            });
        };



    };
    controller.$inject = ['$scope', '$http', 'inventoryService', 'lincUtil', 'orderPlanService'];
    return controller;
});