'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('multipleLonghaulAutoComplete', ['longHaulService', function (longHaulService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/multipleLonghaulAutoComplete.html',

            scope: {
                ngModel: '=',
                customerId: '=',
                required: '@',
                onSelect: '&',
                onRemove: '&'
            },
            link: function ($scope) {
                $scope._onSelect = function (longHaul) {
                    if ($scope.onSelect) {
                        $scope.onSelect({ longHaul: longHaul });
                    }
                };
                $scope._onRemove = function (longHaul) {
                    if ($scope.onRemove) {
                        $scope.onRemove({ longHaul: longHaul });
                    }
                };
                $scope.longHauls = [];
                $scope.getLongHaulList = function (keyword) {
                    var param = { regexLongHaulNo: keyword };
                    param.customerId = $scope.customerId;
                    longHaulService.LongHaulSearch(param).then(function (response) {
                        _.forEach(response.milkRuns, function (milk) {
                            if (milk.longHaulShipDay) {
                                var shipDay = milk.longHaulShipDay[0];
                                if (shipDay) {
                                    if (shipDay === "Monday") {
                                        milk.sortKey = "1" + milk.longHaulNo;
                                    } else if (shipDay === "Tuesday") {
                                        milk.sortKey = "2" + milk.longHaulNo;
                                    } else if (shipDay === "Wednesday") {
                                        milk.sortKey = "3" + milk.longHaulNo;
                                    } else if (shipDay === "Thursday") {
                                        milk.sortKey = "4" + milk.longHaulNo;
                                    } else if (shipDay === "Friday") {
                                        milk.sortKey = "5" + milk.longHaulNo;
                                    } else if (shipDay === "Saturday") {
                                        milk.sortKey = "6" + milk.longHaulNo;
                                    } else if (shipDay === "Sunday") {
                                        milk.sortKey = "7" + milk.longHaulNo;
                                    }
                                } else {
                                    milk.sortKey = "8" + milk.longHaulNo;
                                }
                            }
                        });
                        $scope.longHauls = _.sortBy(response.milkRuns, "sortKey");
                    });
                };
                $scope.$watch("customerId", function () {
                    $scope.getLongHaulList();
                });

            }
        };
    }]);
});

