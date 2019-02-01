'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('locationVirtualGroupAutoComplete', ['locationService', function (locationService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/locationVirtualGroupAutoComplete.html',

            scope: {
                ngModel: '=',
                name: '@',
                isDisabled: '=',
                onSelect: '&',
                required: '@',
                allowClear: '@',
                groupType: '@'
            },
            link: function ($scope) {
                if (!$scope.allowClear) $scope.allowClear = false;

                var watchModelInitialed = false;
                $scope._onSelect = function (group) {
                    if ($scope.onSelect) {
                        $scope.onSelect({ group: group });
                    }
                };
                $scope.locationGroups = [];
                function getVirtualLocationGroup () {
                    var searchObj = {};
                    if($scope.groupType) {
                        searchObj.virtualLocationGroupType = $scope.groupType;
                    }
                    locationService.searchVirtualLocationGroup(searchObj).then(function (response) {
                        $scope.locationGroups = response;

                        try {
                            $scope.$applyAsync();
                        } catch (e) { }
                    });
                }
                getVirtualLocationGroup();

                $scope.$watch("ngModel", function (val) {

                    if (!watchModelInitialed && val) {
                        locationService.searchVirtualLocationGroup({ids:[val]}).then(function (data) {
                            if (_.findIndex($scope.locationGroups, { id: data[0].id }) === -1) {
                                $scope.locationGroups.push(data[0]);
                            }
                        });
                        watchModelInitialed = true;
                    }
                });
            }
        };
    }]);
});

