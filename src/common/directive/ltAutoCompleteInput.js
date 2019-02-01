'use strict';

define(['./directives'], function(directives) {
    directives.directive('ltAutoCompleteInput', ['$timeout', function($timeout) {
        return {
            restrict: "E",
            // replace:true,
            link: function(scope, element) {
                scope.focus = function() {
                    scope.textFocus = 'open';
                    scope.refresh().then(function(response) {
                        scope.dataList = response;
                    });
                };

                scope.keyUp = function() {
                    scope.refresh().then(function(response) {
                        scope.dataList = response;
                    });
                    scope.value = scope.data;
                };

                scope.blur = function() {
                    $timeout(function() {
                        scope.textFocus = '';
                    }, 200);
                };

                scope.select = function(data) {
                    scope.data = data[scope.property] || data;
                    scope.textFocus = '';
                    scope.value = data;
                };

                scope.$watch('value', function(newValue, oldValue, scope) {
                    if (scope.property) {
                        scope.data = scope.value ? scope.value[scope.property] : scope.value;
                    } else {
                        scope.data = scope.value;
                    }

                });

                if (scope.property) {
                    scope.data = scope.value ? scope.value[scope.property] : scope.value;
                } else {
                    scope.data = scope.value;
                }
            },
            templateUrl: 'common/directive/template/ltAutoCompleteInput.html',
            scope: {
                value: '=value',
                refresh: '&',
                clazz: '@',
                property: '@'
            }

        };

    }]);
});
