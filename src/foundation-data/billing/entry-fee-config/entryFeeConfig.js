'use strict';

define([
	'angular',
	'src/foundation-data/billing/entry-fee-config/entryFeeEditFormController',
	'src/foundation-data/billing/entry-fee-config/copyEntryFeeController'
], function(angular, editFormCtrl, copyEntryFeeCtrl) {
	angular.module('linc.fd.billing.entryFeeConfig', [])
	.config(['$stateProvider', function($stateProvider) {
		$stateProvider.state('fd.billing.entryFeeConfig.edit', {
			url: '/edit/:entryFeeId',
			templateUrl: 'foundation-data/billing/entry-fee-config/template/editForm.html',
			controller: editFormCtrl
		}).state('fd.billing.entryFeeConfig.copy', {
			url: '/copy',
			templateUrl: 'foundation-data/billing/entry-fee-config/template/copyEntryFee.html',
			controller: copyEntryFeeCtrl
		});
	}]);
});