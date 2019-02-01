'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var controller = function($scope, $state, $resource, $mdDialog, $timeout) {
        var BLACK_MODEL = {
            type: "Driver Name",
            value: ""
        };

        function initSet() {
            $scope.blackList = [angular.copy(BLACK_MODEL)];
        }
        initSet();

        $scope.addRow = function() {
            $scope.blackList.push(angular.copy(BLACK_MODEL));
        };

        $scope.removeRow = function($index) {
            $scope.blackList.splice($index, 1);
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.selectFile = function(element) {
            angular.element('#file1').click();
        };

        $scope.fileChange = function(element) {
            _.forEach(element.files, function(file) {
                $scope.files.push(file);
            });
            $timeout(function() {
                $scope.$apply(function() {
                    $scope.files = _.uniqBy($scope.files, 'name');
                });
            }, 100);
        };

        $scope.removeFile = function(index) {
            $scope.files.splice(index, 1);
        };

        $scope.submit = function() {
            var blackList = angular.copy($scope.blackList);
            if (blackList.length <= 0) return;
            $mdDialog.hide({
                list: blackList
            });
        };

        function _init() {
            $scope.files = [];
        }
        _init();
    };
    controller.$inject = ['$scope', '$state', '$resource', '$mdDialog', '$timeout'];
    return controller;
});