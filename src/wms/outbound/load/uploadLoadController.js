'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function($scope, $resource) {

        $scope.upload = function(){
            var fd = new FormData();
            fd.append("loadFile", $scope.loadFile);
        };

        $scope.loadFileChange = function(element) {
            $scope.$apply(function() {
                $scope.loadFilePath = element.value;
                $scope.loadFile = element.files[0];
            });
        };

        function _init() {

        }
        _init();
    };

    controller.$inject = ['$scope', '$resource'];

    return controller;
});
