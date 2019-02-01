'use strict';

define(['lodash',
	'./editPermissionController'
], function (_, editPermissionController) {
	var controller = function ($scope, $resource, permissionService, $mdDialog, lincUtil) {

		$scope.tags = [];
		$scope.pageSize = 10;

		$scope.searchPermissions = function () {
			searchPermissions($scope.permissionSearch);
		}

		function searchPermissions(param) {
			permissionService.search(param).then(function (response) {
				$scope.permissions =_.reverse(permissionService.sortPermissionsByName(response));
				$scope.loadContent(1);
			});
		}

		$scope.loadContent = function (currentPage) {
			$scope.permissionView = $scope.permissions.slice((currentPage - 1) * $scope.pageSize,
				currentPage * $scope.pageSize > $scope.permissions.length ? $scope.permissions.length : currentPage * $scope.pageSize);
		};

		$scope.addOrUpdatePermission = function (permissionId) {
			var form = {
				templateUrl: 'user/permission/template/editPermission.html',
				locals: {
					permissionId: permissionId
				},
				autoWrap: true,
				controller: editPermissionController
			};
			$mdDialog.show(form).then(function (response) {
				if (response)
					$scope.permissions.unshift(response.permission);
			});
		};

		$scope.removePermission = function (permission) {
			lincUtil.deleteConfirmPopup('Do you want to delete ' + permission.name + ' ?', function () {
				permissionService.remove(permission.id).then(function () {
					$scope.permissions = _.reject($scope.permissions, {
						id: permission.id
					});
				}, function (err) {
					lincUtil.processErrorResponse(err);
				});
			});
		};

		function init() {
			searchPermissions({});
		}

		init();
	};

	controller.$inject = ['$scope', '$resource', 'permissionService', '$mdDialog', 'lincUtil'];

	return controller;
});