'use strict';

define([
	'angular',
	'lodash'
], function(angular, _) {
	var controller = function($scope, $resource, $mdDialog, loadsService, lincUtil) {
		var ctrl = this, totalRecordCount = 0;
		$scope.recordList = [];
		var hasRecordIds = angular.copy(ctrl.selectedRecordIds);

		$scope.searchLoads = function (searchParam) {
			getLoads(searchParam);
		};

		function getLoads(searchParam) {
			searchParam.statuses = ["New"];
			loadsService.searchLoad(searchParam).then(function (response) {
				$scope.recordList= _.reject(response, function(record) {
					return hasRecordIds && hasRecordIds.indexOf(record.id) > -1;
				});
				totalRecordCount = $scope.recordList.length;
			}, function (error) {
				lincUtil.processErrorResponse(error);
			});
		}

		$scope.toggleSelection = function(recordId) {
			if (recordId) {
				if (ctrl.selectedRecordIds.indexOf(recordId) > -1) {
					_.remove(ctrl.selectedRecordIds, function(n) {
						return n === recordId;
					});

					if (ctrl.selectedRecordIds.length !== totalRecordCount) {
						$scope.selectAll = false;
					}
				} else {
					ctrl.selectedRecordIds.push(recordId);

					if (ctrl.selectedRecordIds.length === totalRecordCount) {
						$scope.selectAll = true;
					}
				}
			} else {
				if ($scope.selectAll) {
					ctrl.selectedRecordIds = [];
					$scope.selectAll = false;
				} else {
					ctrl.selectedRecordIds = _.map($scope.recordList, 'id');
					$scope.selectAll = true;
				}
			}
		};

		$scope.confirm = function() {
			if (ctrl.selectedRecordIds.length === 0) {
				window.alert("Please select an record at lease!");
			} else {
				var selectedRecords = _.filter($scope.recordList, function(record) {
					return ctrl.selectedRecordIds.indexOf(record.id) > -1;
				});
				$mdDialog.hide(selectedRecords);
			}
		};

		$scope.cancel = function() {
			$mdDialog.hide();
		};

		function init() {
			getLoads({});
		}

		init();
	};

	controller.$inject = ['$scope', '$resource', '$mdDialog', 'loadsService', 'lincUtil'];

	return controller;
});