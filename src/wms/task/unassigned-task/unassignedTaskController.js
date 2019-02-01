/**
 * Created by Giroux on 2017/1/18.
 */

'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {

    var unassignedTaskController = function ($scope, $resource, $mdDialog,
                                              lincUtil,$q,lincResourceFactory,taskService) {

        $scope.search = {};
        $scope.save = [];
        $scope.submitLabel = "search";
        $scope.loading = false;
        $scope.pageTasks = [];
        $scope.pageObj = {pageSize: 10};
        $scope.tasks = [];

        $scope.searchTasks = function () {
        $scope.loadContent(1);
        };

        var date = new Date();
        $scope.during = function (date1) {
         var d1 = new Date(date1);
         var d =  Math.floor((date.getTime() - d1.getTime())/(1000*60*60));
         var result ;
         if(d > 24){
           result = Math.floor(d/24) + " days " + Math.floor(d%24) + " hours" ;
         }else {
           result = d + "hours";
         }
         return result ;
        }

        $scope.Assign =  function () {
            $scope.loading = true;
            var flag ;
            var promises = [];
            _.forEach($scope.tasks,  function (task) {
              if (task.assigneeUserId) {
                promises.push(taskService.assignTask(task.id,{assigneeUserId: task.assigneeUserId}))
              }
            });
            $q.all(promises).then(function (response) {
                 $scope.loading = false;
                 lincUtil.messagePopup("Message","Assgin tasks successful.");
            }, function (error) {
                 $scope.loading = false;
                 lincUtil.processErrorResponse(error);
                });
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
          param.noAssignee = true;
          param.statuses = ["New", "In Progress", "On Hold", "Exception"];
          $scope.loading = true;
          taskService.searchTasksByPaging(param).then(function (response) {
            $scope.loading = false;
            $scope.tasks = response.tasks;
            $scope.paging = response.paging;
            console.log($scope.paging );
          }, function (err) {
            lincUtil.processErrorResponse(err);
            $scope.loading = false;
             });
        };

        $scope.getPriorityList = function(name) {
          return lincResourceFactory.getTaskPriority(name).then(function(response) {
          $scope.priorityList = response;
          },function(error){
              lincUtil.processErrorResponse(error);
            });
        };
 
       

        function init() {
        $scope.loadContent(1);
        }
        init();
    }

    unassignedTaskController.$inject = ['$scope', '$resource', '$mdDialog',
    'lincUtil', '$q', 'lincResourceFactory','taskService'];
    return unassignedTaskController;
})