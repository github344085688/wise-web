'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var ctrl = function($scope, $stateParams, putBackTaskService, itemService, lincUtil) {

        $scope.searchInfo = {};
        $scope.pageObj = {pageSize: 10};
        var historyList;

        $scope.searchHistory = function() {
            var searchValues = _.compact(_.values($scope.searchInfo));
            if(searchValues.length == 0) {
                lincUtil.messagePopup("Tip","Empty search filter is not allowed, please fill one field at least.");
            }else {
                var searchInfo = angular.copy($scope.searchInfo);
                searchHistory(searchInfo);
            }
        };

        function searchHistory(param) {
            $scope.isLoading = true;
            putBackTaskService.searchHistory(param).then(function(response) {
                $scope.isLoading = false;
                historyList = response;
                $scope.pageObj.totalCount = historyList.length;
                $scope.loadContent(1);
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.historyListView = historyList.slice((currentPage - 1) * $scope.pageObj.pageSize,
                currentPage * $scope.pageObj.pageSize > $scope.pageObj.totalCount ? $scope.pageObj.totalCount : currentPage * $scope.pageObj.pageSize);
        };

        $scope.itemSpecIdOnSelect = function (itemSpec) {
            $scope.searchInfo.productId = null;
            $scope.searchInfo.unitId = null;
            if(itemSpec)
            {
                itemService.getDiverseByItemSpec(itemSpec.id).then(function(response) {
                    $scope.itemProducts = response.diverseItemSpecs;
                    $scope.itemPropertyMap = response.itemPropertyMap;
                });

                itemService.searchItemUnits({itemSpecId: itemSpec.id}).then(function(response) {
                   $scope.unitList = response.units;
                });
            }else
            {
                $scope.unitList = null;
                $scope.itemProducts = null;
            }
        };
    };
    ctrl.$inject = ['$scope','$stateParams', 'putBackTaskService', 'itemService', 'lincUtil'];
    return ctrl;
});
