'use strict';

define([
    'angular', 'lodash', 'moment', 'clipboard',
    './cancelReceiptDialogController',
    './forceCloseReceiptDialogController',
    './receiptAttachmentController',
    './editSNDetailController',
    'src/wms/common/editCartonDetailController'
], function (angular, _, moment, Clipboard, cancelReceiptDialogController, forceCloseReceiptDialogController,receiptAttachmentController,editSNDetailController,editCartonDetailController) {
    var controller = function ($scope, receiptService, materialLineService,
        $state, $stateParams, lincUtil, customerService, billingRecordService, $mdDialog) {

        var current_page = 1;
        var clipboard = new Clipboard("#copyBtn");
        $scope.pageSize = 10;
        $scope.isItemLineAllExpand = false;
        $scope.isItemLineExpandedList = [];
        $scope.current_page_material = 1;
        $scope.current_page_item = 1;
        var deleteBillingIds;
        function initSet() {
            if ($stateParams.receiptId) {
                getReceipt($stateParams.receiptId);
                getReceiptPhotos($stateParams.receiptId);
            }
            $scope.activeTab = 'info';
        }
        initSet();

        function getReceiptPhotos(receiptId) {
            $scope.loadingPhoto = true;
            receiptService.getReceiptPhotos(receiptId).then(function (res) {
                $scope.offloadPhotos = res.offloadPhotos;
                $scope.lpSetupPhotos = res.lpSetupPhotos;
                $scope.photoMap = res.photoMap;
                $scope.loadingPhoto = false;
                processPhotos();
            });
        }

        function processPhotos() {
            $scope.offloadPhotos = _.groupBy($scope.offloadPhotos, "type");
        }

        function getReceipt(receiptId) {
            $scope.loading = true;
            receiptService.getReceipt(receiptId).then(function (receipt) {
                $scope.loading = false;
                $scope.receipt = receipt;
                initBilling();
                $scope.receipt.totalQty = 0;
                countTotalQty($scope.receipt.itemLines);
                $scope.loadContent_itemLines($scope.current_page_item);
                setupCartonInfo(receipt);
                initSetItemLineIsExpand();
                loadMaterialLines(receipt.id);
                getFieldEditableSet();
                $scope.changeTab_line("itemLine");
                getReceiptDynamicFields(receipt.customerId);
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function initBilling() {
            deleteBillingIds = [];
            billingRecordService.getAccountItems({customerId: $scope.receipt.customerId,  tag:"Inbound"}).then(function (codes) {
                $scope.accountItems = codes;
                if(!_.isEmpty($scope.receipt.billingManualViews)) {
                    return
                }
                var billingManualViews = [];
                _.forEach($scope.accountItems, function (accountItem) {
                    var billing = {billingCode: accountItem.AccountItem};
                    billingManualViews.push(billing);
                    $scope.accountItemselect(accountItem, billing);
                });
                $scope.receipt.billingManualViews =  billingManualViews;
            });
        }

        function setupCartonInfo(receipt) {
            var lpnPalletNoMapByCarton = receipt.lpnPalletNoMapByCarton;
            var putAwayLocationIdMapByCarton = receipt.putAwayLocationIdMapByCarton;
            var allSerialNumbers = _.compact(_.uniq(_.flatten(_.map($scope.receipt.itemLines, "snList"))));
            var cartonStr = angular.copy(allSerialNumbers);
            var ret = [];
            _.forEach(allSerialNumbers, function (carton) {
                var str = "";
                if (lpnPalletNoMapByCarton[carton] && lpnPalletNoMapByCarton[carton].palletNo) {
                    str = str + lpnPalletNoMapByCarton[carton].palletNo + ",";
                }
                else {
                    str = str + "N/A,";
                }
                if (putAwayLocationIdMapByCarton[carton] && putAwayLocationIdMapByCarton[carton].locationName) {
                    str = str + putAwayLocationIdMapByCarton[carton].locationName;
                }
                else {
                    str = str + "N/A";
                }
                if (str) {
                    ret.push(carton + " (" + str + ")");
                }
                else {
                    ret.push(carton);
                }

            });
            $scope.receipt.allSerialNumbers = ret;
            $scope.receipt.cartonStr = _.join(cartonStr, "\n");
        }


        function loadMaterialLines(receiptId) {
            materialLineService.searchMaterialLine({ receiptIds: [receiptId] }).then(function (response) {
                $scope.materialLines = response;
                $scope.loadContent_materialLines($scope.current_page_material);
            });
        }

        function getFieldEditableSet() {
            receiptService.getFieldEditableSet($scope.receipt.status, false, function (isDisabledMap) {
                $scope.isDisabledMap = angular.copy(isDisabledMap);

                if ($scope.receipt.source === "EDI") {
                    $scope.isDisabledMap.cancelReceipt = true;
                    if ($scope.receipt.status === "Imported" || $scope.receipt.status === "Open") {
                        $scope.isDisabledMap.cancelReceipt = false;
                    }
                }
                if ($scope.receipt.status !== "Closed" && ($scope.receipt.receiptType === "Title Transfer Receipt" || $scope.receipt.receiptType === "Migo Transfer Receipt")) {
                    $scope.isDisabledMap.closeReceipt = false;
                }
            });
        }

        function initSetItemLineIsExpand() {
            $scope.itemLineIsExpand = [];
            var len = $scope.itemLineView.length;
            for (var i = 0; i < len; i++) {
                $scope.itemLineIsExpand[i] = $scope.isItemLineAllExpand;
                $scope.isItemLineExpandedList[i] = $scope.itemLineView[i].hasSerialNumber;
            }
        }

        function countTotalQty(itemLines) {
            _.forEach(itemLines, function (itemLine) {
                $scope.receipt.totalQty = itemLine.qty + $scope.receipt.totalQty;
            });
        }

        $scope.loadContent = function (currentPage) {
            current_page = currentPage;
            $scope.current_page = currentPage;
            $scope.itemLineView = $scope.receipt.itemLines.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.receipt.itemLines.length ? $scope.receipt.itemLines.length : currentPage * $scope.pageSize);
        };

        $scope.getPhotoType = function (type) {
            if ("CONTAINER_NO_CHECK" === type) {
                return "Container No";
            }
            if ("SEAL_CHECK" === type) {
                return "Seal No";
            }
            if ("OFFLOAD" === type) {
                return "Offload";
            }
        };

        $scope.formatTime = function (time) {
            if (time) {
                return moment(time).format("YYYY-MM-DD HH:mm:ss");
            } else return "";
        };

        $scope.edit = function (receiptId) {
            $state.go('wms.inbound.receipt.edit', { receiptId: receiptId });
        };

        $scope.changeTab = function (tab) {
            $scope.activeTab = tab;
        };

        $scope.changeTab_line = function (tab) {
            $scope.activeTab_line = tab;
        };

        $scope.loadContent_itemLines = function (currentPage) {
            $scope.current_page_item = currentPage;
            $scope.itemLineView = $scope.receipt.itemLines.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.receipt.itemLines.length ?
                    $scope.receipt.itemLines.length : currentPage * $scope.pageSize);
        };

        $scope.loadContent_materialLines = function (currentPage) {
            $scope.current_page_material = currentPage;
            $scope.materialLineView = $scope.materialLines.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.materialLines.length ?
                    $scope.materialLines.length : currentPage * $scope.pageSize);
        };

        $scope.reopen = function (receiptId) {
            lincUtil.confirmPopup('Reopen confirm', 'Would you like to reopen this receipt?', function () {
                receiptService.reopenReceipt(receiptId).then(function (response) {
                    lincUtil.messagePopup("Message", "Reopen Successful.", function () {
                        initSet();
                    });
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.cancel = function (receiptId) {
            var form = {
                templateUrl: 'wms/inbound/receipt/template/cancelReceiptDialog.html',
                locals: {
                    receiptId: receiptId
                },
                autoWrap: true,
                controller: cancelReceiptDialogController
            };
            $mdDialog.show(form).then(function (response) {
                initSet();
            });
        };

        $scope.close = function (receiptId) {
            lincUtil.confirmPopup('Recope Confirm', 'Would you like to close this receipt?', function () {
                $scope.closing = true;

                receiptService.closeReceipt(receiptId).then(function (response) {
                    $scope.closing = false;
                    lincUtil.messagePopup("Message", "Close Successful.", function () {
                        initSet();
                    });
                }, function (error) {
                    $scope.closing = false;
                    if ($scope.receipt.receiptType === "Title Transfer Receipt" || $scope.receipt.receiptType === "Migo Transfer Receipt") {
                        lincUtil.processErrorResponse(error);
                        return;
                    }
                    if (error.status && error.status === 400) {
                        forceCloseReceipt(receiptId);
                    } else {
                        lincUtil.processErrorResponse(error);
                    }
                });
            });
        };

        function forceCloseReceipt(receiptId) {
            var form = {
                templateUrl: 'wms/inbound/receipt/template/forceCloseReceiptDialog.html',
                locals: {
                    receiptId: receiptId,
                    itemLines: $scope.receipt.itemLines
                },
                autoWrap: true,
                controller: forceCloseReceiptDialogController
            };
            $mdDialog.show(form).then(function (response) {
                initSet();
            });
        }

        $scope.expandItemLine = function (index) {
            $scope.itemLineIsExpand[index] = !$scope.itemLineIsExpand[index];
        };

        $scope.expandAllItemLines = function () {
            $scope.isItemLineAllExpand = !$scope.isItemLineAllExpand;
            angular.forEach($scope.itemLineIsExpand, function (value, key) {
                if ($scope.isItemLineExpandedList[key])
                    $scope.itemLineIsExpand[key] = $scope.isItemLineAllExpand;
            });
        };

        $scope.printTallySheet = function (receiptId) {
            var url = $state.href('receiptTallySheetPrint', {
                receiptId: receiptId
            });
            window.open(url);
        };

        $scope.printReceiptWithDetail  = function (receiptId) {
            var url = $state.href('receiptWithDetailPrint', {
                receiptId: receiptId
            });
            window.open(url);
        };

        function getReceiptDynamicFields(customerId) {
            customerService.getReceiptDynamicFields(customerId).then(function (response) {
                $scope.dynamicFields = response;
            })
        }

        $scope.printPalletLabel = function (receiptId) {
            var url = $state.href('receiptPalletLabelPrint', {
                receiptId: receiptId
            });
            window.open(url);
        };

        $scope.attachment=function(){
            var dialog = {
                templateUrl: 'wms/inbound/receipt/template/receiptAttachment.html',
                locals: {
                    receipt: $scope.receipt
                },
                autoWrap: true,
                controller: receiptAttachmentController
            };
            $mdDialog.show(dialog).then(function (param) {
            });
        }

        //=============================================

        $scope.addBilling = function () {
            $scope.receipt.billingManualViews.push({});
        };

        $scope.removeBilling = function (index, billing) {
            $scope.receipt.billingManualViews.splice(index, 1);
            if (billing.id) {
                deleteBillingIds.push(billing.id);
            }
        };

        $scope.savingBilling = false;
        $scope.saveBilling = function () {
            var data = [];
            _.forEach($scope.receipt.billingManualViews, function(billing)  {
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
                billing.receiptId = $scope.receipt.id;
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

        var saveBillingSuccessIndex = 0;
        var shouldSaveBillingSuccessNum = 0;
        $scope.savingBilling = false;
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
                    getReceipt($scope.receipt.id);
                });
            }
        }

        function saveBillingsFail(error) {
            $scope.savingBilling = false;
            lincUtil.errorPopup(error);
        }

        $scope.accountItemselect = function (selectedBilling, billing) {
            var views = _.filter($scope.receipt.billingManualViews, function(view) {
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

        $scope.editSNDetail = function (index,isEditSNDetail) {
            $scope.itemLine = angular.copy($scope.itemLineView[index]);
            popSNDetail($scope.itemLine,index,isEditSNDetail);
        };

        function popSNDetail(itemLine,index,isEditSNDetail) {
            var form = {
                templateUrl: 'wms/inbound/receipt/template/editSNDetail.html',
                locals: {
                    isEditSNDetail:! isEditSNDetail,
                    itemLine:itemLine ? itemLine : "",
                    snList:itemLine.snList ? itemLine.snList : ""

                },
                autoWrap: true,
                controller: editSNDetailController
            };
            $mdDialog.show(form).then(function (response) {
                $scope.itemLineView[index]['snDetails']=response.snDetails;
                $scope.itemLineView[index]['snList']=response.snList;
            });
        }

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
                receiptService.updateReceiptItemLine($stateParams.receiptId, itemLine.id, itemLine).then(function(){
                    itemLine.cartons =cartons;
                    lincUtil.updateSuccessfulPopup();
                },function(error){
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.IsShowTransferOrder = function(receiptType){
            if( receiptType === 'Title Transfer Receipt' || receiptType === 'Migo Transfer Receipt' ){
                return true;
            }
            return false;
        }

        $scope.IsShowReturnedOrder = function(receiptType){
            if(receiptType === 'Return' ){
                return true;
            }
            return false;
        }

    };
    controller.$inject = ['$scope', 'receiptService', 'materialLineService',
        '$state', '$stateParams', 'lincUtil', 'customerService', 'billingRecordService', '$mdDialog'];
    return controller;
});