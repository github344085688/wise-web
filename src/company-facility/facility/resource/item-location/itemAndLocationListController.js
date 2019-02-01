'use strict';

define([
    'angular',
    'lodash',
    './editItemAndLocationController'
], function (angular, _, editItemAndLocationController) {
    var controller = function ($scope, $state, lincUtil, itemLocationService, $http) {

        $scope.pageSize = 10;
        $scope.searchParam = {};

        $scope.types = ['PIECE_PICK','CASE_PICK'];
        $scope.search = function () {
            var searchParam = angular.copy($scope.searchParam);
            searchItemAndLocation(searchParam);
        };


        function searchItemAndLocation(param) {
            $scope.loading = true;
            itemLocationService.searchItemLocation(param).then(function (response) {
                $scope.itemLocations = response.itemLocations;
                $scope.locationMap = response.locationMap;
                $scope.loadContent(1);
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.itemLocationView = $scope.itemLocations.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.itemLocations.length ? $scope.itemLocations.length : currentPage * $scope.pageSize);
        };


        $scope.delete = function (id) {
            lincUtil.deleteConfirmPopup('Would you like to remove this record', function () {
                itemLocationService.deleteItemLocation(id).then(function () {
                    lincUtil.messagePopup("Message", "Delete Successful.");
                    searchItemAndLocation({});
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.export = function() {
            if ($scope.exporting) return;
            $scope.exporting = true;
            $http.post("/report-center/item-location/download", $scope.searchParam, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "itemLocation.xlsx");
                $scope.exporting = false;
            }, function (error) {
                lincUtil.bufferErrorPopup(error);
                $scope.exporting = false;
            });
        };

        function _init() {
            searchItemAndLocation({});
        }

        _init();

    };


    controller.$inject = ['$scope', '$state', 'lincUtil', 'itemLocationService', '$http'];
    return controller;
});