'use strict';

define(['./directives', 'angular', 'lodash'], function (directives, angular, _) {
    directives.directive('loadSearchForm', [ 'loadsService', function (loadsService) {
        return {
            restrict: "AE",
            templateUrl: 'common/directive/template/loadSearchForm.html',
            scope: {
                isLoading: '=',
                searchLoads: '&',
                hideProperties: '='
            },
            link: function ($scope, elem, attrs) {
                $scope.load = {};
                $scope._searchLoads = function(){
                    if($scope.searchLoads) {
                        var searchParam = getSearchParam();
                        $scope.searchLoads({searchParam: searchParam});
                    }
                };

                $scope.keyUpSearch = function ($event) {
                    if(!$event){
                        return;
                    }
                    if ($event.keyCode === 13) {
                        $scope._searchLoads();
                    }
                    $event.preventDefault();
                }

                function getSearchParam() {
                    var searchParam = angular.copy($scope.load);
                    if($scope.isAdvanced) {
                        delete searchParam.keyword;

                    }else {
                        if(!searchParam.keyword) {
                            searchParam = {};
                        }else {
                            searchParam = {keyword: searchParam.keyword};
                        }
                    }
                    return searchParam;
                }

                $scope.getStatusList = function (param) {
                    loadsService.getLoadStatus().then(function (response) {
                        $scope.statusList = response;
                    });
                };

                $scope.getTypeList = function (param) {
                    loadsService.getLoadTypes().then(function (response) {
                        $scope.typeList = response;
                    });
                };

            }
        };
    }])
});
