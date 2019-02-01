'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, addressService, $mdDialog) {
        $scope.searchInfo = {};
        var ctrl = this;
        $scope.searchInfo.organizationId = ctrl.organizationId;

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.closeAlert = function () {
            $scope.IsHasErorrMsg = false;
        }

        $scope.search = function () {
            if (!$scope.searchInfo.organizationId) {
                $scope.IsHasErorrMsg = true;
                return;
            }
            else {
                $scope.IsHasErorrMsg = false;
            }
            $scope.searchAddressCompleted = true;
            addressService.searchAddress($scope.searchInfo).then(function (data) {
                $scope.addresses = data;
                $scope.addressMatchWithId = _.keyBy(data, 'id');
                $scope.searchAddressCompleted = false;
            }, function () {
            });
        };

        $scope.checkAddressItemIds = [];

        $scope.checkAddressItem = function (address) {
            if (_.indexOf($scope.checkAddressItemIds, address.id) > -1) {
                _.remove($scope.checkAddressItemIds, function (AddressItemId) {

                    return address.id == AddressItemId;
                })
            } else {
                $scope.checkAddressItemIds.push(address.id);
            }
        }

        $scope.isChecked = function (address) {
            return _.indexOf($scope.checkAddressItemIds, address.id) > -1;
        }

        $scope.submit = function () {

            var selectAddresses = [];
            if ($scope.checkAddressItemIds.length > 0) {
                _.forEach($scope.checkAddressItemIds, function (id) {
                    selectAddresses.push($scope.addressMatchWithId[id]);
                });
            }
            $mdDialog.hide(selectAddresses);
        }

    };

    controller.$inject = ['$scope', 'addressService', '$mdDialog'];
    return controller;
});
