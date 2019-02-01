'use strict';

define([
    'angular',
    './directives'
], function(angular, directives) {
    directives.directive('uiSelectRequired', function() {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ctrl) {
                ctrl.$validators.uiSelectRequired = function (modelValue, viewValue) {
                    if (attr.uiSelectRequired) {
                        var isRequired = scope.$eval(attr.uiSelectRequired);
                        if (isRequired === false)
                            return true;
                    }
                    var determineVal;
                    if (angular.isArray(modelValue)) {
                        determineVal = modelValue;
                    } else if (angular.isArray(viewValue)) {
                        determineVal = viewValue;
                    } else {
                        return false;
                    }
                    return determineVal.length > 0;
                };
            }
        };
    });
});
