'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var putAwayTaskController = function ($scope, lincUtil,
                                          putAwayTaskService) {
        $scope.search = {};
        $scope.submitLabel = "search";
        $scope.searching = false;
        $scope.pageObj = {pageSize: 10};
        var tasks = [];

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
            putAwayTaskService.searchTasksByPaging(param).then(function(response) {
                $scope.searching = false;
                $scope.tasks = response.tasks;
                $scope.paging = response.paging;
            }, function() {
                ctrl.searching = true;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.deleteTask = function (taskId) {
            lincUtil.deleteConfirmPopup('Are you sure you want to delete this task?', function()
            {
                putAwayTaskService.deleteTask(taskId).then(function (){
                    removeTaskFromArrByTaskId($scope.tasks,taskId);
                    removeTaskFromArrByTaskId($scope.pageTasks,taskId);
                },function(error)
                {
                    lincUtil.processErrorResponse(error);
                });
            });
        };
        
        function removeTaskFromArrByTaskId(arr, taskId) {
            var index = _.findIndex(arr, function(task) { return task.id == taskId;});
            if(index > -1) {
                arr.splice(index, 1);
            }
        }
        
        function init() {
            $scope.loadContent(1);
        }

        init();

    }

    putAwayTaskController.$inject = ['$scope', 'lincUtil', 'putAwayTaskService'];
    return putAwayTaskController;
})