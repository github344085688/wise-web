'use strict';

define([
	'angular',
	'src/inventory/inventory/listController',
	'src/inventory/inventory/viewController',
	'src/inventory/inventory/occupiedInventoryListController',
	'src/inventory/inventory/pickableInventoryListController'
], function (angular, listCtrl, viewCtrl,occupiedInventoryCtrl,pickableCtrl) {
	angular.module('linc.inventory.inventory', [])
		.config(['$stateProvider', function ($stateProvider) {
			$stateProvider.state('inventory.inventory.list', {
				url: '/list',
				views: {
					"unis-main@inventory.inventory.list": {
						templateUrl: 'inventory/inventory/template/list.html',
						controller: 'InventoryListController'
					},
					"@": {
						template: ""
					},
					"unis@": {
						templateUrl: 'common/template/unis-main.html',
						controller: 'DefaultMainPageController'
					}
				},
					data: {
						permissions: "inventory::inventory_read"
					}
				})
				.state('inventory.inventory.ocuppiedlist', {
					url: '/ocuppiedlist',
					views: {
						"unis-main@inventory.inventory.ocuppiedlist": {
							templateUrl: 'inventory/inventory/template/occupiedInventoryList.html',
							controller: 'OccupiedInventoryController'
						},
						"@": {
							template: ""
						},
						"unis@": {
							templateUrl: 'common/template/unis-main.html',
							controller: 'DefaultMainPageController'
						}
					},
						data: {
							permissions: "inventory::inventory_read"
						}
					})
					.state('inventory.inventory.pickablelist', {
						url: '/pickablelist',
						views: {
							"unis-main@inventory.inventory.pickablelist": {
								templateUrl: 'inventory/inventory/template/pickableInventoryList.html',
								controller: 'PickableInventoryController'
							},
							"@": {
								template: ""
							},
							"unis@": {
								templateUrl: 'common/template/unis-main.html',
								controller: 'DefaultMainPageController'
							}
						},
							data: {
								permissions: "inventory::inventory_read"
							}
						})
				.state('inventory.inventory.view', {
					url: '/:inventoryId',
					templateUrl: 'inventory/inventory/template/view.html',
					controller: 'ViewController',
					data: {
						permissions: "inventory::inventory_read"
					}
				});
		}])
		.controller('InventoryListController', listCtrl)
		.controller('OccupiedInventoryController', occupiedInventoryCtrl)
		.controller('PickableInventoryController', pickableCtrl)
		.controller('ViewController', viewCtrl);
});