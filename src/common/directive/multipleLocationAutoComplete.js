'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('multipleLocationAutoComplete', ['$q', 'locationService', function ($q, locationService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/multipleLocationAutoComplete.html',

            scope: {
                ngModel: '=',
                name: '@',
                ifDisabled: '=',
                required: '@',
                onSelect: '&'
            },
            link: function ($scope) {

                $scope._onSelect = function (location) {
                    if ($scope.onSelect) {
                        $scope.onSelect({ location: location });
                    }
                };

                var init = true;
                $scope.locations = [];

                $scope.getLocations = function (keyword) {
                    var param = { regexName: keyword, paging: { pageNo: 1, limit: 30 } };
                    if (init) {
                        locationService.locationBasicInfoSearchByPaging(param).then(function (response) {
                            $scope.locations = response.locations;
                            organizadLocations(keyword);
                        });
                        init = false;
                    } else {
                        locationService.locationBasicInfoSearchByPaging(param).then(function (response) {
                            $scope.locations = response.locations;
                            organizadLocations(keyword);
                        });
                    }

                };
                function organizadLocations(keyword) {
                    $scope.locations= _.orderBy($scope.locations, function (location) { return location.name.toUpperCase() === keyword.toUpperCase() ? -1 : 1 });
                }

                $scope.$watch("ngModel", function (val) {
                    $scope.getLocations("");

                });
            }
        };
    }]);
});
