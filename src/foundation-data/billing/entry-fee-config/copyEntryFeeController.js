'use strict';

define([
	'lodash'
], function(_) {
	var controller = function($scope, $state, $mdDialog, lincResourceFactory) {
		$scope.typeList = ['Inbound', 'Outbound', 'Storage', 'Material', 'Labor', 'Freight', 'Others'];

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
			],
			"Freight": [
				"Freight"
			],
			"Others": [
				"Others"
			]
		};

		// lincResourceFactory.getCustomers().then(function(response) {
		// 	response.unshift(NAObject);
		// 	$scope.customerList = response;
		// });

		// lincResourceFactory.getSupplier().then(function(response) {
		// 	response.unshift(NAObject);
		// 	$scope.supplierList = response;
		// });

		$scope.copyFromFacilityList = [{
			id: 'n/a',
			name: 'N/A'
		}, {
			id: '1',
			name: 'Facility1'
		}, {
			id: '2',
			name: 'Facility2'
		}];

		$scope.copyToFacilityList = [{
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

		var defaultType = $scope.typeList[0],
			NAObject = { id: 'n/a', name: 'N/A'};

		$scope.copyFrom = {
			type: defaultType,
			facility: $scope.copyFromFacilityList[0],
			customer: NAObject,
			supplier: NAObject,
			shippingAccount: NAObject,
			billTo: NAObject
		};

		$scope.copyTo = {
			facility: $scope.copyToFacilityList[0],
			type: 'customer'
		};

		$scope.onTypeSelect = function(type) {
			$scope.copyFrom.type = type;
		};

		$scope.getCustomerList = function(keyword) {
			// return lincResourceFactory.getCustomers().then(function(response) {
			// 	$scope.copyToCustomerList = _.xorBy($scope.copyTo.customers, response, 'name');
			// });
		};

		$scope.getSupplierList = function(keyword) {
			// return lincResourceFactory.getSupplier().then(function(response) {
			// 	$scope.copyToSupplierList = _.xorBy($scope.copyTo.suppliers, response, 'name');
			// });
		};

		$scope.getShippingAccountList = function(keyword) {
			// return lincResourceFactory.getShipToList().then(function(response) {
			// 	$scope.copyToShippingAccountList = _.xorBy($scope.copyTo.shippingAccounts, response, 'label');
			// });
		};

		$scope.$watch('copyFrom.type', function(type) {
			var serviceItemList = serviceItemMapper[type];

			$scope.serviceItemList = serviceItemList;
			$scope.copyFrom.serviceItem = serviceItemList[0];
		});

		$scope.$watch('copyTo.type', function(type) {
			switch(type) {
				case 'customer':
					$scope.copyTo.supplier = null;
					$scope.copyTo.shippingAccounts = null;
					break;
				case 'supplier':
					$scope.copyTo.customers = null;
					$scope.copyTo.shippingAccounts = null;
					break;
				case 'shippingAccount':
					$scope.copyTo.customers = null;
					$scope.copyTo.suppliers = null;
					break;
			}
		});

		$scope.submit = function() {
			var alert = $mdDialog.alert()
                .title('Success!')
                .textContent('Submit success!')
	            .ok('OK');

            $mdDialog.show(alert).then(function() {
            	$state.transitionTo('fd.billing.entryFeeConfig', {}, { reload: true });
            });
		};

		$scope.cancel = function() {
			$state.go('fd.billing.entryFeeConfig');
		};
	};

	controller.$inject = ['$scope', '$state', '$mdDialog', 'lincResourceFactory'];

	return controller;
});