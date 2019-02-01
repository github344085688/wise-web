'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('kittingItemAutoComplete', ['$q', 'itemService', function($q,itemService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/kittingItemAutoComplete.html',
            scope: {
                ngModel: '=',
                ngDisabled: '=',
                onSelectParam: '=',
                name: '@',
                tags: '=',
                customerId: '=',
                supplierId: '=',
                extParam: '=',
                required: '@',
                onSelect:'&',
                allowClear: '@',
                placeholder: '@',
                showEmptyCustomerIdItem: '='
            },
            link: function($scope) {
                if(!$scope.allowClear) $scope.allowClear = false;
                $scope._onSelect = function(itemSpec){
                    if($scope.onSelect) {
                        $scope.onSelect({itemSpec: itemSpec, param: $scope.onSelectParam});
                    }
                };

                var init = true;
                var watchModelInitialed = false;
                $scope.kittingItemList = [];
                $scope.searchItem = function(keyword){
                    searchItem(keyword).then(function (data) {
                        if(init) {
                            $scope.kittingItemList = _.filter(_.unionBy($scope.kittingItemList, data, "id"), 'bundle');
                            init = false;
                        }else {
                            $scope.kittingItemList = _.filter(data, 'bundle');
                        }
                    });
                };

                $scope.$watch("customerId", function (val) {
                    if(val) {
                        searchItem().then(function (response) {
                            setNullWhenValueNotInSelectList(response);
                            $scope.kittingItemList = _.filter(response, 'bundle');
                        })
                    }

                });

                $scope.$watch("supplierId", function (val) {
                    if(val) {
                        searchItem().then(function (response) {
                            setNullWhenValueNotInSelectList(response);
                            $scope.kittingItemList = _.filter(response, 'bundle');
                        });
                    }

                });

                function searchItem(keyword, searchIds) {
                    var param = {scenario: 'Auto Complete', bundle: true };
                    if(keyword) {
                        param.name = keyword;
                    }
                    if(!_.isEmpty($scope.extParam)){
                        _.merge(param, $scope.extParam);
                    }
                    if(searchIds) {
                        param.ids = searchIds;
                    }
                    if($scope.customerId) {
                        param.customerIds = [$scope.customerId];
                    }
                    if($scope.supplierId) {
                        param.supplierIds = [ $scope.supplierId];
                    }
                    if($scope.tags){
                        param.tags = $scope.tags;
                    }
                    if($scope.showEmptyCustomerIdItem){
                      return  itemService.combineEmptyCustomerSearch(param);
                    }else{
                      return  itemService.itemBasicSearch(param);
                    }
                }

                function setNullWhenValueNotInSelectList(arr) {
                    if($scope.ngModel) {
                        var findSpec = _.find(arr, function (itemSpec) {
                            return itemSpec.id == $scope.ngModel;
                        });
                        if(!findSpec) {
                            searchItem(null, [$scope.ngModel]).then(function(data){
                                if(data.length == 0) {
                                    $scope.ngModel = null;
                                    if($scope.onSelect) {
                                        $scope.onSelect({itemSpec: null, param: $scope.onSelectParam});
                                    }
                                }else {
                                    arr.push(data[0]);
                                }
                            });
                        }
                    }
                }

                $scope.$watch("ngModel", function(val){
                    if(!watchModelInitialed && val) {
                        itemService.getItemById(val).then(function(data){
                            if(_.findIndex($scope.itemSpecList, {id:data.id}) === -1){
                                 $scope.ngModel=val;
                            }
                        });
                        watchModelInitialed = true;
                    }
                });
            }
        };
    }]);
});
