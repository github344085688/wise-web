'use strict';

define(['angular', 'lodash'], function (angular, _) {
	var controller = function ($scope, userService, lincUtil, $http) {
		$scope.isAdvanced = false;
		$scope.pageSize = 10;
		$scope.loadContent = function (currentPage) {

			$scope.userView = $scope.userList.slice((currentPage - 1) * $scope.pageSize, currentPage * $scope.pageSize > $scope.userList.length ? $scope.userList.length : currentPage * $scope.pageSize);
		};

		$scope.searchInfo = { keyword: "" };
		$scope.search = function () {
			$scope.searchInfo.isAndroidOnline = null;
			if ($scope.isAdvanced) {
				if ($scope.searchInfo.isOnline === "Online") {
					$scope.searchInfo.isAndroidOnline = true;
				} else if ($scope.searchInfo.isOnline === "Offline") {
					$scope.searchInfo.isAndroidOnline = false;
				}
			}
			$scope.loading = true;
			searchUser();
		}

		function searchUser() {
			userService.searchUsers($scope.searchInfo).then(function (data) {
				$scope.userList = data;
				$scope.loadContent(1);
				$scope.loading = false;
			}, function (error) {
				lincUtil.processErrorResponse(error);
				$scope.loading = false;
			});
		}




		$scope.export = function () {

			if ($scope.exporting) return;
			$scope.exporting = true;

			var param = {};

			param.data = angular.copy($scope.userList);
			_.forEach(param.data, function (data) {
				if (data.roles && data.roles.length > 0) {
					var roleNames = _.map(data.roles, 'name');
					data.roles = roleNames.toString();
				}

			});
			param.head = ["username", "firstName", "lastName", "lastLoginWhen", "roles"];

			$http.post("/wms-app/report/export", param, {
				responseType: 'arraybuffer'
			}).then(function (res) {
				$scope.exporting = false;
				if (res.data.byteLength == 0) {
					lincUtil.errorPopup("Export failed!");
					return;
				}
				lincUtil.exportFile(res, "userManagement.xlsx");

			}, function (error) {
				$scope.exporting = false;
				lincUtil.errorPopup(error);
			});
		};

		function _init() {
			$scope.search();
		}
		_init();

	};

	controller.$inject = ['$scope', 'userService', 'lincUtil', '$http'];

	return controller;
});