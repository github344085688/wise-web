'use strict';

define([
	'angular'
], function(angular) {
	var controller = function($scope, putBackTaskService, $state, $stateParams,lincUtil) {

		$scope.submit = function () {
			var task = getTaskSaveInfo();
			$scope.loading = true;
			putBackTaskService.updateTask(task).then(function() {
				$scope.loading = false;
				lincUtil.updateSuccessfulPopup(function () {
					$state.go('wms.task.putBackTask.view', {
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
			task.assigneeUserId = $scope.task.assigneeUserId;
			task.description = $scope.task.description;
			task.priority = $scope.task.priority;
            task.status = $scope.task.status;
            task.isUpdateStepAssignee = $scope.task.isUpdateStepAssignee ? true: false;
			task.id = $scope.task.id;
			return task;
		}

		$scope.cancel = function() {
			$state.go('wms.task.putBackTask.list');
		};

		function getPutBackTask(taskId) {
			$scope.isLoading = true;
			putBackTaskService.getTaskById(taskId).then(function (putBackTask) {
				$scope.isLoading = false;
				$scope.task = putBackTask;
			}, function (error) {
				$scope.isLoading = false;
				lincUtil.processErrorResponse(error);
			});
		}

		function init() {
			$scope.formTitle = "Edit";
			$scope.submitLabel = "Update";
			getPutBackTask($stateParams.taskId);
		}

		init();
	};

	controller.$inject = ['$scope', 'putBackTaskService', '$state', '$stateParams',
		'lincUtil'];

	return controller;
});