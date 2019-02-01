'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, loadsService,addressService, lincUtil, loadId) {
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        loadsService.getLoad(loadId).then(function (response) {
            $scope.load = response;
        });

        $scope.getAddressInfo = function (addressObject) {
            return addressService.generageAddressData(addressObject, null);
        }


    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'loadsService','addressService','lincUtil', 'loadId'];
    return controller;
});
