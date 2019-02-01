'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('taskPriorityAutoComplete', ['lincResourceFactory', function(lincResourceFactory) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/taskPriorityAutoComplete.html',

            scope: {
                ngModel: '=',
                name: '@',
                isDisabled: '=',
                required: '@',
                allowClear: '@'
            },
            link: function($scope) {
                if(!$scope.allowClear) $scope.allowClear = false;
                $scope.priorityList = [];
                $scope.getPriorityList = function(keyword){
                    lincResourceFactory.getTaskPriority().then(function(response){
                        $scope.priorityList = response;
                    });
                };
            }
        };
    }]);
});

