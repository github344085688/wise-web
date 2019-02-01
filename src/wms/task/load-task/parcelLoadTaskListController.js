'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var loadTaskController = function ($scope, lincUtil, parcelLoadTaskService) {

        $scope.search = {};
        $scope.submitLabel = "search";
        $scope.searching = false;
        $scope.tasks = [];
        $scope.pageObj = {pageSize: 10};
        var currentPageIndex;
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
            currentPageIndex = currentPage;
            var param = angular.copy($scope.search);
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize) };
            param.sortingOrder = -1;
            param.sortingFields = ["createdWhen"];
            $scope.searching = true;
            parcelLoadTaskService.searchTasksByPaging(param).then(function(response)
            {
                $scope.searching = false;
                $scope.tasks = response.tasks;
                $scope.paging = response.paging;
            },function (error) {
                $scope.searching = false;
                lincUtil.errorPopup(error.data.error);
            });
        };

        $scope.deleteTask = function (taskId) {
            lincUtil.deleteConfirmPopup('Are you sure you want to delete this task?', function()
            {
                parcelLoadTaskService.deleteTask(taskId).then(function (){
                    $scope.loadContent(currentPageIndex);
                },function(error)
                {
                    lincUtil.errorPopup('Delete Error! ' + error.data.error);
                });
            });
        };

        function init() {
            $scope.loadContent(1);
        }

        init();
    }

    loadTaskController.$inject = ['$scope', 'lincUtil', 'parcelLoadTaskService'];
    return loadTaskController;
});