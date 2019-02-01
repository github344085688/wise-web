'use strict';

define(['./directives'], function(directives) {
    directives.directive('unisWaittingBtn', function() {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/unisWaittingBtn.html',
            scope: {
                btnType: '@',
                btnClass: '@',
                value: '=',
                isLoading:'=',
                isReady: '='
            },
            link: function(scope) {
                scope.$watch("isReady", function(val){
                    if(val != undefined) {
                        scope.ngDisabled = !val;
                    }
                });
                scope.$watch("isLoading", function(val){
                    if(scope.isReady == false) {
                        return;
                    }
                    scope.ngDisabled = val;
                });
            }
        };
    });
});
