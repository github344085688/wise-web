'use strict';

define([
	'angular',
	'src/foundation-data/billing/entry-fee-config/entryFeeConfigPageController',
	'src/foundation-data/billing/entry-fee-config/entryFeeConfig'
], function(angular, entryFeeConfigPageCtrl) {
	angular.module('linc.fd.billing',['linc.fd.billing.entryFeeConfig'])
	.config(['$stateProvider', function($stateProvider) {
		$stateProvider.state('fd.billing.entryFeeConfig', {
			url: '/entry-fee-config',
			templateUrl: 'foundation-data/billing/entry-fee-config/template/entryFeeList.html',
			controller: entryFeeConfigPageCtrl
		});
	}]);
});