'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('lpConfigurationTemplateAutoComplete', ['$q',
        'lpConfigurationTemplateService', function($q, lpConfigurationTemplateService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/lpConfigurationTemplateAutoComplete.html',
            scope: {
                ngModel: '=',
                ngDisabled: '=',
                name: '@',
                required: '@',
                onSelect:'&',
                allowClear: '@'
            },
            link: function($scope) {
                if(!$scope.allowClear) $scope.allowClear = false;
                $scope._onSelect = function(obj){
                    if($scope.onSelect) {
                        $scope.onSelect({obj: obj});
                    }
                };

                var init = true;
                var watchModelInitialed = false;
                $scope.lpConfigurationTemplates = [];
                $scope.searchLpConfigurationTemplates = function(keyword){
                    searchLpConfigurationTemplates(keyword).then(function (data) {
                        if(init) {
                            $scope.lpConfigurationTemplates = _.unionBy($scope.itemSpecList, data, "id");
                            init = false;
                        }else {
                            $scope.lpConfigurationTemplates = data;
                        }
                    });
                };

                function searchLpConfigurationTemplates(keyword) {
                    var param = {scenario: 'Auto Complete'};
                    if(keyword) {
                        param.name = keyword;
                    }
                    return lpConfigurationTemplateService.searchLpConfigurationSingleTemplate(param);
                }

                $scope.$watch("ngModel", function(val){
                    if(!watchModelInitialed && val) {
                        lpConfigurationTemplateService.getLpConfigurationSingleTemplateById(val).then(function(data){
                            if(_.findIndex($scope.lpConfigurationTemplates, {id:data.id}) === -1){
                                $scope.lpConfigurationTemplates.push(data);
                            }
                        });
                        watchModelInitialed = true;
                    }
                });
            }
        };
    }]);


});
