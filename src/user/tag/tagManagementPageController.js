'use strict';

define(['lodash'], function(_) {
	var controller = function($scope, $resource, userTagService, lincUtil) {
		
		$scope.tags = [];

		userTagService.queryAll().then(function(response) {
			$scope.tags = response;
		});

		$scope.addTag = function() {
			var name = $scope.name;
			
			if (name && name !== '') {
				var newTag = {
					name: name
				};
				userTagService.add(newTag).then(function(response){
					newTag.id = response.id;
					$scope.tags.push(newTag);
				}, function(err){
					if(err.data) {
						lincUtil.errorPopup(err.data.error);
					}
				});
			}
		};

		$scope.removeTag = function(tag) {
			lincUtil.deleteConfirmPopup('Do you want to delete tag: ' + tag.name + '?',function() {
				userTagService.remove(tag.id).then(function(){
					$scope.tags = _.filter($scope.tags, function(item) { return item.id !=tag.id; });
				}, function(err){
					lincUtil.errorPopup(err.data.error);
				});
			});
		};
	};

	controller.$inject = ['$scope', '$resource','userTagService', 'lincUtil'];

	return controller;
});