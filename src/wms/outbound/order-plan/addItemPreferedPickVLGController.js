'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, orderService) {

        $scope.cancel = function () {
            $mdDialog.hide();
        };
        $scope.submitVGL = function () {
            $scope.loading = true;
            if ($scope.labelName == "Add") {
                orderService.createItemPreferedPickVLG($scope.itemAndVLG).then(function (response) {
                    $scope.loading = false;
                    _init();
                }, function (error) {
                    $scope.loading = false;  
                    $scope.errorMsg = error.message;
                });
            } else {
                orderService.updateItemPreferedPickVLGConfiguration($scope.itemAndVLG).then(function (response) {
                    $scope.loading = false;
                    _init();
                }, function (error) {
                    $scope.loading = false;
                    $scope.errorMsg = error.message;
                });
            }

        }

        $scope.btnDelVLG = function (id) {
            orderService.deleteItemPreferedPickVLGConfiguration(id).then(function (response) {
                _init();
            }, function (error) {
                $scope.errorMsg = error.message;
            });
        };

        $scope.btnEditVLG = function (itemVirtualLocation) {
            $scope.labelName = "Update";
            $scope.itemAndVLG = angular.copy(itemVirtualLocation);
        };

        function getItemPreferedPickVLGConfiguration() {

            orderService.ItemPreferedPickVLGConfiguration().then(function (response) {
                $scope.itemPreferedPickVLGConfigurations = response;
              
            }, function (error) {
              
                $scope.errorMsg = error.message;
            });
        }

        function _init() {
            $scope.itemAndVLG = {};
            $scope.labelName = "Add";
            getItemPreferedPickVLGConfiguration();
        }
        _init();
    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'orderService'];
    return controller;
});
