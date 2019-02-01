'use strict';

define([
    'angular',
    'lodash',
    'moment',
    './selectShipController',
    './addItemLineController',
    './addKittingItemController',
    './addItemTrackingnoLineController',
    './addMaterialLineController',
    './showKittingController',
    './editableSettingForOrder'
], function (angular, _, moment, selectShipController, addItemLineCtrl, addKittingItemController, addItemTrackingnoLineController, addMaterialLineCtrl, showKittingController,
             editableSettingForOrder) {
    var controller = function ($scope, lincResourceFactory, organizationService, orderService, lincUtil,
                               $resource, itemService, addressService, carrierService, customerService,
                               materialLineService, $mdDialog, $state, $stateParams, isAddAction,smallParcelShipmentService) {
        var CREATE_TITLE = "Add Order";
        var EDIT_TITLE = "Edit Order";
        var defaultShippingMethods = ['Truckload', 'LTL', 'Small Parcel', 'Will Call'];
        $scope.pageSize = 10;
        $scope.shipmentTrackingTypes=['LP Level','Order Level'];

        var deleteItemIds = [];
        var deletematerialIds = [];
        var NEW_ENTRY = {
            shipFrom: "",
            shipTo: "",
            billTo: "",
            itemLines: [],
            source: 'MANUAL',
            isTransload: false,
            enableAutoCommit: false,
            isAllowRetryCommit: false,
            isRush: false,
            orderType:"Regular Order"
        };
        $scope.current_page_material = 1;
        $scope.current_page_item = 1;
        $scope.materialLines = [];

        $scope.trackingnoitemLines = [];
        $scope.copyTrackingnoitemLines ={};
        var orderTypes = $scope.orderTypeOptions = ['Regular Order', 'Title Transfer Order', 'Migo Transfer Order',
            'DropShip Order', 'Blur Order', 'CrossDock'];
        initSet();

        function initSet() {
            $scope.activetab = "itemLine";
            $scope.isAddAction = isAddAction;
            if($stateParams.orderTab == "info" || $stateParams.orderTab == "dynamicFields") {
                $scope.mainActiveTab = $stateParams.orderTab;
            }else {
                $scope.mainActiveTab = "info";
            }
            if (!isAddAction) {
                $scope.formTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                getOrder($stateParams.orderId);
            } else {
                $scope.formTitle = CREATE_TITLE;
                $scope.submitLabel = "Save";
                $scope.order = angular.copy(NEW_ENTRY);
                $scope.order.totalQty = 0;
                $scope.order.totalPalletQty = 0;
                $scope.itemLineView = [];
                $scope.materialLineView = [];
                $scope.order.allowPartialLockInventory = false;
                $scope.loadComplete = true;
            }
        }
        
        function getOrder(orderId) {
            $scope.loadComplete = false;
            orderService.getOrder(orderId).then(function (order) {
                $scope.loadComplete = true;
                $scope.order = order;
                $scope.order.totalQty = 0;
                $scope.order.totalPalletQty = 0;
                NEW_ENTRY = angular.copy($scope.order);
                countTotalQty($scope.order.itemLines);
                getOrderDynamicFields(order.customerId);
                $scope.loadContent_itemLines($scope.current_page_item);
                loadMaterialLines(order.id);
                getFieldEditableSet();
                setInfoByCustomerId($scope.order.customerId, false);
                setInfoByCarrierId($scope.order.carrierId);
                searchSmallParcelShipmentDetail(orderId);
            }, function (error) {
                $scope.loadComplete = true;
                lincUtil.processErrorResponse(error);
            });
        }


        function searchSmallParcelShipmentDetail(orderId) {
            smallParcelShipmentService.searchSmallParcelShipmentDetail({orderIds:[orderId]}).then(function (response) {
                _.forEach(response,function (item) {
                    $scope.trackingnoitemLines.push({trackingNo:item.trackingNo, shippingCost:item.shippingCost, carrierId:item.carrierId, itemLineDetails:_.filter(response,{trackingNo:item.trackingNo})});
                });
                $scope.trackingnoitemLines = _.uniqBy($scope.trackingnoitemLines,'trackingNo');
                $scope.copyTrackingnoitemLines=angular.copy($scope.trackingnoitemLines);
                _.forEach($scope.trackingnoitemLines, function (item) {
                    _.forEach(item.itemLineDetails, function (snDetail) {
                        snDetail['unit']=_.find( $scope.itemLineView,{unitId:snDetail.unitId}).unit;
                    });
                });

            });


        }

        function getOrderDynamicFields(customerId) {
            customerService.getCustomerByOrgId(customerId).then(function (response) {
                $scope.dynamicFields = response.orderDynamicFields;
            });
        }

        function loadMaterialLines(orderId) {
            materialLineService.searchMaterialLine({orderIds: [orderId]}).then(function (response) {
                $scope.materialLines = response;
                $scope.loadContent_materialLines($scope.current_page_material);
            });
        }

        function getFieldEditableSet() {
            $scope.isDisabledMap = lincUtil.organizationFieldIsDisabledMap(
                editableSettingForOrder, $scope.order.status, false);
        }
        
        $scope.isUpdateItemLineDisabled = function (pro) {
            if(!$scope.isDisabledMap) return false;
            if($scope.order.customerId && $scope.order.allowUpdateOrderDetailWIP) {
                return false;
            }
            return $scope.isDisabledMap[pro];
        };

        function countTotalQty(itemLines) {
            var totalQty = 0;
            var totalPalletQty = 0;
            _.forEach(itemLines, function (itemLine) {
                totalQty = itemLine.qty + totalQty;
                totalPalletQty = itemLine.palletQty + totalPalletQty;
            });
            $scope.order.totalQty = totalQty;
            $scope.order.totalPalletQty = totalPalletQty;
        }

        function setOrderDefaultShipFromAddress(customer) {
            addressService.getCurrentFacilityAddress().then(function (response) {
                if(response.length > 0) {
                    var address = response[0];
                    $scope.order.shipFromId = address.id;
                    var addressInfo = "";
                    if (address.address1) {
                        addressInfo += address.address1;
                    }
                    if (address.address2) {
                        addressInfo += " " + address.address2;
                    }
                    if (address.city) {
                        addressInfo += " " + address.city;
                    }
                    if (address.state) {
                        addressInfo += " " + address.state;
                    }
                    if (address.zipCode) {
                        addressInfo += " " + address.zipCode;
                    }
                    $scope.order.shipFrom = customer.name + " - " + addressInfo;
                }
            });
        }

        $scope.carrierCustomCtrl = {};
        $scope.customerChange = function (customer) {
            setOrderDefaultShipFromAddress(customer);
            setInfoByCustomerId(customer.id, true);
            cancelInfoAboutCarrier();
        };

        $scope.carrierChange = function (carrier) {
            cancelInfoAboutCarrier();
            setInfoByCarrierId(carrier.id);
        };

        function cancelInfoAboutCarrier() {
            $scope.order.shipMethod = null;
            $scope.order.deliveryService = null;
            $scope.carrierServiceTypes = [];
            $scope.carrierShipMethods = [];
        }
        function setInfoByCarrierId(carrierId) {
            carrierService.getCarrierByOrgId(carrierId).then(function(carrier) {
                $scope.carrierServiceTypes = carrier.serviceTypes;
                $scope.carrierShipMethods = _.isEmpty(carrier.shippingMethods)? defaultShippingMethods: carrier.shippingMethods;
                if(carrier.defaultShippingMethod) {
                    $scope.order.shipMethod = carrier.defaultShippingMethod;
                }
            });
        }
        
        function setInfoByCustomerId(customerId, isInherit) {
            customerService.getCustomerByOrgId(customerId).then(function(response) {
                if(isInherit) {
                    $scope.order.shipmentTrackingType = response.shipmentTrackingType? response.shipmentTrackingType:'LP Level';
                    $scope.order.commitmentIncludeWIP = response.isIncludeWip;
                    $scope.order.allowPartialLockInventory = response.allowPartialLockInventory;
                    $scope.order.isTransload = response.isTransload;

                    $scope.order.enableAutoCommit = response.enableAutoCommit;
                    $scope.order.isAllowRetryCommit = response.isAllowRetryCommit;
                }
                $scope.order.allowUpdateOrderDetailWIP = response.allowUpdateOrderDetailWIP;
                setOrderTypeOptions(response);
            });
            $scope.carrierCustomCtrl.manualRefreshOptions(customerId);
        }

        function setOrderTypeOptions(customer) {
            if(!customer.supportedOrderTypes || customer.supportedOrderTypes.length == 0) {
                $scope.orderTypeOptions = orderTypes;
            }else {
                $scope.orderTypeOptions = customer.supportedOrderTypes;
            }
        }


        $scope.loadContent_itemLines = function (currentPage) {
            $scope.current_page_item = currentPage;
            $scope.itemLineView = $scope.order.itemLines.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.order.itemLines.length ? $scope.order.itemLines.length : currentPage * $scope.pageSize);
        };

        $scope.loadContent_materialLines = function (currentPage) {
            $scope.current_page_material = currentPage;
            if(!$scope.materialLines) {
                return;
            }
            $scope.materialLineView = $scope.materialLines.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.materialLines.length ? $scope.materialLines.length : currentPage * $scope.pageSize);
        };

        $scope.editSubItemLines = function () {
            var confirm = $mdDialog.confirm()
                .title('Confirm')
                .textContent('add sub ItemLines to this itemLine')
                .ok('Yes');
            $mdDialog.show(confirm).then(function () {
            });
        };

        $scope.popUpToCreateItemLine = function (item) {
            if (!validateFieldsWhenAddItemLine()) return;
            var form = {
                templateUrl: 'wms/outbound/order/template/addItemLine.html',
                locals: {
                    item: item,
                    customerId: $scope.order.customerId,
                    orderStatus: $scope.order.status
                },
                autoWrap: true,
                controller: addItemLineCtrl
            };
            $mdDialog.show(form).then(function (response) {
                saveItemLineToOrder(response);
            });
        };

        $scope.popUpToCreateKittingItem = function (item) {
            if (!validateFieldsWhenAddItemLine()) return;
            var form = {
                templateUrl: 'wms/outbound/order/template/addKittingItem.html',
                locals: {
                    customerId: $scope.order.customerId
                },
                autoWrap: true,
                controller: addKittingItemController
            };
            $mdDialog.show(form).then(function (response) {
                _.forEach(response, function (item, key) {
                    saveItemLineToOrder({itemLine:item});
                });
            });
        };

        $scope.popUpToCreateItemTrackingNoLine = function (item) {
            if (!validateFieldsWhenAddItemLine()) return;
            if(!$scope.order.carrierId){
                lincUtil.messagePopup("Tip", "Please select Carrier first!");
                return;
            }
            var form = {
                templateUrl: 'wms/outbound/order/template/addItemTrackingnoLine.html',
                locals: {
                    itemLine: $scope.itemLineView,
                    orderId: $scope.order.id,
                    carrierId: $scope.order.carrierId
                },
                autoWrap: true,
                controller: addItemTrackingnoLineController
            };
            $mdDialog.show(form).then(function (response) {
                if(_.some($scope.trackingnoitemLines,{trackingNo:response.trackingNo})) {
                    lincUtil.messagePopup("TrackingNo in TrackingNoList!");
                    return false;
                }
                $scope.trackingnoitemLines.push(response);
            });
        };

        $scope.createMaterialLine = function (item) {
            var form = {
                templateUrl: 'wms/outbound/order/template/addMaterialLine.html',
                locals: {
                    item: item,
                    customerId: $scope.order.customerId
                },
                autoWrap: true,
                controller: addMaterialLineCtrl
            };
            $mdDialog.show(form).then(function (response) {
                saveMaterialLineSucceed(response);
            });
        };
        
        $scope.deleteMaterialLine = function (materialLine) {
            lincUtil.deleteConfirmPopup('Would you like to remove this material Line?', function () {
                var index = getIndexInlines(materialLine, $scope.materialLines);
                $scope.materialLines.splice(index, 1);
                index = getIndexInlines(materialLine, $scope.materialLineView);
                $scope.materialLineView.splice(index, 1);
                if (materialLine.id) deletematerialIds.push(materialLine.id);
            });
        };

        function validateFieldsWhenAddItemLine() {
            if($scope.order && $scope.order.customerId){
                return true;
            }else {
                lincUtil.messagePopup("Tip", "Please select customer first!", function () {
                    $scope.addOrderForm.customer.$invalid = true;
                    $scope.addOrderForm.$setSubmitted();
                    $scope.addOrderForm.$invalid = true;
                });
                return false;
            }
        }

        function saveMaterialLineSucceed(response) {
            var materialLine = response.materialLine;
            if (!materialLine.id && !materialLine.createTimestamp) {
                materialLine.createTimestamp = new Date().getTime();
                $scope.materialLines.push(materialLine);
                $scope.materialLineView.push(materialLine);
            } else {
                var lineIndex = getIndexInlines(materialLine, $scope.materialLines);
                $scope.materialLines[lineIndex] = materialLine;

                var lineIndex1 = getIndexInlines(materialLine, $scope.materialLineView);
                $scope.materialLineView[lineIndex1] = materialLine;
            }
        }

        function saveItemLineToOrder(response) {
            var itemLine = response.itemLine;
            if(judgeItemLinesIsDuplicate(itemLine)) {
                lincUtil.messagePopup("Tip", "Duplicate ItemLine!");
                return;
            }
            $scope.order.totalQty = itemLine.qty + $scope.order.totalQty;
            $scope.order.totalPalletQty = itemLine.palletQty + $scope.order.totalPalletQty;
            if (!itemLine.id && !itemLine.createTimestamp) {
                addItemLineToOrder(itemLine);
            } else {
                updateItemLineToOrder(itemLine);
            }
        }

        function addItemLineToOrder(itemLine) {
            itemLine.createTimestamp = new Date().getTime();
            $scope.order.itemLines.push(itemLine);
            $scope.itemLineView.push(itemLine);
            countTotalQty($scope.order.itemLines);
        }
        
        function updateItemLineToOrder(itemLine) {
            var lineIndex = getIndexInlines(itemLine, $scope.order.itemLines);
            $scope.order.itemLines[lineIndex] = itemLine;
            var lineIndex1 = getIndexInlines(itemLine, $scope.itemLineView);
            $scope.itemLineView[lineIndex1] = itemLine;
            countTotalQty($scope.order.itemLines);
        }

        function setStrWhenIsUndefines(itemLine) {
            if(itemLine.lotNo == undefined) {
                itemLine.lotNo = "";
            }
        }

        function judgeItemLinesIsDuplicate(saveItemLine) {
            var ifDuplicate = false;
            setStrWhenIsUndefines(saveItemLine);
            $scope.order.itemLines.forEach(function (itemLine) {
                setStrWhenIsUndefines(itemLine);
                if(saveItemLine.itemSpecId == itemLine.itemSpecId &&
                    saveItemLine.productId == itemLine.productId &&
                    saveItemLine.unitId == itemLine.unitId &&
                    saveItemLine.lotNo == itemLine.lotNo
                    ) {
                    if(!saveItemLine.id && !saveItemLine.createTimestamp) {
                        ifDuplicate = true;
                    }else if(saveItemLine.id && saveItemLine.id != itemLine.id){
                        ifDuplicate = true;
                    }else if(saveItemLine.createTimestamp && saveItemLine.createTimestamp != itemLine.createTimestamp) {
                        ifDuplicate = true;
                    }
                }
            });
            return ifDuplicate;
        }

        function getIndexInlines(itemLine, lineList) {
            var index;
            if (itemLine.id)
                index = _.findIndex(lineList, {'id': itemLine.id});
            else if (itemLine.createTimestamp)
                index = _.findIndex(lineList, {'createTimestamp': itemLine.createTimestamp});
            return index;
        }

        $scope.deleteItemLine = function (itemLine) {
            lincUtil.deleteConfirmPopup('Would you like to remove this item Line?', function () {
                var index = getIndexInlines(itemLine, $scope.order.itemLines);
                $scope.order.itemLines.splice(index, 1);
                $scope.order.totalQty = $scope.order.totalQty - itemLine.qty;
                $scope.order.totalPalletQty = $scope.order.totalPalletQty - itemLine.palletQty;
                index = getIndexInlines(itemLine, $scope.itemLineView);
                $scope.itemLineView.splice(index, 1);
                if (itemLine.id) deleteItemIds.push(itemLine.id);
            });
        };



        function editOrder(order, itemLines, materialLines) {
            $scope.loading = true;
            delete order.packagingType;
            orderService.updateOrder(order.id, order).then(function () {
                if (itemLines.length == 0 && materialLines.length == 0
                && deleteItemIds.length ==0 && deletematerialIds.length == 0) {
                    submitSuccessPopUp();
                }
                else {
                    submitItemLines(itemLines, order.id);
                    submitMaterialLines(materialLines, order.id);
                    smallParcelShipment(order.id);
                }
            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup(error.data.error);
            });

        }

        $scope.submit = function (form) {
            var order = angular.copy($scope.order);
            if (validateFields()) {
                if (order.shipFromInfo) order.shipFromId = order.shipFromInfo.id;
                if (order.shipToAddress) order.shipToId = order.shipToAddress.id;
                if (order.billToAddress) order.billToId = order.billToAddress.id;

                if (order.soldToAddress) order.soldToId = order.soldToAddress.id;
                if (order.storeAddress) order.storeId = order.storeAddress.id;

                isFailure = false;
                lineSubmmitNum = $scope.order.itemLines.length + deleteItemIds.length + deletematerialIds.length;
                lineSucceedNum = 0;

                delete order.itemLines;
                if (!isAddAction) editOrder(order, $scope.order.itemLines, $scope.materialLines);
                else addOrder(order, $scope.order.itemLines, $scope.materialLines);
            }
        };

        function validateFields() {
            if ($scope.order.itemLines.length === 0) {
                lincUtil.messagePopup("Tip", "At least one ItemLine is required");
                return false;
            } else
                return true;
        }

        var isFailure = false;
        var lineSucceedNum;
        var lineSubmmitNum;
        function addOrder(order, itemLines, materialLines) {
            $scope.loading = true;
            order.source = "MANUAL";
            orderService.createOrder(order).then(function (res) {
                $scope.order.id = res.id;
                if (itemLines.length == 0 && materialLines.length == 0) {
                    submitSuccessPopUp();
                }
                else {
                    submitItemLines(itemLines, $scope.order.id);
                    submitMaterialLines(materialLines, $scope.order.id);
                    smallParcelShipment($scope.order.id);
                }
            }, function (error) {
                $scope.loading = false;
                lincUtil.errorPopup('Save Error! ' + error.data.error);
            });

        }
        
        function submitItemLines(itemLines, orderId) {
            angular.forEach(itemLines, function (itemLine) {
                if (itemLine.unit) itemLine.unitId = itemLine.unit.id;
                if (itemLine.id) {
                    orderService.updateOrderItemLine(orderId, itemLine.id, itemLine)
                        .then(submitLineSuccess, submitLineFail);
                } else
                    orderService.createOrderItemLine(orderId, itemLine)
                        .then(submitLineSuccess, submitLineFail);
            });
            angular.forEach(deleteItemIds, function (deleteId) {
                orderService.deleteOrderItemLine(orderId, deleteId)
                    .then(submitLineSuccess, submitLineFail);
            });
        }

        function submitMaterialLines(materialLines, orderId) {
            angular.forEach(materialLines, function (materialLine) {
                if (materialLine.unit) materialLine.unitId = materialLine.unit.id;
                if (materialLine.id) {
                    materialLineService.updateMaterialLine(materialLine.id, materialLine)
                        .then(submitLineSuccess, submitLineFail);
                } else {
                    materialLine.orderId = orderId;
                    materialLineService.createMaterialLine(materialLine)
                        .then(submitLineSuccess, submitLineFail);
                }
            });
            angular.forEach(deletematerialIds, function (deleteId) {
                materialLineService.deleteMaterialLine(deleteId)
                    .then(submitLineSuccess, submitLineFail);
            });
        }

        function submitLineSuccess(res) {
            lineSucceedNum++;
            if (lineSucceedNum == lineSubmmitNum) {
                submitSuccessPopUp();
            }
        }

        function submitSuccessPopUp() {
            $scope.loading = false;
            if (!isAddAction) {
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go('wms.outbound.order.view', {"orderId":$stateParams.orderId});
                });
            } else {
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('wms.outbound.order.list');
                });
            }
        }

        $scope.deleteTrackingnoitemLine = function (itemLines,index) {
            itemLines.splice(index, 1);
        };

        $scope.deleteTrackingnoItemLineDetail = function (itemLines,index,detailsIndex) {
            itemLines.splice(index, 1);
            if(itemLines.length<1){
                $scope.trackingnoitemLines.splice(detailsIndex, 1);
            }
        };

        function smallParcelShipment(orderId) {
            if(! _.isEqual($scope.copyTrackingnoitemLines,$scope.trackingnoitemLines)) {
                $scope.loading = false;
                var deletetrackingnoLines = _.difference(_.map($scope.copyTrackingnoitemLines,'trackingNo'),_.map($scope.trackingnoitemLines,'trackingNo'));
                if(deletetrackingnoLines.length > 0){
                    smallParcelShipmentService.deleteSmallParcelShipment({trackingNos:deletetrackingnoLines})
                        .then(submitLineSuccess, submitLineFail);
                }
                if($scope.trackingnoitemLines.length > 0){
                    setShipmentsIsShippingLabelPrinted();
                    if (!isAddAction) {
                        smallParcelShipmentService.updateSmallParcelShipment({shipments:$scope.trackingnoitemLines})
                            .then(submitLineSuccess, submitLineFail);
                    } else {
                        smallParcelShipmentService.createSmallParcelShipment({shipments:$scope.trackingnoitemLines})
                            .then(submitLineSuccess, submitLineFail);
                    }
                }
            }
        }

        function setShipmentsIsShippingLabelPrinted(){
            _.forEach($scope.trackingnoitemLines,function(item){
                if(!item.isShippingLabelPrinted){
                    item.isShippingLabelPrinted = true;
                }
            });
        }

        function submitLineFail(error) {
            $scope.loading = false;
            if (!isFailure) {
                lincUtil.errorPopup(error.data.error);
                isFailure = true;
            }
        }

        $scope.cancel = function (form) {
            if (!isAddAction) {
                $state.go('wms.outbound.order.view', {"orderId":$stateParams.orderId});
            } else {
                $state.go('wms.outbound.order.list');
            }
        };

        $scope.getFreightTermList = function (name) {
            return lincResourceFactory.getFreightTermList(name).then(function (response) {
                $scope.freightTermList = response;
            });
        };
        $scope.getStatusList = function (name) {
            return lincResourceFactory.getOrderStatus(name).then(function (response) {
                $scope.statusList = response;
            });
        };

        $scope.selectShip = function (title) {
            var form = {
                templateUrl: 'wms/outbound/order/template/selectShip.html',
                locals: {
                    title: title
                },
                autoWrap: true,
                controller: selectShipController
            };
            $mdDialog.show(form).then(function (param) {
                changeShip(param.data, param.title);
            });
        };

        function changeShip(data, title) {
            var value;
            if (title === "Ship From")
                value = data.shipFromName;
            else if (title === "Ship To")
                value = data.shipToName;
            else if (title === "Bill To")
                value = data.shipFromName;
            value += "\r\n" + data.address;
            value += "\r\n" + data.city + "," + data.state + "," + data.zipcode;

            if (title === "Ship From")
                $scope.order.shipFrom = value;
            else if (title === "Ship To")
                $scope.order.shipTo = value;
            else if (title === "Bill To")
                $scope.order.billTo = value;
        }

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
        
        $scope.changeTab = function (tab) {
            $scope.activetab = tab;
        };

        $scope.changeMainTab = function (tab) {
            $scope.mainActiveTab = tab;
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

    controller.$inject = ['$scope', 'lincResourceFactory', 'organizationService',
        'orderService', 'lincUtil','$resource', 'itemService', 'addressService', 'carrierService',
        'customerService', 'materialLineService', '$mdDialog', '$state', '$stateParams', 'isAddAction', 'smallParcelShipmentService'
    ];
    return controller;
});
