'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('multipleItemGroupAutoComplete', ['$q', 'itemPropertyService', function($q, itemPropertyService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/multipleItemGroupAutoComplete.html',
            scope: {
                ngModel: '=',
                ngDisabled: '=',
                name: '@',
                required: '@',
                onSelect:'&',
                allowClear: '@'
            },
            link: function($scope) {
                $scope._onSelect = function(group){
                    if($scope.onSelect) {
                        $scope.onSelect({group: group});
                    }
                };
                $scope._onRemove = function(group){
                    if($scope.onRemove) {
                        $scope.onRemove({group: group});
                    }
                };
             
                $scope.itemGroupList = [];
                
                $scope.searchItemGroup = function(keyword){
                    var param = {scenario: 'Auto Complete'};
                    if(keyword && keyword !== ""){
                        param.name = keyword
                    }
                    itemPropertyService.searchGroupBasicInfo(param).then(function(response){
                        if($scope.ngModel && $scope.ngModel.length > 0) {
                            $scope.itemGroupList = _.differenceWith(response, $scope.ngModel, function(value, other){
                                return value.id === other;
                            });
                        }else {
                            $scope.itemGroupList = response;
                        }
                    });
                };

                $scope.$watch("ngModel", function(val){
                    $scope.searchItemGroup("");
                });

            }
        };
    }]);


});
