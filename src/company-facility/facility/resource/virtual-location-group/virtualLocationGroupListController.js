'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, lincUtil, lincResourceFactory, locationService) {

        $scope.pageSize = 10;
        $scope.searchParam = {};


        $scope.search = function () {

            var searchParam = angular.copy($scope.searchParam);
            searchVirtualLocationGroup(searchParam);
        };


        function searchVirtualLocationGroup(param) {
            $scope.loading = true;
            locationService.searchVirtualLocationGroupFromBam(param).then(function (response) {
                $scope.virtualLocationGroups = response.virtualGroups;
                $scope.LocationTagsMap=_.keyBy(response.locationTags,'id');
                $scope.loadContent(1);
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.virtualLoacationGroupView = $scope.virtualLocationGroups.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.virtualLocationGroups.length ? $scope.virtualLocationGroups.length : currentPage * $scope.pageSize);
        };
        function _init() {
            searchVirtualLocationGroup({});
        }

        _init();


        $scope.getVirturalTags = function (name) {
            var param = {};
            if (name) {
                param.regexName = name;
            }
            locationService.searchLocationTag(param).then(function (response) {
                $scope.virturalTags = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.delete = function (groupId) {
            lincUtil.deleteConfirmPopup('Would you like to remove this group', function () {
                locationService.deleteVirtualLocationGroup(groupId).then(function () {
                    lincUtil.messagePopup("Message", "Delete Successful.");
                    searchVirtualLocationGroup({});
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };
    };

    controller.$inject = ['$scope', '$state', 'lincUtil', 'lincResourceFactory', 'locationService'];
    return controller;
});