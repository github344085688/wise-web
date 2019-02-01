'use strict';

define(['./directives', 'jquery', 'lodash'], function (directives, $, _) {
    directives.directive('inputAutoFill', [function () {
        return {
            scope: {
                ngModel: '='
            },
            link: function ($scope, elem, attrs) {

                $(elem).bind("change", function () {
                    var fillTxt = attrs.inputAutoFill;

                    var val = $(elem).val();
                    if (val && val.indexOf(fillTxt) < 0) {
                        val = fillTxt + val;

                        $scope.ngModel = val;

                        try {
                            $scope.$apply();
                        } catch (e) { }
                    }
                });
            }
        }
    }]);
});
