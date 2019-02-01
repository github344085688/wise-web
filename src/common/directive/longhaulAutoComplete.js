'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('longhaulAutoComplete', ['longHaulService', function (longHaulService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/longhaulAutoComplete.html',

            scope: {
                ngModel: '=',
                name: '@',
                isDisabled: '=',
                customerId: '=',
                storeNo: '=',
                onSelect: '&',
                required: '@',
                allowClear: '@'
            },
            link: function ($scope) {
                if (!$scope.allowClear) $scope.allowClear = false;
                $scope._onSelect = function (longHaul) {
                    if ($scope.onSelect) {
                        $scope.onSelect({ longHaul: longHaul });
                    }
                };
                $scope.longHauls = [];
                $scope.getLongHaulList = function (keyword) {
                    var param = { regexLongHaulNo: keyword };
                    param.customerId = $scope.customerId;
                    param.stopAddressStoreNo = $scope.storeNo;

                    longHaulService.LongHaulSearch(param).then(function (response) {
                        _.forEach(response.milkRuns, function (milk) {
                            if (milk.longHaulShipDay) {
                                if (milk.longHaulShipDay[0] === "Monday") {
                                    milk.sortKey = "1" + milk.longHaulNo;
                                } else if (milk.longHaulShipDay[0] === "Tuesday") {
                                    milk.sortKey = "2" + milk.longHaulNo;
                                } else if (milk.longHaulShipDay[0] === "Wednesday") {
                                    milk.sortKey = "3" + milk.longHaulNo;
                                } else if (milk.longHaulShipDay[0] === "Thursday") {
                                    milk.sortKey = "4" + milk.longHaulNo;
                                } else if (milk.longHaulShipDay[0] === "Friday") {
                                    milk.sortKey = "5" + milk.longHaulNo;
                                } else if (milk.longHaulShipDay[0] === "Saturday") {
                                    milk.sortKey = "6" + milk.longHaulNo;
                                } else if (milk.longHaulShipDay[0] === "Sunday") {
                                    milk.sortKey = "7" + milk.longHaulNo;
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
                $scope.$watch("storeNo", function () {
                    $scope.getLongHaulList();
                });

            }
        };
    }]);
});

