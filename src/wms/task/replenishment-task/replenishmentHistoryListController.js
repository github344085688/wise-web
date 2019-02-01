'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var ctrl = function($scope, $stateParams, replenishmentTaskService, itemService, lincUtil) {

        $scope.searchInfo = {};
        $scope.pageObj = {pageSize: 10};
        var replenishmentProcess;

        $scope.searchStepProcess = function() {
            var searchValues = _.compact(_.values($scope.searchInfo));
            if(searchValues.length == 0) {
                lincUtil.messagePopup("Tip","Empty search filter is not allowed, please fill one field at least.");
            }else {
                var searchInfo = angular.copy($scope.searchInfo);
                searchStepProcess(searchInfo);
            }
        };

        function searchStepProcess(param) {
            $scope.isLoading = true;
            replenishmentTaskService.searchStepProcess(param).then(function(response) {
                $scope.isLoading = false;
                replenishmentProcess = response;
                $scope.pageObj.totalCount = replenishmentProcess.length;
                $scope.loadContent(1);
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.replenishmentProcessView = replenishmentProcess.slice((currentPage - 1) * $scope.pageObj.pageSize,
                currentPage * $scope.pageObj.pageSize > $scope.pageObj.totalCount ? $scope.pageObj.totalCount : currentPage * $scope.pageObj.pageSize);
        };

        $scope.itemSpecIdOnSelect = function (itemSpec) {
            $scope.searchInfo.productId = null;
            if(itemSpec)
            {
                itemService.getDiverseByItemSpec(itemSpec.id).then(function(response) {
                    $scope.itemProducts = response.diverseItemSpecs;
                    $scope.itemPropertyMap = response.itemPropertyMap;
                });
            }else
            {
                $scope.itemProducts = null;
            }
        };

        function _init() {

        }

        _init();
    };
    ctrl.$inject = ['$scope','$stateParams', 'replenishmentTaskService', 'itemService', 'lincUtil'];
    return ctrl;
});
