/**
 * Created by Giroux on 2017/1/18.
 */

'use strict';

define([
    'angular',
    'lodash',
    './createTaskController'
], function(angular, _, taskInfoController) {

    var generalTaskController = function ($scope, $resource, $mdDialog,
                                          lincUtil, generalTaskService, lincResourceFactory) {

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
            generalTaskService.searchTasksByPaging(param).then(function (response) {
                $scope.loading = false;
                $scope.tasks = response.tasks;
                $scope.paging = response.paging;
                console.log($scope.paging );
            }, function () {
                $scope.loading = false;
            });
        };

        $scope.deleteTask = function (taskId) {
            lincUtil.deleteConfirmPopup('Are you sure you want to delete this task?', function()
            {
                generalTaskService.deleteTask(taskId).then(function (){
                    removeTaskFromArrByTaskId($scope.tasks,taskId);
                    removeTaskFromArrByTaskId($scope.pageTasks,taskId);
                },function(error)
                {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.openCreateTaskDialog = function (taskId) {
            var task = null;
            if (taskId) {
                task = _.find($scope.tasks, function (task) {
                    return task.id == taskId;
                });
            }
            var isAddAction = task ? false : true;
            $mdDialog.show({
                templateUrl: 'wms/task/general-task/template/createTask.html',
                controller: taskInfoController,
                locals: {
                    task: task,
                    isAddAction: isAddAction
                },
            }).then(function () {
                getTasks({});
            });
        };

        $scope.getPriorityList = function(name) {
            return lincResourceFactory.getTaskPriority(name).then(function(response) {
                $scope.priorityList = response;
            },function(error){
                lincUtil.processErrorResponse(error);
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

    generalTaskController.$inject = ['$scope', '$resource', '$mdDialog',
        'lincUtil', 'generalTaskService', 'lincResourceFactory'];
    return generalTaskController;
})