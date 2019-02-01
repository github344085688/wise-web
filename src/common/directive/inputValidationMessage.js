'use strict';

define([
    './directives'
], function(directives) {
    directives.directive('inputValidationMessage',['$compile', function($compile) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/inputValidationMessage.html',
            replace: true,
            scope: {
                form: '=',
                field: '@',
                message: '@'
            },
            controller : function($scope){
                $scope.hasCustumMessage = function(){
                    return !($scope.message === undefined || $scope.message === "");
                };
            }
        };
    }]);
});
