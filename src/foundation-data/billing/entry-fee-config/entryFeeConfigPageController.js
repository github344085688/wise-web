'use strict';

define([], function() {
	var controller = function($scope, $state, $resource) {
		var entry = $resource('../data/fd/billing/entry-fee/entry-fee-list.json');

		entry.query(function(response) {
			$scope.entryFeeList = response;
		});

		$scope.addEntryFee = function() {
			$state.go('fd.billing.entryFeeConfig.edit', { entryFeeId: 'new' });
		};

		$scope.copyEntryFee = function() {
			$state.go('fd.billing.entryFeeConfig.copy');
		};
	};

	controller.$inject = ['$scope', '$state', '$resource'];

	return controller;
});