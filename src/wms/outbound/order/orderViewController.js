'use strict';

define([
    'lodash',
    'angular',
    'angularMoment',
    'clipboard',
    './showKittingController',
    // './orderPickTaskCreateController',
    './rollBackController',
    './downloadAttachmentController',
    './attachmentController',
    './editableSettingForOrder',
    'src/wms/common/editCartonDetailController'
], function (_, angular, angularMoment, Clipboard, showKittingController,
    rollBackController, downloadAttachmentController, attachmentController,editableSettingForOrder,editCartonDetailController) {
        var controller = function ($scope, orderService, materialLineService, $state, lincResourceFactory,
            $stateParams, lincUtil, $mdDialog, addressService, customerService, billingRecordService,fileService,smallParcelShipmentService) {

            var clipboard = new Clipboard("#copyBtn");
            $scope.activeTab_line = "itemLine";
            $scope.pageSize = 10;
            var orderStatusList;
            $scope.current_page_material = 1;
            $scope.current_page_item = 1;
            var deleteBillingIds = [];
            $scope.trackingnoitemLines = [];
            initSet();
            function initSet() {
                $scope.retailers = ['AAFES', 'AMAZON', 'TARGET', 'BESTBUY', 'COSTCO'];
                $scope.formTitle = "Order View";
                if ($stateParams.orderId) getOrder($stateParams.orderId);
                $scope.activeTab = 'info';
            }

            function getOrder(orderId) {
                $scope.loading = true;
                orderService.getOrder(orderId).then(function (order) {
                    $scope.loading = false;
                    $scope.order = order;
                    initBilling();
                    $scope.order.totalQty = 0;
                    $scope.order.totalPalletQty = 0;
                    countTotalQty($scope.order.itemLines);
                    setOrderStatusIndex($scope.order.status);
                    setupCartonInfo();
                    groupLpByLocation();
                    $scope.loadContent_itemLines($scope.current_page_item);
                    loadMaterialLines($scope.order.id);
                    getFieldEditableSet();
                    getOrderDynamicFields(order.customerId);
                    searchSmallParcelShipmentDetail($scope.order.id);
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }

            function searchSmallParcelShipmentDetail(orderId) {
                smallParcelShipmentService.searchSmallParcelShipmentDetail({orderIds:[orderId]}).then(function (response) {
                    _.forEach(response,function (item) {
                        $scope.trackingnoitemLines.push({trackingNo:item.trackingNo, shippingCost:item.shippingCost, carrierId:item.carrierId, itemLineDetails:_.filter(response,{trackingNo:item.trackingNo})});
                    });
                    $scope.trackingnoitemLines = _.uniqBy($scope.trackingnoitemLines,'trackingNo');
                    _.forEach($scope.trackingnoitemLines, function (item) {
                        _.forEach(item.itemLineDetails, function (snDetail) {
                            snDetail['unit']=_.find( $scope.itemLineView,{unitId:snDetail.unitId}).unit;
                        });
                    });
                });
            }

            function initBilling() {
                deleteBillingIds = [];
                billingRecordService.getAccountItems({customerId: $scope.order.customerId,  tag:"Outbound"}).then(function (codes) {
                    $scope.accountItems = codes;
                    if(!_.isEmpty($scope.order.billingManualViews)) {
                        return
                    }
                    var billingManualViews = [];
                    _.forEach($scope.accountItems, function (accountItem) {
                        var billing = {billingCode: accountItem.AccountItem};
                        billingManualViews.push(billing);
                        $scope.accountItemselect(accountItem, billing);
                    });
                    $scope.order.billingManualViews =  billingManualViews;
                });
            }

            function loadMaterialLines(orderId) {
                materialLineService.searchMaterialLine({ orderIds: [orderId] }).then(function (response) {
                    $scope.materialLines = response;
                    $scope.loadContent_materialLines($scope.current_page_material);
                });
            }

            function getFieldEditableSet() {
                $scope.isDisabledMap = lincUtil.organizationFieldIsDisabledMap(
                    editableSettingForOrder, $scope.order.status, false);

                if ($scope.order.source === "EDI") {
                    $scope.isDisabledMap.cancelOrder = true;
                    if ($scope.order.status === "Imported" || $scope.order.status === "Open") {
                        $scope.isDisabledMap.cancelOrder = false;
                    }
                }
            }

            function groupLpByLocation() {
                $scope.lpByLocationMap = _.groupBy($scope.order.lps, "location");
            }

            $scope.printOrderPackingListPrint = function (orderId) {
                $scope.printPackingListing=true;
                lincUtil.setPropetyToFalseAfterSeconds($scope, "printPackingListing");
                if (orderId) {
                    var url = $state.href('orderPackingListPrint', {orderId: orderId });
                    window.open(url);
                }
            };

            $scope.printUCCLabel = function () {
                var retailerName = $scope.order.shipToAddress.organizationName;
                $scope.printUCCLabeling=true;
                lincUtil.setPropetyToFalseAfterSeconds($scope, "printUCCLabeling");
                if ($scope.order.id) {
                    var url = $state.href('uccLabelPrint', {orderId: $scope.order.id});
                    window.open(url);
                }
            };

            function getShipToOrganization(shipTo) {
                if (shipTo && _.trim(shipTo).length > 0) {
                    return _.split(shipTo, "\n")[0];
                }
                return "";
            }

            function countTotalQty(itemLines) {
                _.forEach(itemLines, function (itemLine) {
                    $scope.order.totalQty = itemLine.qty + $scope.order.totalQty;
                    if (itemLine.palletQty) {
                        $scope.order.totalPalletQty = itemLine.palletQty + $scope.order.totalPalletQty;
                    }
                });
            }

            $scope.isValidUCC = function (shipTo) {
                var shipToOrg = getShipToOrganization(shipTo);
                return _.indexOf($scope.retailers, _.toUpper(shipToOrg)) > -1;
            };

            $scope.loadContent_itemLines = function (currentPage) {
                $scope.current_page_item = currentPage;
                $scope.itemLineView = $scope.order.itemLines.slice((currentPage - 1) * $scope.pageSize,
                    currentPage * $scope.pageSize > $scope.order.itemLines.length ?
                        $scope.order.itemLines.length : currentPage * $scope.pageSize);
            };

            $scope.loadContent_materialLines = function (currentPage) {
                if (!$scope.materialLines) {
                    return;
                }
                $scope.current_page_material = currentPage;
                $scope.materialLineView = $scope.materialLines.slice((currentPage - 1) * $scope.pageSize,
                    currentPage * $scope.pageSize > $scope.materialLines.length ?
                        $scope.materialLines.length : currentPage * $scope.pageSize);
            };

            $scope.editOrder = function (orderId) {
                $state.go('wms.outbound.order.edit', { orderId: orderId, orderTab: $scope.activeTab});
            };

            $scope.closeOrder = function (order) {
                var confirm = $mdDialog.confirm()
                .title('Confirm')
                .textContent('Are you sure to close this order?')
                .ok('Yes')
                .cancel('No');
                $mdDialog.show(confirm).then(function() {
                    if($scope.order.status == "Partial Shipped") {
                        $scope.isCloseOrdering=true;
                        orderService.forceCloseOrder(order.id).then(function (order) {
                            lincUtil.messagePopup("Info", "Close order successful.");
                            $scope.isCloseOrdering=false;
                            initSet();
                        }, function (error) {
                            $scope.isCloseOrdering=false;
                            lincUtil.processErrorResponse(error)
                        });
                    }else {
                        $scope.isCloseOrdering=true;
                        orderService.closeOrder(order.id).then(function (order) {
                            lincUtil.messagePopup("Info", "Close order successful.");
                            $scope.isCloseOrdering=false;
                            initSet();
                        }, function (error) {
                            $scope.isCloseOrdering=false;
                            lincUtil.processErrorResponse(error)
                        });
                    }
                 });               
            };

            $scope.reopenOrder = function (order) {
                lincUtil.confirmPopup('Tip', 'Would you like to reopen this order?', function () {
                    $scope.isReopenOrdering=true;
                    orderService.reopenOrder(order.id).then(function () {
                        $scope.isReopenOrdering=false;
                        lincUtil.messagePopup("Info", "Reopen order successful.");
                        initSet();
                    }, function (error) {
                        $scope.isReopenOrdering=false;
                        lincUtil.errorPopup(error.data.error);
                    });
                });
            };

            $scope.cancelOrder = function (order) { 
                lincUtil.confirmPopup('Cancel Confirm', 'Would you like to cancel this order?', function () {
                    $scope.isCancelOrdering=true;
                    orderService.cancelOrder(order.id).then(function () {
                        lincUtil.messagePopup("Info", "Cancel order successful.");
                        $scope.isCancelOrdering=false;
                        initSet();
                    }, function (error) {
                        $scope.isCancelOrdering=false;
                        lincUtil.errorPopup(error.data.error);
                    });
                });
            };

            $scope.showKitting = function (itemLine) {
                var form = {
                    templateUrl: 'wms/outbound/order/template/showKitting.html',
                    locals: {
                        itemLine: itemLine
                    },
                    autoWrap: true,
                    controller: showKittingController
                };
                $mdDialog.show(form).then(function (param) {
                });
            };

            function setOrderStatusIndex(status) {
                if (!orderStatusList) {
                    lincResourceFactory.getOrderStatus().then(function (statusList) {
                        orderStatusList = statusList;
                        $scope.statusIndex = orderStatusList.indexOf(status);
                    });
                } else {
                    $scope.statusIndex = orderStatusList.indexOf(status);
                }
            }

            $scope.getAddressInfo = function (addressObject) {
                return addressService.generageAddressData(addressObject, null);
            };

            $scope.changeTab = function (tab) {
                $scope.activeTab = tab;
            };
            
            $scope.changeTab_line = function (tab) {
                $scope.activeTab_line = tab;
            };

            $scope.cloneOrder = function (orderId) {
                lincUtil.confirmPopup('Tip', 'Would you like to clone this order?', function () {
                    $scope.isCloneOrdering=true;
                    orderService.cloneOrder(orderId).then(function (response) {
                        $scope.isCloneOrdering=false;
                        lincUtil.messagePopup("Info", "Clone order successful.", function () {
                            $state.go('wms.outbound.order.view', { "orderId": response.id });
                        });
                    }, function (error) {
                        $scope.isCloneOrdering=false;
                        lincUtil.errorPopup(error.data.error);
                    });
                });
            };

            function setupCartonInfo() {
                $scope.order.allSerialNumbers = _.compact(_.uniq(_.flatten(_.map($scope.order.itemLines, "snList"))));
                $scope.order.cartonStr = _.join($scope.order.allSerialNumbers, "\n");
            }

            $scope.rollBack = function () {
                var dialog = {
                    templateUrl: 'wms/outbound/order/template/rollBack.html',
                    locals: {
                        order: $scope.order
                    },
                    autoWrap: true,
                    controller: rollBackController
                };
                $mdDialog.show(dialog).then(function (param) {
                    $state.reload();
                });
            };

            $scope.attachment=function(){
                var dialog = {
                    templateUrl: 'wms/outbound/order/template/attachment.html',
                    locals: {
                        order: $scope.order
                    },
                    autoWrap: true,
                    controller: attachmentController
                };
                $mdDialog.show(dialog).then(function (param) {
                });
            };


            function getOrderDynamicFields(customerId) {
                customerService.getCustomerByOrgId(customerId).then(function (response) {
                    $scope.dynamicFields = response.orderDynamicFields;
                })
            }

            $scope.separateOrder = function (orderId) {
                $scope.isSeparateOrder=true;
                orderService.separatePartialCommitmentOrders([orderId]).then(function (response) {
                    $scope.isSeparateOrder=false;
                    lincUtil.messagePopup("Info", "Separate order successful, new order is " +  response[0].id, function () {
                        initSet();
                    });
                }, function (error) {
                    $scope.isSeparateOrder=false;
                    lincUtil.processErrorResponse(error);
                })
            };

            $scope.printPalletLabel = function(orderId) {
                if(!orderId) return;
                $scope.printPalletLabeling=true;
                lincUtil.setPropetyToFalseAfterSeconds($scope, "printPalletLabeling");
                var url = $state.href('ordersPalletLabelPrint', { orderIds: [orderId] });
                window.open(url);
            };

            //=============================================

            $scope.addBilling = function () {
                $scope.order.billingManualViews.push({});
            };


            $scope.removeBilling = function (index, billing) {
                $scope.order.billingManualViews.splice(index, 1);
                if (billing.id) {
                    deleteBillingIds.push(billing.id);
                }
            };
            var saveBillingSuccessIndex;
            var shouldSaveBillingSuccessNum = 0;
            $scope.savingBilling = false;
            $scope.saveBilling = function () {
                var data = [];
                _.forEach($scope.order.billingManualViews, function(billing) {
                    if (billing.status === "Sent") return;
                    if (!billing.billingCode) {
                        var mesg = "Please select Account Item && set the QTY!";
                        lincUtil.errorPopup(mesg);
                        throw new Error(mesg);
                    }
                    if (billing.qty && billing.qty < 0) {
                        var mesg = "Please set the QTY >= 0 ";
                        lincUtil.errorPopup(mesg);
                        throw new Error(mesg);
                    }
                    billing.orderId = $scope.order.id;
                    billing.amount = 0;
                    if (billing.unitPrice) {
                        billing.amount = billing.unitPrice * billing.qty;
                    }
                    data.push(billing);
                });
                if (data.length === 0 && deleteBillingIds.length == 0) {
                    lincUtil.errorPopup("No billing need to save!");
                    return;
                }
                saveBilling(data);
            };
            
            function saveBilling(saveBillings) {
                $scope.savingBilling = true;
                saveBillingSuccessIndex = 0;
                shouldSaveBillingSuccessNum = 0;
                if(saveBillings.length  > 0) {
                    shouldSaveBillingSuccessNum ++;
                    billingRecordService.saveBillingManual(saveBillings).then(saveBillingsSuccess, saveBillingsFail);
                }
                if(deleteBillingIds.length > 0) {
                    shouldSaveBillingSuccessNum ++;
                    billingRecordService.batchDelete(deleteBillingIds).then(saveBillingsSuccess, saveBillingsFail);
                }
            }

            function saveBillingsSuccess() {
                saveBillingSuccessIndex ++;
                if (saveBillingSuccessIndex == shouldSaveBillingSuccessNum) {
                    $scope.savingBilling = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        getOrder($scope.order.id);
                    });
                }
            }
            
            function saveBillingsFail(error) {
                $scope.savingBilling = false;
                lincUtil.errorPopup(error);
            }

            $scope.accountItemselect = function (selectedBilling, billing) {
                var views = _.filter($scope.order.billingManualViews, function(view) {
                    return view.billingCode === selectedBilling.AccountItem;
                });
                if (views && views.length > 1) {
                    billing.billingCode = null;
                    billing.billingDesc = null;
                    billing.billingUom = null;
                    billing.unitPrice = null;
                    lincUtil.errorPopup("This code had already added!");
                    return;
                }
                billing.billingDesc = selectedBilling.Description;
                billing.billingUom = selectedBilling.UOM;
                billing.unitPrice = selectedBilling.UnitPrice;
            };

            $scope.editCartonDetail = function(itemLine) {
                var originItemLine = _.cloneDeep(itemLine);
                var form = {
                    templateUrl: 'wms/common/template/editCartonDetail.html',
                    locals: {
                        itemLine:originItemLine
                    },
                    autoWrap: true,
                    controller: editCartonDetailController
                };
                $mdDialog.show(form).then(function (response) {
                    var cartons = response;
                    originItemLine.cartons = cartons;
                    orderService.updateOrderItemLine($stateParams.orderId, itemLine.id, itemLine).then(function(){
                        itemLine.cartons =cartons;
                        lincUtil.updateSuccessfulPopup();
                    },function(error){
                      
                        lincUtil.processErrorResponse(error);
                    });
                });
            };

            $scope.filterToFixed = function(data) {
                if(!data) {return 0};
                if(isInteger(data)) {return data};
                return data.toFixed(2);

            };

            function isInteger(obj) {
                return Math.floor(obj) === obj;
            }

        };
        controller.$inject = ['$scope', 'orderService', 'materialLineService', '$state', 'lincResourceFactory',
            '$stateParams', 'lincUtil', '$mdDialog', 'addressService', 'customerService', 'billingRecordService','fileService','smallParcelShipmentService'];
        return controller;
    });

