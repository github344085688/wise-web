/**
 * Created by Giroux on 2017/1/18.
 */

'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var controller = function($scope, $mdDialog, lincUtil,
                              generalTaskService, task, isAddAction) {

        var taskEntity = {priority: "MIDDLE"};
        $scope.Task = {};
        $scope.submit = function(form) {
            $scope.errorMsg = "";
            if(!isAddAction) editTask($scope.task);
            else addTask($scope.task);
        };

        function editTask(task) {
            $scope.loading = true;
            generalTaskService.updateTask(task).then(function() {
                $scope.loading = false;
                $mdDialog.hide();
            },function(error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
                $scope.errorMsg = lincUtil.formatError(error);
            });
        }

        function addTask(task) {
            $scope.loading = true;
            generalTaskService.createTask(task).then(function(res)
            {
                $scope.loading = false;
                $mdDialog.hide();
            },function(error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
                $scope.errorMsg = lincUtil.formatError(error);
            });
        }

        $scope.closeDialog = function () {
            $mdDialog.cancel();
        };

        function init() {
            if (task) {
                $scope.title = "Edit Task";
                $scope.submitLabel = "update";
                $scope.task = angular.copy(task);
            } else {
                $scope.title = "Create Task";
                $scope.submitLabel = "save";
                $scope.task = angular.copy(taskEntity);
            }
        }
        init();
    }

    controller.$inject = ['$scope', '$mdDialog', 'lincUtil',
        'generalTaskService', 'task', 'isAddAction', 'lincResourceFactory'];
    return controller;
});