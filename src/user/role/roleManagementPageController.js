'use strict';

define(['lodash'], function(_) {
	var controller = function($scope, $resource, userRoleService, lincUtil) {
		
		$scope.roles = [];

		userRoleService.queryAll().then(function(response) {
			$scope.roles = response;
		});

		$scope.addRole = function() {
			var name = $scope.name;
			if (name && name !== '') {
				var newRole = {
					name: name
				};
				userRoleService.add(newRole).then(function(response){
					newRole.id = response.id;
					$scope.roles.push(newRole);
				},function(err) {
					if (err.data) {
						lincUtil.errorPopup(err.data.error);
					}
				});
			}
		};

		$scope.removeRole = function(role) {
			lincUtil.deleteConfirmPopup('Do you want to delete role: ' + role.name + '?', function () {
				userRoleService.remove(role.id).then(function () {
					$scope.roles = _.reject($scope.roles, {id: role.id});
				}, function(err){
					if (err.data) {
						lincUtil.errorPopup(err.data.message);
					}
				});
			});
		};
	};

	controller.$inject = ['$scope', '$resource', 'userRoleService', 'lincUtil'];

	return controller;
});