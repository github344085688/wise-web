'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, locationService, itemService, $q) {
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.types = ['Replenishment'];
        $scope.saveOrUpdatItemLocation = function () {
            $scope.loading = true;
            var promises = [];
            $scope.itemLocationLists.forEach(function (itemLocation) {
                var promise = locationService.addItemAndLocation($scope.itemLocationParam);
                promises.push(promise);
            });
            return $q.all(promises).then(function (response) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup();
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });

        };

        $scope.batchItemLocation = function () {
            _.forEach($scope.itemLocationLists, function (itemLocation) {
                if ($scope.batchParams.locationId) {
                    itemLocation.locationId = $scope.batchParams.locationId;
                }
                if ($scope.batchParams.itemSpecId) {
                    itemLocation.itemSpecId = $scope.batchParams.itemSpecId;
                }
                if ($scope.batchParams.productId) {
                    itemLocation.productId = $scope.batchParams.productId;
                }

            });

        }

        $scope.addItemLocation = function (index) {
            $scope.itemLocationLists.push({});
        }

        $scope.removeItemLocation = function (index) {
            $scope.itemLocationLists.splice(index, 1);
        };


        $scope.itemSpecIdOnSelect = function (itemSpecId, ifInit) {
            if (!ifInit) {
                $scope.itemProducts = null;
            }
            if (itemSpecId) {
                itemService.getDiverseByItemSpec(itemSpecId).then(function (response) {
                    $scope.itemProducts = response.diverseItemSpecs;
                    $scope.itemPropertyMap = response.itemPropertyMap;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });

            }
        };

        function init() {
            $scope.itemLocationLists = [{}];
            $scope.batchParams = {};
        }
        init();

    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'locationService', 'itemService', '$q'];
    return controller;
});
