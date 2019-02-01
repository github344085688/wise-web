'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var loadTaskController = function ($scope, lincUtil, putBackTaskService) {

        $scope.search = {};
        $scope.submitLabel = "search";
        $scope.searching = false;
        $scope.pageObj = {pageSize: 10};

        $scope.searchTasks = function () {
            $scope.loadContent(1);
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.loadContent(1);
            }
            $event.preventDefault();
        };

        $scope.loadContent = function (currentPage) {
            var param = angular.copy($scope.search);
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize) };
            param.sortingOrder = -1;
            param.sortingFields = ["createdWhen"];
            $scope.searching = true;
            putBackTaskService.searchTasksByPaging(param).then(function(response) {
                $scope.searching = false;
                $scope.tasks = response.tasks;
                $scope.paging = response.paging;
            }, function(error) {
                lincUtil.processErrorResponse(error);
                $scope.searching = true;
            });
        };

        function init() {
            $scope.loadContent(1);
        }

        init();
    }

    loadTaskController.$inject = ['$scope', 'lincUtil', 'putBackTaskService'];
    return loadTaskController;
});