'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('taskStatusAutoComplete', ['lincResourceFactory', function(lincResourceFactory) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/taskStatusAutoComplete.html',

            scope: {
                ngModel: '=',
                name: '@',
                isDisabled: '=',
                required: '@',
                allowClear: '@'
            },
            link: function($scope) {
                if(!$scope.allowClear) $scope.allowClear = false;
                $scope.statusList = [];
                $scope.getStatusList = function(keyword){
                    lincResourceFactory.getTaskStatus().then(function(response){
                        $scope.statusList = response;
                    });
                };
            }
        };
    }]);
});

