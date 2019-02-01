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
            searchLocationTag(searchParam);
        };


        function searchLocationTag(param) {
            $scope.loading = true;
            param.scenario=null;
            locationService.searchLocationTag(param).then(function (response) {
                $scope.locationTags = response;
                $scope.loadContent(1);
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.locationTagView = $scope.locationTags.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.locationTags.length ? $scope.locationTags.length : currentPage * $scope.pageSize);
        };
        function _init() {
            searchLocationTag({});
        }

        _init();

        $scope.delete = function (tagId) {
            lincUtil.deleteConfirmPopup('Would you like to remove this tag', function () {
                locationService.deleteLocationTag(tagId).then(function () {
                    lincUtil.messagePopup("Message", "Delete Successful.");
                    searchLocationTag({});
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };
    };

    controller.$inject = ['$scope', '$state', 'lincUtil', 'lincResourceFactory', 'locationService'];
    return controller;
});