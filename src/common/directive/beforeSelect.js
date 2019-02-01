'use strict';

define([
    './directives'
], function(directives) {
    directives.directive('beforeSelect', ['$parse', function($parse) {
        return {
            require: 'uiSelect',
            link: function($scope, $element, attrs, $select) {
                var beforeSelectCallback = $parse(attrs.beforeSelect);
                $scope.$on('uis:select', function(event, item) {
                    beforeSelectCallback($scope, { $scope: $scope, $item: item });
                });
            }
        };
    }]);
});
