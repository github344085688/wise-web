'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var controller = function($scope, $mdDialog, $http, locationService, lincUtil, longHaulService) {

        $scope.pageSize = 10;
        $scope.searchInfo = {};
        $scope.longHaulShipDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


        searchMilkRun({});

        $scope.search = function() {
            $scope.searchMilkRunCompleted = false;
            searchMilkRun($scope.searchInfo);

        };

        function searchMilkRun(param) {
            longHaulService.LongHaulSearch(param).then(function(data) {
                $scope.milkRuns = data.milkRuns;

                $scope.loadContent(1);
                $scope.searchMilkRunCompleted = true;
            }, function(error) {
                lincUtil.processErrorResponse(error);
            });
        }


        $scope.loadContent = function(currentPage) {

            $scope.milkRunView = $scope.milkRuns.slice((currentPage - 1) * $scope.pageSize, currentPage * $scope.pageSize > $scope.milkRuns.length ? $scope.milkRuns.length : currentPage * $scope.pageSize);
        };

        $scope.remove = function(milkRun) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function() {
                longHaulService.removeLongHaul(milkRun.id).then(function() {
                    searchMilkRun({});
                }, function(Error) {
                    lincUtil.processErrorResponse(error);
                });

            });
        };

        $scope.getLongHaulList = function(keyword){
            longHaulService.LongHaulSearch({regexLongHaulNo: keyword}).then(function(response){
                $scope.longHauls = response.milkRuns;
            });
        };

        $scope.export = function() {
            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/fd-app/long-haul/export", $scope.searchInfo, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "longHaul.xls");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.search();
            }
            $event.preventDefault();
        };

    };
    controller.$inject = ['$scope', '$mdDialog', '$http', 'locationService', 'lincUtil', 'longHaulService'];
    return controller;
});
