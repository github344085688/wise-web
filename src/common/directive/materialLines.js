'use strict';

define(['./directives'], function(directives) {
    directives.directive('materialLines', function(materialLineService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/materialLines.html',
            scope: {
                searchParam: '='
            },
            link: function($scope) {
                $scope.pageSize = 5;
                materialLineService.searchMaterialLine($scope.searchParam).then(function (response) {
                    $scope.materialLines = response;
                    $scope.loadContent(1);
                });

                $scope.loadContent = function (currentPage) {
                    $scope.materialLineView = $scope.materialLines.slice((currentPage - 1) * $scope.pageSize,
                        currentPage * $scope.pageSize > $scope.materialLines.length ?
                            $scope.materialLines.length : currentPage * $scope.pageSize);
                };
            }
        };
    });
});
