'use strict';

define(['./directives', 'lodash'], function(directives,_ ) {
    directives.directive('itemspecAutoComplete', ['$q', 'itemService', function($q,itemService) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/itemspecAutoComplete.html',
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
                $scope.itemSpecList = [];
                $scope.searchItem = function(keyword){
                    searchItem(keyword).then(function (data) {
                        if(init) {
                            $scope.itemSpecList = _.unionBy($scope.itemSpecList, data, "id");
                            init = false;
                        }else {
                            $scope.itemSpecList = data;
                        }
                    });
                };

                $scope.$watch("customerId", function (val) {
                    if(val) {
                        searchItem().then(function (response) {
                            setNullWhenValueNotInSelectList(response);
                            $scope.itemSpecList = response;
                        })
                    }

                });

                $scope.$watch("supplierId", function (val) {
                    if(val) {
                        searchItem().then(function (response) {
                            setNullWhenValueNotInSelectList(response);
                            $scope.itemSpecList = response;
                        });
                    }

                });

                function searchItem(keyword, searchIds) {
                    var param = {scenario: 'Auto Complete'};
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
                                $scope.itemSpecList.push(data);
                            }
                        });
                        watchModelInitialed = true;
                    }
                });
            }
        };
    }]);
});
