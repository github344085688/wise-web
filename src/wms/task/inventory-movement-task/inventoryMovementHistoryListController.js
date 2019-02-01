'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var ctrl = function($scope, $stateParams, inventoryMovementTaskService,lincUtil) {

        $scope.searchInfo = {};
        $scope.pageObj = {pageSize: 10};
        var processes;

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
            inventoryMovementTaskService.searchStepProcess(param).then(function(response) {
                $scope.isLoading = false;
                processes = response;
                $scope.pageObj.totalCount = processes.length;
                $scope.loadContent(1);
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.processView = processes.slice((currentPage - 1) * $scope.pageObj.pageSize,
                currentPage * $scope.pageObj.pageSize > $scope.pageObj.totalCount ? $scope.pageObj.totalCount : currentPage * $scope.pageObj.pageSize);
        };

        // function init() {
        //     // searchStepProcess($scope.searchInfo);
        // }
        //
        // init();
    };
    ctrl.$inject = ['$scope','$stateParams', 'inventoryMovementTaskService','lincUtil'];
    return ctrl;
});
