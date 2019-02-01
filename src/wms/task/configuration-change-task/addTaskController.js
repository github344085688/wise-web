'use strict';

define([
	'angular',
	'lodash',
    'moment'
	], function(angular, _, moment) {
	var controller = function($scope, $state, $stateParams, isAddAction,
							  configurationChangeTaskService, itemService, lincUtil){
		
		var CREATE_TITLE = "Add";
		var EDIT_TITLE = "Edit";
		var NEW_ENTRY = {taskWay: "Batch Configuration Change", priority: "MIDDLE"};
		initSet();

		function initSet() {
			$scope.isAddAction = isAddAction;
			if (!isAddAction) {
				$scope.formTitle = EDIT_TITLE;
				$scope.submitLabel = "Update";
				getTask($stateParams.taskId);
			} else {
				$scope.formTitle = CREATE_TITLE;
				$scope.submitLabel = "Save";
				$scope.task = angular.copy(NEW_ENTRY);
			}
		}

		function getTask(taskId) {
			configurationChangeTaskService.getTaskById(taskId).then(function(task)
			{
				$scope.task = task;
				if(task.itemSpecId) {
					$scope.itemSpecIdOnSelect(task.itemSpecId, true)
				}
			});
		}

		$scope.itemSpecIdOnSelect = function (itemSpecId, ifInit) {
			if(!ifInit) {
				$scope.task.productId = null;
				$scope.itemProducts = null;
			}
			if(itemSpecId) {
				itemService.getDiverseByItemSpec(itemSpecId).then(function (response) {
					$scope.itemProducts = response.diverseItemSpecs;
					$scope.itemPropertyMap = response.itemPropertyMap;
				});
				getUnitsByItemId(itemSpecId);
			}
		};

		function getUnitsByItemId(itemSpecId) {
			itemService.searchItemUnits({itemSpecId:itemSpecId}).then(function(unitsObj)
			{
				$scope.itemSpecUnits = unitsObj.units;
				if(!$scope.task.unitId)
				{
					angular.forEach(unitsObj.units, function(unit) {
						if(unit.isDefaultUnit)
						{
							$scope.task.unitId = unit.id;
							return;
						}
					});
				}
			});
		}
		
		$scope.submit = function () {
			var task = angular.copy($scope.task);
            if(!task.isUpdateStepAssignee) {
                task.isUpdateStepAssignee = false;
            }
			$scope.loading = true;
			if (!isAddAction) {
				updateTask(task);
			} else {
				createTask(task)
			}
		};
		
		function createTask(task) {
			configurationChangeTaskService.createTask(task).then(function (response) {
				$scope.loading = false;
				lincUtil.saveSuccessfulPopup(function () {
					$state.go('wms.task.configurationChangeTask.list');
				});
			}, function (error) {
				$scope.loading = false;
				lincUtil.errorPopup(error.data.error);
			});
		}
		
		function updateTask(task) {
			configurationChangeTaskService.updateTask(task).then(function (response) {
				$scope.loading = false;
				lincUtil.updateSuccessfulPopup(function () {
					$state.go('wms.task.configurationChangeTask.list');
				});
			}, function (error) {
				$scope.loading = false;
				lincUtil.errorPopup(error.data.error);
			});
		}
		
		$scope.cancel = function (form) {
			$state.go('wms.task.configurationChangeTask.list');
		};

	};
	controller.$inject = ['$scope', '$state', '$stateParams', 'isAddAction',
		'configurationChangeTaskService', 'itemService', 'lincUtil'];
	return controller;
});