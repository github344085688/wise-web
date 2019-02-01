'use strict';

define(['angular'], function(angular) {
    var controller = function($scope, $stateParams, addressService, lincUtil) {
        var param = {tags:["BillTo", "ShipTo"], organizationId:$stateParams.organizationId};

        function searchAddress() {
            addressService.searchAddress(param).then(function(data) {
                $scope.addresses = data;
            });
        }

        $scope.remove = function(index) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function() {
                addressService.remove($scope.addresses[index].id).then(function() {
                    $scope.addresses.splice(index, 1);
                }, function() {
                    lincUtil.errorPopup("Error Found While Removing");
                });
            });
        };

        searchAddress();
    };

    controller.$inject = ['$scope', '$stateParams', 'addressService', 'lincUtil'];
    return controller;
});