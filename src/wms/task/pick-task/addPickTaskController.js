'use strict';

define([
    'angular'
], function(angular) {
    var controller = function($scope, pickService, $state, $stateParams, isAddAction,
                              $mdMedia, $mdDialog, lincUtil, lincResourceFactory) {

        $scope.weightUnits =[ 'G','KG','Pound' ];
        $scope.remove = function (index) {
            $scope.task.pickRounds.splice(index, 1);
        }
        $scope.add = function () {
            $scope.task.pickRounds.push({weightUnit:'Pound'});
        }
        $scope.save = function () {
            var task = getTaskSaveInfo();
            $scope.loading = true;
            pickService.updatePickTask(task).then(function() {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go('wms.task.pickTask.view', {
                        taskId: task.id
                    });
                });
            }, function(error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };
        
        function getTaskSaveInfo() {
            var task = {};
            if ($scope.task.status === 'New') {
                task.pickType = $scope.task.pickType;
            }
            task.assigneeUserId = $scope.task.assigneeUserId;
            task.isRush = $scope.task.isRush;
            task.stagingLocation = $scope.task.stagingLocation;
            task.description = $scope.task.description;
            task.priority = $scope.task.priority;
            task.id = $scope.task.id;
            task.isUpdateStepAssignee = $scope.task.isUpdateStepAssignee ? true : false;
            task.pickRounds = $scope.task.pickRounds;
            return task;
        }

        $scope.cancel = function() {
            $state.go('wms.task.pickTask.list');
        };

        function getPickTask(taskId) {
            $scope.isLoading = true;
            pickService.getPickTask(taskId).then(function (pickTask) {
                $scope.isLoading = false;
                $scope.task = pickTask;
                if(!$scope.task.pickRounds){
                    $scope.task.pickRounds = [];
                }
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function init() {
            $scope.isAddAction = isAddAction;
            if (!isAddAction) {
                $scope.formTitle = "Edit";
                $scope.submitLabel = "Update";
                getPickTask($stateParams.taskId);
            }
            else {
                $scope.formTitle = "Add";
                $scope.submitLabel = "Save";
            }
        }

        init();

        $scope.getPickTypes = function() {
            return lincResourceFactory.getPickTypes().then(function(response) {
                $scope.pickTypes = response;
            },function(error){
                lincUtil.processErrorResponse(error);
            });
        };
    };

    controller.$inject = ['$scope', 'pickService', '$state', '$stateParams', 'isAddAction',
         '$mdMedia', '$mdDialog', 'lincUtil', 'lincResourceFactory'];

    return controller;
});