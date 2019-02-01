/**
 * Created by Giroux on 2017/7/11.
 */

'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $timeout, inventoryService) {

        $scope.lpLocationOnSelect = function (location) {
            $scope.lpLocation = location.id;
        };

        var timer = null
        $scope.createRes;
        $scope.isLPCreating = false;
        $scope.newLpLocation = {};
        $scope.createNewLP = function () {
            if ($scope.isLPCreating) return;
            if (!$scope.newLpLocation.locationId || !$scope.newLpLocation.type) {
                return;
            }
            $scope.isLPCreating = true;

            inventoryService.createSingleLP($scope.newLpLocation).then(function (data) {
                $scope.isLPCreating = false;
                $scope.createRes = "New LP: " + data.id;
                $scope.getEmptyLP();
            }, function (error) {
                $scope.isLPCreating = false;
                $scope.createRes = error;

                if (timer != null) {
                    $timeout.cancel(timer);
                }
                timer = $timeout(function () {
                    $scope.createRes = "";
                }, 5000);
            })
        };

        $scope.notUsedLP = [];
        $scope.getEmptyLP = function () {
            inventoryService.getEmptyLP().then(function (data) {
                $scope.notUsedLP = data;
            });
        };
    };

    return controller;
});