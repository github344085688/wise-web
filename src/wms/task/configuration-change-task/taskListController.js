'use strict';

define([
	'angular',
	'lodash'
], function(angular, _) {
	var controller = function($scope, $state, $stateParams, $mdDialog,
							  configurationChangeTaskService, itemService, lincUtil) {

        $scope.pageObj = {pageSize: 10};
		$scope.search = {};

		$scope.searchTask = function () {
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
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize)};
            param.sortingOrder = -1;
            param.sortingFields = ["createdWhen"];
            $scope.loading = true;
			configurationChangeTaskService.searchTasksByPaging(param).then(function(response)
			{
				$scope.loading = false;
                $scope.tasks = response.tasks;
                $scope.paging = response.paging;
			},function (error) {
				$scope.loading = false;
                lincUtil.processErrorResponse(error);
			});
        };

		$scope.deleteTask = function(taskId) {
			lincUtil.deleteConfirmPopup('Would you like to remove this ' +
				'configuration change task?', function()
			{
				configurationChangeTaskService.deleteTask(taskId).then(function (){
					var index = _.findIndex($scope.tasks, function(task) { return task.id == taskId;});
					if(index > -1) {
						$scope.tasks.splice(index, 1);
					}
					index = _.findIndex($scope.tasks, function(task) { return task.id == taskId;});
					if(index > -1) {
						$scope.tasks.splice(index, 1);
					}
				},function(error)
				{
                    lincUtil.processErrorResponse(error);
				});
			});
		};

		$scope.itemSpecIdOnSelect = function (itemSpec) {
			$scope.search.productId = null;
			if(itemSpec)
			{
				itemService.getDiverseByItemSpec(itemSpec.id).then(function(response) {
					$scope.itemProducts = response.diverseItemSpecs;
					$scope.itemPropertyMap = response.itemPropertyMap;
				});
			}else
			{
				$scope.itemProducts = null;
			}
		};

		function init() {
            $scope.loadContent(1);
        }

        init();
	};
	

	controller.$inject = ['$scope', '$state', '$stateParams', '$mdDialog',
		'configurationChangeTaskService', 'itemService', 'lincUtil'];

	return controller;
});