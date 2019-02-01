'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('templateAutoComplete', ['$q', 'templateService', 'lincUtil', function ($q, templateService, lincUtil) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/templateAutoComplete.html',
            scope: {
                ngModel: '=',
                name: '@',
                ngDisabled: '=',
                required: '=',
                onSelect: '&',
                allowClear: '@',
                customCtrl: '='
                // customerId: '='
            },
            link: function ($scope, element) {
                if (!$scope.allowClear) $scope.allowClear = false;
                $scope._onSelect = function (t) {
                    if ($scope.onSelect) {
                        $scope.onSelect({t: t});
                    }
                };
                var init = true;
                var watchModelInitialed = false;
                $scope.templates = [];

                $scope.getTemplates = function (keyword) {
                    var param = keyword ? {name: keyword} : {};
                    if (init) {
                        templateService.searchTemplates(param).then(function (response) {
                            $scope.templates = response
                        });
                        init = false;
                    } else {
                        templateService.searchTemplates(param).then(function (response) {
                            $scope.templates = response;
                        });
                    }
                };

                $scope.$watch("ngModel", function (val) {
                    if (!watchModelInitialed && val && _.findIndex($scope.templates, {id: val}) < 0) {
                        watchModelInitialed = true;
                    }
                });

            }
        };
    }]);
});
