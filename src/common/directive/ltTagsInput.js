'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('ltTagsInput', [function () {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/ltTagsInput.html',
            scope: {
                ngModel: '=',
                ngDisabled: '=',
                ngClass: '=',
                placeholder: '@',
                required: '@',
                fill: '@',
                ngKeyup: '&',
                enableMultipleTagInput: '=',
                replaceSpacesWithDashes: '='
            },
            link: function ($scope) {
                $scope.tagsVal = [];
                $scope.addTag = function () {
                    getValue();
                };

                $scope.removeTag = function () {
                    getValue();
                };

                $scope.onKeyup = function ($event) {
                    if ($scope.ngKeyup) {
                        $scope.ngKeyup($event);
                    }
                };

                function getValue() {
                    var tags = $scope.tagsVal;
                    if (tags && $scope.fill) {

                        _.forEach(tags, function (tag) {
                            if (tag.text.indexOf($scope.fill) < 0) {
                                tag.text = $scope.fill + tag.text;
                            }
                        })
                    }
                    $scope.ngModel = [];
                    _.forEach(tags, function (tag) {
                        if (tag.text) {
                            var  tagSplitList = [tag.text];
                            if($scope.enableMultipleTagInput) {
                                var text = tag.text.replace(/,/g, "-");
                                tagSplitList = _.split(text, '-');
                            }
                            $scope.ngModel = $scope.ngModel.concat(tagSplitList);
                        }

                    });

                    try {
                        $scope.$applyAsync();
                    } catch (e) { }
                }

                $scope.$watch("ngModel", function (val) {
                    $scope.tagsVal = val || [];
                });

            }
        };
    }]);
});
