/**
 * Created by Giroux on 2017/3/31.
 */

'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('dockAutoComplete', ['$q', 'locationService', function ($q, locationService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/dockAutoComplete.html',
            scope: {
                ngModel: '=',
                ngDisabled: '=',
                required: '@',
                loadIds: '@',
                dockStatus: '@',
                onSelect: '&'
            },
            link: function ($scope) {
                $scope._onSelect = function (dock) {
                    if ($scope.onSelect) {
                        $scope.onSelect({ dock: dock });
                    }
                };

                $scope.getDocks = function (key) {
                    if (!key || key.trim() == "") {
                        return;
                    }
                    $scope.docks = [];
                    _.forEach(dockDatas, function (dock) {
                        if (dock.name.toLowerCase().indexOf(key.toLowerCase()) >= 0) {
                            $scope.docks.push(dock);
                        }
                    })
                };

                $scope.docks = [];
                var dockDatas;
                function getDockLists() {

                    if ($scope.loadIds) {
                        var loadIds = JSON.parse($scope.loadIds);
                        locationService.getLocationDockSuggestList(loadIds).then(function (response) {
                            if (response.error) {
                                return;
                            }
                            dockDatas = response;
                            $scope.docks = response;
                        });
                    }
                    else {

                        locationService.getLocationList({ type: 'DOCK' }).then(function (response) {
                            if (response.error) {
                                return;
                            }
                            if ($scope.dockStatus === 'AVAILABLE') {
                                response = _.filter(response, ['dockStatus', 'AVAILABLE']);
                            }

                            dockDatas = response;
                            $scope.docks = response;
                        });
                    }


                }

                getDockLists();

                $scope.$watch("ngModel", function (val) {
                    if (!val) {
                        getDockLists();
                    }

                });

            }
        };
    }]);
});
