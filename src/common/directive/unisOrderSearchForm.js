'use strict';

define(['./directives', 'angular', 'lodash', ], function (directives, angular, _) {
    directives.directive('unisOrderSearchForm', ['lincResourceFactory', 'customerService', 'carrierService',
        function (lincResourceFactory, customerService, carrierService) {
        return {
            restrict: "AE",
            templateUrl: 'common/directive/template/unisOrderSearchForm.html',
            scope: {
                isLoading: '=',
                forOrderPlan: '=',
                searchOrders: '&'
            },
            link: function ($scope, elem, attrs) {
                $scope.order = {};
                var orderTypes = $scope.orderTypeOptions = ['Regular Order', 'Title Transfer Order', 'Migo Transfer Order',
                    'DropShip Order', 'Blur Order', 'CrossDock'];
                $scope.$watch("forOrderPlan", function(val){
                    if (val) {
                        $scope.order.confirmedLH = true;
                    }
                });
                $scope._searchOrders = function(){
                    if($scope.searchOrders) {
                        var searchParam = getSearchParam();
                        _.forEach(searchParam, function (value, key) {
                                    if (!value && typeof value !== 'boolean') {
                                        delete searchParam[key];
                                    }
                                    if(key === 'selectItemLineCountType' || key === 'selectItemQtyType'){
                                        delete searchParam[key]; 
                                    }
                                });
                        $scope.searchOrders({searchParam: searchParam});
                    }
                };
                $scope.keyUpSearch = function ($event) {
                    if(!$event){
                        return;
                    }
                    if ($event.keyCode === 13) {
                        $scope._searchOrders();
                    }
                    $event.preventDefault();
                }
                function getSearchParam() {
                    var searchParam = angular.copy($scope.order);
                    if($scope.isAdvanced) {
                        delete searchParam.keyword;
                    }else {
                        if(searchParam) {
                            if(!searchParam.keyword) {
                                searchParam = {};
                            }else {
                                searchParam = {keyword: searchParam.keyword};
                            }
                        } else {
                            searchParam = {}
                        }

                    }
                    return searchParam;
                }

                $scope.getFreightTermList = function(name) {
                    return lincResourceFactory.getFreightTermList(name).then(function(response) {
                        $scope.freightTermList = response;
                    });
                };

                $scope.getStatusList = function(name) {
                    if ($scope.forOrderPlan) {
                        $scope.statusList = ["Committed", "Partial Committed"];
                    } else {
                        return lincResourceFactory.getOrderStatus(name).then(function (response) {
                            $scope.statusList = response;
                        });
                    }
                };

                $scope.customerChange = function (customer) {
                    $scope.order.longHaulNo = null;
                    $scope.order.longHaulId = null;
                    customerService.getCustomerByOrgId(customer.id).then(function(customer) {
                        if(customer.supportedOrderTypes && customer.supportedOrderTypes.length > 0) {
                            $scope.orderTypeOptions = customer.supportedOrderTypes;
                        }else {
                            $scope.orderTypeOptions = orderTypes;
                        }
                    });
                };

                $scope.selectLongHaul = function (longHaul) {
                    $scope.order.longHaulNo = longHaul.longHaulNo;
                };
                $scope.order.selectItemLineCountType = 'Equal To';
                $scope.typeOnSelectItemCount =function(){
                    if( $scope.order.selectItemLineCountType === 'Equal To'){
                        delete $scope.order.gtItemLineCount;
                    }else{
                        delete $scope.order.eqItemLineCount;
                    }
                };
                $scope.order.selectItemQtyType = 'Equal To';
                $scope.typeOnSelectItemQty =function(){
                    if( $scope.order.selectItemQtyType === 'Equal To'){
                        delete $scope.order.gtItemLineTotalQty;
                    }else{
                        delete $scope.order.eqItemLineTotalQty;
                    }
                };

                $scope.carrierChange = function () {
                    searchCarrier();
                };

                function searchCarrier() {
                    carrierService.searchCarrier({ ids: $scope.order.carrierIds }).then(function(carriers) {
                        $scope.carrierServiceTypes = _.uniq(_.flatten(_.map(carriers,'serviceTypes')));
                        if($scope.order.deliveryServices && $scope.order.deliveryServices.length>0){
                            $scope.order.deliveryServices = _.remove($scope.order.deliveryServices,function(deliveryService){
                                return _.indexOf($scope.carrierServiceTypes,deliveryService) >-1;
                            });
                        }
                    });
                }
            }
        };
    }])
});
