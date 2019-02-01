'use strict';

define(["angular"], function (angular) {
    var controller = function ($scope, addressService, lincUtil) {
        $scope.pageSize = 10;
        $scope.searchInfo = {};

        searchAddress({});

        $scope.search = function () {
            searchAddress($scope.searchInfo);
        };

        function searchAddress(param) {
            $scope.loading = true;
            addressService.searchAddress(param).then(function (data) {
                $scope.loading = false;
                $scope.addresses = data;
                $scope.loadContent(1);
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.addressesView = $scope.addresses.slice((currentPage - 1) * $scope.pageSize, currentPage * $scope.pageSize > $scope.addresses.length ? $scope.addresses.length : currentPage * $scope.pageSize);
        };

        $scope.remove = function (index) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this record?", function () {
                addressService.remove($scope.addresses[index].id).then(function () {
                    $scope.addressesView.splice(index, 1);
                }, function () {
                    lincUtil.errorPopup("Error Found While Removing");
                });
            });
        };
        $scope.advanceSearch = function () {
            $scope.searchInfo = {};
            $scope.isKeyOrAdvanceSeach = true;
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                searchAddress($scope.searchInfo);
            }
            $event.preventDefault();
        };

        $scope.keySearch = function () {
            $scope.searchInfo = {};
            $scope.isKeyOrAdvanceSeach = false;
        }
    };
    controller.$inject = ['$scope', 'addressService', 'lincUtil'];
    return controller;
});
