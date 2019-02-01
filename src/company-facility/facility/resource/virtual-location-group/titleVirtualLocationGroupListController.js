'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, lincUtil, titleVirtualLocationGoupService) {

        $scope.pageSize = 10;
        $scope.searchParam = {};

        $scope.search = function () {
            var searchParam = angular.copy($scope.searchInfo);
            searchGroup(searchParam);
        };

        function searchGroup(param) {
            $scope.loading = true;
            titleVirtualLocationGoupService.search(param).then(function (response) {
                $scope.groups = response;
                $scope.loadContent(1);
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.titleCustomCtrl = {};
        $scope.customerChange = function (customer) {
            $scope.titleCustomCtrl.manualRefreshOptions(customer.id);
        };


        $scope.loadContent = function (currentPage) {
            $scope.groupsView = $scope.groups.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.groups.length ? $scope.groups.length : currentPage * $scope.pageSize);
        };


        $scope.delete = function (groupId) {
            lincUtil.deleteConfirmPopup('Would you like to remove this group', function () {
                titleVirtualLocationGoupService.deleteById(groupId).then(function () {
                    lincUtil.messagePopup("Message", "Delete Successful.");
                    searchGroup({});
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        function _init() {
            searchGroup({});
        }

        _init();

    };

    controller.$inject = ['$scope', '$state', 'lincUtil', 'titleVirtualLocationGoupService'];
    return controller;
});