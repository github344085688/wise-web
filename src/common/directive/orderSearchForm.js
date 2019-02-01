'use strict';

define(['./directives', 'angular', 'lodash'], function (directives, angular, _) {
    directives.directive('orderSearchForm', ['lincResourceFactory', 'orderService', 'userService', 'session', 'customerService','itemPropertyService','carrierService',
        function (lincResourceFactory, orderService, userService, session, customerService,itemPropertyService,carrierService) {
        return {
            restrict: "AE",
            templateUrl: 'common/directive/template/orderSearchForm.html',
            scope: {
                isLoading: '=',
                isExporting: '=',
                isBatchClose: '=',
                forBuildCommitment: '=',
                needExport: '=',
                needBatchClose: '=',
                order: '=',
                exportOrder: '&',
                searchOrders: '&',
                batchCloseOrder: '&'
            },
            link: function ($scope, elem, attrs) {
                $scope.order = $scope.order || {};
                var orderTypes = $scope.orderTypeOptions = ['Regular Order', 'Title Transfer Order', 'Migo Transfer Order',
                    'DropShip Order', 'Blur Order', 'CrossDock'];

                $scope._searchOrders = function(){
                    if($scope.searchOrders) {
                        var searchParam = getSearchParam();
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
                };

                function getSearchParam() {
                    var searchParam = angular.copy($scope.order);
                    if($scope.isAdvanced) {
                        delete searchParam.keyword;
                    }else {
                        if(!searchParam.keyword) {
                            searchParam = {};
                        }else {
                            searchParam = {keyword: searchParam.keyword};
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
                    if ($scope.forBuildCommitment) {
                        $scope.statusList = ["Imported", "Open", "Partial Committed", "Commit Blocked", "Commit Failed"];
                    } else {
                        return lincResourceFactory.getOrderStatus(name).then(function (response) {
                            $scope.statusList = response;
                        });
                    }
                };
                $scope._exportOrder = function () {
                    if ($scope.exportOrder) {
                        var searchParam = getSearchParam();
                        $scope.exportOrder({searchParam: searchParam});
                    }
                };

                $scope._batchCloseOrder = function () {
                    if ($scope.batchCloseOrder) {
                        $scope.batchCloseOrder();
                    }
                };

                $scope.getBatchCommitmentNos = function(keyword){
                    orderService.getBatchCommitmentNos({regexBatchCommitmentNo: keyword}).then(function(response){
                        $scope.batchCommitmentNos = response.commitmentNos;
                    });
                };

                $scope.selectLongHaul = function (longHaul) {
                    $scope.order.longHaulNo = longHaul.longHaulNo;
                };

                $scope.getUsers = function (keyword) {
                    var param = {keyword: keyword, scenario: 'Auto Complete'};
                    var currentCf = session.getCompanyFacility();
                    if(currentCf) {
                        param.facilityId = currentCf.facilityId;
                    }
                    userService.searchUsers(param).then(function (response) {
                        $scope.users = response;
                    });
                };

                $scope.getUserName = function (user) {
                    if (!user) return "";
                    if (user.firstName && user.lastName) {
                        return user.firstName + " " + user.lastName + ' ( ' + user.username + ' ) ';
                    }
                    return user.username;
                };

                $scope.customerChange = function (customer) {
                    customerService.getCustomerByOrgId(customer.id).then(function(customer) {
                        if(customer.supportedOrderTypes && customer.supportedOrderTypes.length > 0) {
                            $scope.orderTypeOptions = customer.supportedOrderTypes;
                        }else {
                            $scope.orderTypeOptions = orderTypes;
                        }
                    });
                };

                $scope.searchAvailableGroups = function (searchText) {
                     var param = {};
                    if($scope.order.customerId){
                        param.customerId= $scope.order.customerId;
                    }
                    if (searchText) {
                        param.name = searchText;
                    }
                    itemPropertyService.getItemGroups(param).then(function (data) {
                        $scope.availableGroups = data;
                    }, function () { });
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
