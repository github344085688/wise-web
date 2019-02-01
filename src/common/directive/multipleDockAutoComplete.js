/**
 * Created by Giroux on 2017/3/31.
 */

'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('multipleDockAutoComplete', ['$q', 'locationService', function($q,locationService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/multipleDockAutoComplete.html',
            scope: {
                ngModel: '=',
                required: '@',
                onSelect: '&',
                onRemove: '&'
            },
            link: function($scope) {
                $scope._onSelect = function(dock){
                    if($scope.onSelect) {
                        $scope.onSelect({dock: dock});
                    }
                };
                $scope._onRemove = function(dock){
                    if($scope.onRemove) {
                        $scope.onRemove({dock: dock});
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
                function getDockLists () {
                    locationService.getLocationList({ type: 'DOCK' }).then(function(response) {
                        if (response.error) {
                            return;
                        }
                        dockDatas = response;
                        $scope.docks = response;
                    });
                }

                getDockLists();

                $scope.$watch("ngModel", function(val){

                });

            }
        };
    }]);
});
