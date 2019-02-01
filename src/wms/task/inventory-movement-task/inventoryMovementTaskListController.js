/**
 * Created by Giroux on 2017/1/18.
 */

'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {

    var taskController = function ($scope, lincUtil, inventoryMovementTaskService) {
        $scope.search = {};
        $scope.submitLabel = "search";
        $scope.loading = false;
        $scope.pageTasks = [];
        $scope.pageObj = {pageSize: 10};
        $scope.tasks = [];

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
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize) };
            param.sortingOrder = -1;
            param.sortingFields = ["createdWhen"];
            $scope.loading = true;
            inventoryMovementTaskService.searchTasksByPaging(param).then(function (response) {
                $scope.loading = false;
                $scope.tasks = response.tasks;
                $scope.paging = response.paging;
            }, function () {
                $scope.loading = false;
            });
        };

        $scope.deleteTask = function (taskId) {
            lincUtil.deleteConfirmPopup('Are you sure you want to delete this task?', function()
            {
                inventoryMovementTaskService.deleteTask(taskId).then(function (){
                    var index = _.findIndex($scope.tasks, function(task) {return task.id == taskId;});
                    if(index > -1) {
                        $scope.tasks.splice(index, 1);
                    }
                },function(error)
                {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        function init() {
            $scope.loadContent(1);
        }
        init();
    }

    taskController.$inject = ['$scope', 'lincUtil', 'inventoryMovementTaskService'];

    return taskController;
})