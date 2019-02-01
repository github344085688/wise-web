'use strict';

define([
	'lodash'
], function(_) {
	var controller = function($scope, $state, $stateParams, $mdDialog, lincResourceFactory) {
		var entryFeeId = $stateParams.entryFeeId,
			createAnother = false,
			NAObject = { id: 'n/a', name: 'N/A'};

		$scope.isNew = entryFeeId === 'new';

		$scope.typeList = ['Inbound', 'Outbound', 'Storage', 'Material', 'Labor', 'Freight', 'Others'];

		
		$scope.facilityList = [{
			id: 'n/a',
			name: 'N/A'
		}, {
			id: '1',
			name: 'Facility1'
		}, {
			id: '2',
			name: 'Facility2'
		}];

		$scope.billToList = [{
			id: 'n/a',
			name: 'N/A'
		}, {
			id: '1',
			name: 'BillTo1'
		}, {
			id: '2',
			name: 'BillTo2'
		}];

		$scope.shippingAccountList = [{
			id: 'n/a',
			name: 'N/A'
		}, {
			id: '1',
			name: 'ShippingAccount1'
		}, {
			id: '2',
			name: 'ShippingAccount2'
		}];

		$scope.productList = [{
			id: 'singleItem',
			name: 'Single Item'
		}, {
			id: 'itemGroup',
			name: 'Item Group'
		}, {
			id: 'n/a',
			name: 'N/A'
		}];

		var serviceItemMapper = {
			"Inbound": [
				"Receipt"
			],
			"Outbound": [
				"Picking", "Loading", "Packing", "Kitting", "Labeling", "Tag", "Slip sheet application", "Corner board application"
			],
			"Storage": [
				"Type", "Billing Cycle", "Grace Period"
			],
			"Material": [
				"Pallet Usage"
			],
			"Labor": [
				"Over Time"
			]
		};

		$scope.frequencyList = ["Monthly", "Weekly", "Bi-monthly", "Daily", "Anniversary"];

		$scope.onTypeSelect = function(type) {
			$scope.currentItem.type = type;
		};

		var unitMapper = {
			"Receipt": ["per container","per pallet","per case","per piece","per drum","per barrel","per pound","per ton","per kg","per cft"],
			"Picking": ["per case", "per piece"],
			"Loading": ["per pallet", "small parcel", "loose"],
			"Packing": ["per case", "per piece"],
			"Kitting": ["parent item", "child item"],
			"Labeling": ["per case", "per piece", "per pallet", "per each"],
			"Tag": ["per each"],
			"Slip sheet application": ["per pallet", "per each", "per box"],
			"Corner board application": ["per pallet", "per case", "per each"],
			"Type": ["per case", "per piece", "per pallet", "per container", "per cft", "per sqft"], 
			"Billing Cycle": ["monthly", "weekly", "bi-monthly", "daily", "anniversary"], 
			"Grace Period": ["day", "month", "week"],
			"Pallet Usage": ["per pallet"],
			"Over Time": ["hour"]
		};

		$scope.onServiceItemSelect = function(serviceItem) {
			$scope.currentItem.serviceItem = serviceItem;
		};

		var unitTypeMapper = {
			"per pallet": ["40*80", "40*60"]
		};

		$scope.onUnitSelect = function(unit) {
			$scope.currentItem.unit = unit;
		};

		$scope.itemList = [{
			id: '1',
			name: 'Item1'
		}, {
			id: '2',
			name: 'Item2'
		}];

		$scope.itemGroupList = [{
			id: '1',
			name: 'Group 1'
		}, {
			id: '1',
			name: 'Group 2'
		}];

		$scope.onProductSelect = function(product) {
			$scope.currentItem.product = product;
		};

		$scope.$watch('currentItem.type', function(type) {
			var serviceItemList = serviceItemMapper[type];

			$scope.serviceItemList = serviceItemList;
			$scope.currentItem.serviceItem = serviceItemList[0];
			
			if (type !== 'Storage') {
				$scope.currentItem.frequency = null;
			} else {
				$scope.currentItem.frequency = $scope.frequencyList[0];
			}
		});

		$scope.$watch('currentItem.serviceItem', function(serviceItem) {
			var unitList = unitMapper[serviceItem];
			$scope.unitList = unitList;
			$scope.currentItem.unit = unitList[0];
		});

		$scope.$watch('currentItem.unit', function(unit) {
			var unitTypeList = unitTypeMapper[unit];
			$scope.unitTypeList = unitTypeList;
			$scope.currentItem.unitType = unitTypeList? unitTypeList[0]: null;
		});

		$scope.$watch('currentItem.product', function(product) {
			if (product.id === 'singleItem') {
				$scope.currentItem.item = $scope.itemList[0];
			} else if (product.id === 'itemGroup') {
				$scope.currentItem.itemGroup = $scope.itemGroupList[0];
			}
		});

		if ($scope.isNew) {
			var defaultType = $scope.typeList[0];

			$scope.currentItem = {
				type: defaultType,
				facility: $scope.facilityList[0],
				customer: NAObject,
				supplier: NAObject,
				shippingAccount: NAObject,
				billTo: NAObject,
				product: NAObject
			};
		} else {
			$scope.currentItem = {};
		}

		$scope.onCreateAnotherClick = function() {
			createAnother = !createAnother;
		};

		$scope.submit = function() {
			var alert = $mdDialog.alert()
                .title('Success!')
                .textContent('Submit success!')
	            .ok('OK');

            $mdDialog.show(alert).then(function() {
            	if (!createAnother) {
            		$state.transitionTo('fd.billing.entryFeeConfig', {}, { reload: true });
            	}
            });
		};

		var discardConfirm = function(callback) {
			var dialog = $mdDialog.confirm()
	            .title('Confirm')
	            .textContent('Do you want to discard the changes of current entry fee?')
	            .ok('Yes')
	            .cancel('No');

			if ($scope.editForm.$dirty) {
	            $mdDialog.show(dialog).then(function() {
	            	callback();
	            });
			} else {
				callback();
			}
		};

		$scope.cancel = function() {
			discardConfirm(function() {
            	$state.transitionTo('fd.billing.entryFeeConfig', {}, { reload: true });
			});
		};

	};

	controller.$inject = ['$scope', '$state', '$stateParams', '$mdDialog', 'lincResourceFactory'];

	return controller;
});