'use strict';

define([
    'angular',
    'lodash'
], function (angular, _, orderPlanItemLineGroup) {
    var controller = function($scope, $mdDialog, $state, $stateParams,customerService,
                              isAddAction, lincUtil, orderPlanService,
                              lincResourceFactory, orderService, orderPlanHelp,
                              addressService,session, facilityService, constantService) {

        var CREATE_TITLE = "Add Order Plan";
        var EDIT_TITLE = "Edit Order Plan";
        var defaultGroupingFields = ["virturalLocationGroupName", "itemWeight"];
        var NEW_ENTRY = {groupingFields: defaultGroupingFields};
        $scope.pageSize = 20;
        $scope.autoGroupFieldSelectOptions = constantService.getOrderPlanItemLineGroupFields();

        $scope.selectOrders = function () {
            orderPlanHelp.setOrderPlan($scope.orderPlan);
            orderPlanHelp.setOrderLines(angular.copy($scope.orders));

            var fromState = isAddAction ? "wms.outbound.order-plan.add" :
                "wms.outbound.order-plan.edit";
            $state.go('wms.outbound.order-plan.order-select',
                {fromState: fromState, fromStateParam: $stateParams});
        };

        $scope.loadContent_orders = function (currentPage) {
            $scope.orderView = $scope.orders.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.orders.length ? $scope.orders.length : currentPage * $scope.pageSize);
        };

        $scope.deleteOrder = function(orderId) {
            lincUtil.deleteConfirmPopup('Would you like to remove the this order?', function() {
                angular.forEach($scope.orders, function(item, key) {
                    if (item.id === orderId)
                    {
                        $scope.orders.splice(key, 1);
                    }
                });
                angular.forEach($scope.orderView, function(item1, key1) {
                    if (item1.id === orderId)
                    {
                        $scope.orderView.splice(key1, 1);
                    }
                });
                setPickTypeAndGroupFieldByCustomerAndOrderType($scope.orders);
            });
        };

        $scope.getPickTypes = function() {
            return lincResourceFactory.getPickTypes().then(function(response) {
                $scope.pickTypes = response;
            });
        };

        $scope.getPickWays = function() {
            return lincResourceFactory.getPickWays().then(function(response) {
                $scope.pickWays = response;
            });
        };

        function initSet() {
            isAddAction = $stateParams.orderPlanId ? false : true;
            if (!isAddAction) {
                $scope.formTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                if(orderPlanHelp.isSelectOrder) {
                    getOrderPlanFromOrderPlanHelp();
                }else {
                    orderPlanHelp.setOrderPlan(null);
                    orderPlanHelp.setOrderLines([]);
                    getOrderPlan($stateParams.orderPlanId);
                }
            } else {
                $scope.formTitle = CREATE_TITLE;
                $scope.submitLabel = "Save";
                if(orderPlanHelp.isSelectOrder) {
                    getOrderPlanFromOrderPlanHelp();
                } else {
                    $scope.orderPlan = angular.copy(NEW_ENTRY);
                    $scope.orders = [];
                    orderPlanHelp.setOrderPlan(null);
                    orderPlanHelp.setOrderLines([]);
                }
                facilityService.getFacilityByOrgId(session.getCompanyFacility().facilityId).then(function(res){
                    $scope.orderPlan.enableAutoGroupPickStragety = res.enableAutoGroupPickStragety;
                });
            }
            orderPlanHelp.isSelectOrder = false;
        }

        function getOrderPlanFromOrderPlanHelp(){
            $scope.orderPlan = orderPlanHelp.getOrderPlan();
            $scope.orders = orderPlanHelp.getOrderLines();
            generateShipToAddressStr($scope.orders);
            $scope.orders = _.sortBy($scope.orders, "shipToAddressStr");
            $scope.loadContent_orders(1);
            setPickTypeAndGroupFieldByCustomerAndOrderType($scope.orders);
        }

        function setPickTypeAndGroupFieldByCustomerAndOrderType(orders) {
            var customerIdArr = _.uniq(_.map(orders, 'customerId')),
                orderTypeArr = _.uniq(_.map(orders, 'orderType'));
            if(isAddAction && !(customerIdArr.length === 1 && orderTypeArr.length === 1)) {
                _.unset($scope.orderPlan, 'pickType');
            }
            if (customerIdArr.length === 1) {
                customerService.getCustomerByOrgId(customerIdArr[0]).then(function (customer) {
                    if(orderTypeArr.length === 1) {
                        _.forEach(customer.orderTypePickTypeMappings, function (mapping) {
                            if (mapping.orderType === orderTypeArr[0]) {
                                $scope.orderPlan.pickType = mapping.pickType;
                            }
                        });
                    }
                    $scope.orderPlan.groupingFields = customer.orderPlanItemLineGroupBys;
                });
            } else if (isAddAction){
                $scope.orderPlan.groupingFields = defaultGroupingFields;
            }
        }

        function getOrderPlan(orderPlanId) {
            orderPlanService.getOrderPlan(orderPlanId).then(function (orderPlan) {
                $scope.orderPlan = orderPlan;
                getOrdersByIds(orderPlan.orderIds);
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function getOrdersByIds(orderIds) {
            orderService.searchOrder({orderIds: orderIds}).then(function (orders) {
                $scope.loading = false;
                $scope.orders = orders;
                generateShipToAddressStr($scope.orders);
                $scope.orders = _.sortBy($scope.orders, "shipToAddressStr");
                $scope.loadContent_orders(1);
            },function(err){
                $scope.loading = false;
                lincUtil.errorPopup("Error:" + err.data.error);
            });
        }

        $scope.submit = function (form) {
            var orderPlan = angular.copy($scope.orderPlan);
            orderPlan.orderIds = _.map($scope.orders, "id");
            orderPlan.longHaulNos = orderPlanHelp.longHaulNos;
            if (validateFields()) {
                if (!isAddAction) editOrderPlan(orderPlan);
                else addOrderPlan(orderPlan);
            }
        };

        function validateFields() {
            if (_.isEmpty($scope.orders)) {
                lincUtil.messagePopup("Tip", "At least one order is required");
                return false;
            } else
                return true;
        }

        function addOrderPlan(orderPlan) {
            $scope.loading = true;
            orderPlanService.createOrderPlan(orderPlan).then(submitSuccessPopUp, submitFail);
        }

        function submitFail(error) {
            $scope.loading = false;
            lincUtil.errorPopup('Error! ' + error.data.error);
        }

        function editOrderPlan(orderPlan) {
            $scope.loading = true;
            lincUtil.setFieldToNullIfNotExist(orderPlan, "pickType");
            lincUtil.setFieldToNullIfNotExist(orderPlan, "pickWay");
            orderPlanService.updateOrderPlan(orderPlan).then(submitSuccessPopUp, submitFail);
        }

        function submitSuccessPopUp(response) {
            $scope.loading = false;
            if (!isAddAction) {
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go('wms.outbound.order-plan.view', {"orderPlanId":$stateParams.orderPlanId});
                });
            } else {
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('wms.outbound.order-plan.view', {orderPlanId: response.id});
                });
            }
        }

        function generateShipToAddressStr(orders) {
            angular.forEach(orders, function (order) {
                order.shipToAddressStr = addressService.generageAddressData(order.shipToAddress, null);
            });
        }

        $scope.cancel = function (form) {
            if (!isAddAction) {
                $state.go('wms.outbound.order-plan.view', {"orderPlanId":$stateParams.orderPlanId});
            } else {
                $state.go('wms.outbound.order-plan.list');
            }
        };

        initSet();

    };
    controller.$inject = ['$scope', '$mdDialog', '$state', '$stateParams','customerService',
        'isAddAction', 'lincUtil', 'orderPlanService', 'lincResourceFactory', 'orderService',
        'orderPlanHelp','addressService','session','facilityService', 'constantService'];

    return controller;
});

