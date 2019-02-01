'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function($scope, parcelPackTaskService, $state, $stateParams, lincUtil) {
        $scope.pageObj = {pageSize: 10};
        $scope.search = {};
        $scope.searching = false;
        var currentPageIndex;

        $scope.loadContent = function (currentPage) {
            currentPageIndex = currentPage;
            var param = angular.copy($scope.search);
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize)};
            param.sortingOrder = -1;
            param.sortingFields = ["createdWhen"];
            $scope.searching = true;
            parcelPackTaskService.searchTasksByPaging(param).then(function(response) {
                $scope.searching = false;
                $scope.tasks = response.tasks;
                $scope.paging = response.paging;
            },function () {
                $scope.searching = false;
            });
        };

        $scope.deleteTask = function (taskId) {
            lincUtil.deleteConfirmPopup('Are you sure you want to delete this task?', function()
            {
                parcelPackTaskService.deleteTask(taskId).then(function (){
                    removeTaskFromArrByTaskId($scope.tasks,taskId);
                    $scope.loadContent(currentPageIndex);
                },function(error)
                {
                    lincUtil.errorPopup('Delete Error! ' + error.data.error);
                });
            });
        };

        function removeTaskFromArrByTaskId(arr, taskId) {
            var index = _.findIndex(arr, function(task) { return task.id == taskId;});
            if(index > -1) {
                arr.splice(index, 1);
            }
        }

        $scope.searchTasks = function() {
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

        function _init() {
            $scope.loadContent(1);
        }
        _init();
    };
    controller.$inject = ['$scope', 'parcelPackTaskService', '$state', '$stateParams', 'lincUtil'];
    return controller;
});
