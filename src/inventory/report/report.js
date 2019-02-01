'use strict';

define([
	'angular',
	'src/inventory/report/reportListController',
	'src/inventory/report/addReportController'
], function(angular, listCtrl, addReportCtrl) {
	angular.module('linc.inventory.report', [])
		.config(['$stateProvider', function($stateProvider) {
			$stateProvider.state('inventory.report.list', {
					url: '/list',
					templateUrl: 'inventory/report/template/reportList.html',
					controller: 'InventoryReportListController',
					data: {
						permissions: "inventory::report_read"
					}
				})
				.state('inventory.report.add', {
					url: '/add',
					templateUrl: 'inventory/report/template/addReport.html',
					controller: 'AddReportController',
					data: {
						permissions: "inventory::report_write"
					}
				});

		}])
		.controller('InventoryReportListController', listCtrl)
		.controller('AddReportController', addReportCtrl);
});