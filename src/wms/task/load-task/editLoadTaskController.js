'use strict';

define([
	'angular',
	'lodash',
	'moment',
	'src/wms/task/load-task/loadListController'], function (angular, _, moment, loadListCtrl) {

		var controller = function ($scope, $state, $stateParams, session, $mdDialog, loadService,
			locationService, loadTaskService, userService, entryService, lincUtil) {


			$scope.pageSize = 10;
			$scope.submitLabel = "Update";
			var originalDock;

			$scope.addLoad = function (task) {
				$mdDialog.show({
					templateUrl: 'wms/task/load-task/template/loadList.html',
					controller: loadListCtrl,
					controllerAs: 'ctrl',
					locals: {
						selectedRecordIds: _.map(task.loads, 'id')
					},
					bindToController: true
				}).then(function (selectedLoads) {
					if (selectedLoads && selectedLoads.length > 0) {
						if (!task.loads) task.loads = [];
						task.loads = _.sortBy(task.loads.concat(selectedLoads), 'id');
					}
				});
			};

			$scope.removeLoad = function (task, loadId) {
				_.remove(task.loads, function (load) {
					return load.id === loadId;
				});

				if (task.loads.length === 0) {
					task.selectedLoad = null;
					task.orderList = null;
				}
			};

			$scope.formatTime = function (time) {
				if (time) {
					return moment(time).format("YYYY-MM-DD HH:mm:ss");
				} else return "";
			};

			$scope.submit = function (task) {
				var loadIds = _.map(task.loads, 'id');
				task.loadIds = loadIds;
                if(!task.isUpdateStepAssignee) {
                    task.isUpdateStepAssignee = false;
                }
				if (task.dockId != originalDock) {
					releaseDock(task);
				}
				else {
					updateTask(task);
				}

			};
			function updateTask(task) {
				$scope.loading = true;
				loadTaskService.updateTask(task).then(function () {
					$scope.loading = false;
					lincUtil.updateSuccessfulPopup(function () {
						$state.go("wms.task.loadTask.general.list");
					});
				}, function (error) {
					$scope.loading = false;
					lincUtil.errorPopup('Save Error! ' + error.data.error);
				});
			}

			function reserveOrOccupyDock(task) {

				if (task.status === "New") {
					locationService.reserveDock(task.dockId, task.entryId).then(function (response) {
					updateTask(task);

					}, function (error) {

						lincUtil.processErrorResponse(error);

					});
				}
				if (task.status === "In Progress") {
					
					locationService.occupyDock(task.dockId, task.entryId).then(function (response) {
						updateTask(task);
					}, function (error) {

						lincUtil.processErrorResponse(error);

					});
				}

			}

			function releaseDock(task) {
				locationService.releaseDock(originalDock, task.entryId).then(function (response) {
				 reserveOrOccupyDock(task);
				},function(error){
					lincUtil.processErrorResponse(error);
				});
			}

			$scope.cancel = function () {
				$scope.currentItem = null;
				$state.go('wms.task.loadTask.general.list');
			};

			$scope.getDockLists = function () {
				locationService.getLocationList({ type: 'DOCK' }).then(function (response) {
					$scope.dockList = response;
				},function(error){
					lincUtil.processErrorResponse(error);
				});
			};

			function init() {
				loadTaskService.getTaskByTaskId($stateParams.taskId).then(function (response) {
					$scope.task = response;
					originalDock = response.dockId;
					if (response.status == "New" || response.status == "In Progress") {

						$scope.isEnable = false;
					} else {
						$scope.isEnable = true;
					}
				});
			}

			init();
		};

		controller.$inject = ['$scope', '$state', '$stateParams', 'session', '$mdDialog', 'loadsService',
			'locationService', 'loadTaskService', 'userService', 'entryService', 'lincUtil'];

		return controller;
	});