'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, lincUtil, lincResourceFactory, conveyorService) {

        $scope.conveyorBranchParam={};

         $scope.search = function (){
            var param = angular.copy($scope.conveyorBranchParam);
            searchConveryBranch(param);
         }

        function searchConveryLine() {
            $scope.loading = true;
            conveyorService.converyLineSearch({}).then(function (response) {
                $scope.conveyorLineList = response;
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function searchConveryBranch(param) {
            $scope.loading = true;
            conveyorService.converyBranchSearch(param).then(function (response) {
                $scope.conveyorBranchList = response;
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.delete = function (branchId) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this branch?", function () {
                conveyorService.converyBranchDelete(branchId).then(function (response) {
                    lincUtil.messagePopup('Message', 'Delete Successful.');
                    _init();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
                
            });
        };

        function _init() {
          searchConveryBranch({});
          searchConveryLine();
        }

        _init();



    };

    controller.$inject = ['$scope', '$state', 'lincUtil', 'lincResourceFactory', 'conveyorService'];
    return controller;
});