'use strict';

define([
    'lodash',
    './directives'
], function (_, directives) {
    directives.directive('unisItemLineViewer', [ function () {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/unisItemLineViewer.html',
            scope: {
                itemLine: '=',
                showLocation: '@',
                isExpand: '@'
            },
            link: function($scope) {
                if(!$scope.isExpand) $scope.isExpand = false;
                $scope.expandOrClose = function () {
                    $scope.isExpand = !$scope.isExpand;
                };
            },
        };
    }]);
});