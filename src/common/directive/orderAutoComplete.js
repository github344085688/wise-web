'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('orderAutoComplete', ['$q', 'orderService', function ($q, orderService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/orderAutoComplete.html',
            scope: {
                ngModel: '=',
                ngDisabled: '=',
                customerId: '=',
                required: '@',
                onSelect: '&',
                onChange: '&',
                allowClear: '@',
                placeholder: '@',
            },
            link: function ($scope) {
                if (!$scope.allowClear) $scope.allowClear = false;
                $scope._onSelect = function (order) {
                    if ($scope.onSelect) {
                        $scope.onSelect({
                            order: order
                        });
                    }
                };

    
                var init = true;
                var watchModelInitialed = false;
                $scope.orderList = [];
                $scope.searchOrder = function (keyword) {
                    searchOrder(keyword).then(function (data) {
                        if (init) {
                            $scope.orderList = _.unionBy($scope.orderList, data.orders, "id");

                            init = false;
                        } else {
                            $scope.orderList = data.orders;
                        }
                    });
                };

                $scope.$watch("customerId", function (val) {
                    if (val) {
                        searchOrder().then(function (response) {
                            setNullWhenValueNotInSelectList(response.orders);
                            $scope.orderList = response.orders;
                        })
                    }

                });

                function setNullWhenValueNotInSelectList(arr) {
                    if ($scope.ngModel) {
                        var findRes = _.find(arr, function (res) {
                            return res.id == $scope.ngModel;
                        });
                        if (!findRes) {
                            $scope.ngModel = null;
                        }
                    }
                }

                function searchOrder(keyword) {
                    var param = { paging: { pageNo: 1 , limit: 20 }};
                    if (keyword) {
                        param.keyword = keyword;
                    }
                    if ($scope.customerId) {
                        param.customerId = $scope.customerId;
                    }
                    return orderService.searchAutoCompleteOrder(param);

                }


                $scope.$watch("ngModel", function (val) {
                    if (!watchModelInitialed && val) {
                        orderService.getOrder(val).then(function (data) {
                            if (_.findIndex($scope.orderList, { id: data.id }) === -1) {
                                $scope.ngModel = val;
                                $scope.orderList.push(data);
                            }
                        });
                        watchModelInitialed = true;
                    }
                });
            }
        };
    }]);
});