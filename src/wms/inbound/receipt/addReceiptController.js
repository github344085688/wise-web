'use strict';

define([
    'angular',
    'moment',
    'lodash',
    './addItemLineController',
    './addMaterialLineController'
], function (angular, moment, _, addItemLineCtrl, addMaterialLineCtrl) {
    var controller = function ($scope, lincResourceFactory, itemService,
        receiptService, organizationService, materialLineService,
        $resource, $mdDialog, lincUtil, $state, $stateParams, isAddAction, customerService) {

        var CREATE_TITLE = "Add Receipt";
        var EDIT_TITLE = "Edit Receipt";
        var NEW_ENTRY = {files:[], itemLines:[], source: "MANUAL", receiveType:"Regular Receiving"};
        $scope.materialLines = [];
        $scope.materialLineView = [];
        $scope.pageSize = 10;
        var deleteMaterialIds = [];
        var deleteItemIds = [];
        var isFailure;
        var lineSubmmitNum;
        var lineSucceedNum;
        var orginReceipt = {};
        $scope.current_page_material = 1;
        $scope.current_page_item = 1;

        $scope.isTransloads = ['True', 'False'];
        $scope.containerSize = ["20'","40'","40'H","45'"];
        $scope.trailerSize = ["48'","53'"];

        function initSet() {
            $scope.isAddAction = isAddAction;
            $scope.activetab = "itemLine";
            if (!isAddAction) {
                $scope.formReceiptTitle = EDIT_TITLE;
                $scope.submitLabel = "Update";
                getReceipt($stateParams.receiptId);
            }
            else {
                $scope.formReceiptTitle = CREATE_TITLE;
                $scope.submitLabel = "Save";
                $scope.receipt = angular.copy(NEW_ENTRY);
                $scope.receipt.totalQty = 0;
                $scope.loadComplete = true;
            }
        }

        initSet();
        function getReceipt(receiptId) {
            $scope.loadComplete = false;
            receiptService.getReceipt(receiptId).then(function (receipt) {
                $scope.loadComplete = true;
                $scope.receipt = receipt;
                NEW_ENTRY = angular.copy($scope.receipt);
                $scope.receipt.totalQty = 0;
                countTotalQty($scope.receipt.itemLines);
                orginReceipt = angular.copy(receipt);
                $scope.loadContent_itemLines($scope.current_page_item);
                loadMaterialLines(receipt.id);
                getFieldEditableSet();
            }, function (error) {
                $scope.loadComplete = true;
                lincUtil.processErrorResponse(error);
            });
        }
        
        function loadMaterialLines(receiptId) {
            materialLineService.searchMaterialLine({receiptIds: [receiptId]}).then(function (response) {
                $scope.materialLines = response;
                $scope.loadContent_materialLines($scope.current_page_material);
            });
        }

        function getFieldEditableSet() {
            receiptService.getFieldEditableSet($scope.receipt.status, false, function(isDisabledMap){
                $scope.isDisabledMap = angular.copy(isDisabledMap);
            });
        }

        $scope.loadContent_itemLines = function (currentPage) {
            $scope.current_page_item = currentPage;
            $scope.itemLineView = $scope.receipt.itemLines.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.receipt.itemLines.length ? $scope.receipt.itemLines.length : currentPage * $scope.pageSize);
        };

        $scope.loadContent_materialLines = function (currentPage) {
            $scope.current_page_material = currentPage;
            $scope.materialLineView = $scope.materialLines.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.materialLines.length ? $scope.materialLines.length : currentPage * $scope.pageSize);
        };

        function countTotalQty(itemLines) {
            $scope.receipt.totalQty=0;
            _.forEach(itemLines, function (itemLine) {
                $scope.receipt.totalQty = itemLine.qty + $scope.receipt.totalQty;
            });
        }
        
        $scope.popUpToCreateItemLine = function(item) {
            if(!validateFieldsWhenAddItemLine()) return;
            var form = {
                templateUrl: 'wms/inbound/receipt/template/addItemLine.html',
                locals: {
                    itemLine: item,
                    customerId: $scope.receipt.customerId,
                    supplierId: $scope.receipt.supplierId,
                    status: $scope.receipt.status
                },
                autoWrap: true,
                controller: addItemLineCtrl
            };
            $mdDialog.show(form).then(function(response) {
                saveItemLineToReceipt(response);
            });
        };

        function validateFieldsWhenAddItemLine() {
            if(!$scope.receipt.customerId) {
                lincUtil.messagePopup("Tip", "Please select customer first!", function () {
                    $scope.editForm.customer.$invalid = true;
                    $scope.editForm.$setSubmitted();
                    $scope.editForm.$invalid = true;
                });
                return false;
            }else {
                return true;
            }
        }
        
        function saveItemLineToReceipt(response)
        {
            if(!response) return;
            var itemLine = response.itemLine;
            if(judgeItemLinesIsDuplicate(itemLine)) {
                lincUtil.messagePopup("Tip", "Duplicate ItemLine!");
                return;
            }
            if(!$scope.receipt.items) $scope.receipt.items = {};
            if(itemLine.itemSpecId && !$scope.receipt.items[itemLine.itemSpecId]){
                $scope.receipt.items[itemLine.itemSpecId] = itemLine.item;
            }
             
            if(!itemLine.id && !itemLine.createTimestamp) {
                addItemLineToReceipt(itemLine);
            }else {
                updateItemLineToReceipt(itemLine);
            }
            countTotalQty($scope.receipt.itemLines);
        }
        
        function addItemLineToReceipt(itemLine) {
            itemLine.createTimestamp =  new Date().getTime();
            $scope.receipt.itemLines.push(itemLine);
            if(!$scope.itemLineView) $scope.itemLineView = [];
            $scope.itemLineView.push(itemLine);
            
        }

        function updateItemLineToReceipt(itemLine) {
            var lineIndex = getIndexInlines(itemLine, $scope.receipt.itemLines);
            $scope.receipt.itemLines[lineIndex] = itemLine;

            var lineIndex1 = getIndexInlines(itemLine, $scope.itemLineView);
            $scope.itemLineView[lineIndex1] = itemLine;
        }

        function setStrWhenIsUndefines(itemLine) {
            if(itemLine.lotNo == undefined) {
                itemLine.lotNo = "";
            }
        }

        function judgeItemLinesIsDuplicate(saveItemLine) {
            var ifDuplicate = false;
            setStrWhenIsUndefines(saveItemLine);
            $scope.receipt.itemLines.forEach(function (itemLine) {
                setStrWhenIsUndefines(itemLine);
                if(saveItemLine.itemSpecId == itemLine.itemSpecId &&
                    saveItemLine.productId == itemLine.productId &&
                    saveItemLine.unitId == itemLine.unitId &&
                    saveItemLine.lotNo == itemLine.lotNo) {
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
            if(itemLine.id)
                index = _.findIndex(lineList, { 'id': itemLine.id});
            else if(itemLine.createTimestamp)
                index = _.findIndex(lineList, { 'createTimestamp': itemLine.createTimestamp});
            return index;
        }

        $scope.deleteItemLine = function(itemLine) {
            lincUtil.deleteConfirmPopup('Would you like to remove this item Line?', function () {
                var index = getIndexInlines(itemLine, $scope.receipt.itemLines);
                $scope.receipt.itemLines.splice(index, 1);
                $scope.receipt.totalQty = $scope.receipt.totalQty - itemLine.qty;
                $scope.itemLineView.splice(getIndexInlines(itemLine, $scope.itemLineView), 1);
                if(itemLine.id) deleteItemIds.push(itemLine.id);
            });
        };

        $scope.createMaterialLine = function (item) {
            var form = {
                templateUrl: 'wms/inbound/receipt/template/addMaterialLine.html',
                locals: {
                    item: item,
                    customerId: $scope.receipt.customerId
                },
                autoWrap: true,
                controller: addMaterialLineCtrl
            };
            $mdDialog.show(form).then(function (response) {
                saveMaterialLineSucceed(response);
            });
        };

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

        $scope.deleteMaterialLine = function (materialLine) {
            lincUtil.deleteConfirmPopup('Would you like to remove this material Line?', function () {
                var index = getIndexInlines(materialLine, $scope.materialLines);
                $scope.materialLines.splice(index, 1);
                index = getIndexInlines(materialLine, $scope.materialLineView);
                $scope.materialLineView.splice(index, 1);
                if (materialLine.id) deleteMaterialIds.push(materialLine.id);
            });
        };

        function submitMaterialLines(materialLines, receiptId) {
            angular.forEach(materialLines, function (materialLine) {
                if (materialLine.unit) materialLine.unitId = materialLine.unit.id;
                if (materialLine.id) {
                    materialLineService.updateMaterialLine(materialLine.id, materialLine)
                        .then(submitLineSuccess, submitLineFail);
                } else {
                    materialLine.receiptId = receiptId;
                    materialLineService.createMaterialLine(materialLine)
                        .then(submitLineSuccess, submitLineFail);
                }
            });
            angular.forEach(deleteMaterialIds, function (deleteId) {
                materialLineService.deleteMaterialLine(deleteId)
                    .then(submitLineSuccess, submitLineFail);
            });
        }

        $scope.submit = function(form) {
            var receipt = angular.copy($scope.receipt);
            
            if(!isAddAction) editReceipt(receipt, $scope.receipt.itemLines, $scope.materialLines);
            else addReceipt(receipt, $scope.receipt.itemLines, $scope.materialLines);
        };

        function addReceipt(receipt, itemLines, materialLines) {
            $scope.loading = true;
            receipt.source = "MANUAL";
            receiptService.createReceipt(receipt).then(function(res)
            {
                receipt.id = res.id;
                if( $scope.materialLines.length == 0 &&  deleteMaterialIds.length == 0) {
                    submitSuccessPopUp();
                }else {
                    lineSubmmitNum = $scope.materialLines.length + deleteMaterialIds.length;
                    lineSucceedNum = 0;
                    isFailure = false;
                    submitMaterialLines(materialLines, receipt.id);
                }
            },function(error) {
                $scope.loading = false;
                lincUtil.errorPopup('Save Receipt Error! ' + error.data.error);
            });
        }

        function editReceipt(receipt, itemLines, materialLines) {
            if(!receipt.supplierId) {
                receipt.supplierId = null;
            }
            $scope.loading = true;
            receiptService.updateReceipt(receipt).then(function() {
                if(itemLines.length==0 && deleteItemIds==0 && materialLines.length == 0
                    && deleteMaterialIds.length == 0) {
                    submitSuccessPopUp();
                }else {
                    lineSubmmitNum = receipt.itemLines.length + deleteItemIds.length +
                        $scope.materialLines.length + deleteMaterialIds.length;
                    lineSucceedNum = 0;
                    isFailure = false;
                    submitItemLines(itemLines, receipt.id);
                    submitMaterialLines(materialLines, receipt.id);
                    }
            }, function(error) {
                $scope.loading = false;
                lincUtil.errorPopup('Update Error! ' + error.message);
            });
        }

        function submitItemLines(itemLines, receiptId) {
            angular.forEach(itemLines, function (itemLine) {
                if(itemLine.unit) itemLine.unitId = itemLine.unit.id;
                if(itemLine.id){
                    receiptService.updateReceiptItemLine(receiptId, itemLine.id, itemLine)
                        .then(submitLineSuccess, submitLineFail);
                }
                else{
                    receiptService.createReceiptItemLine(receiptId, itemLine)
                        .then(submitLineSuccess, submitLineFail);
                }
            });
            angular.forEach(deleteItemIds, function (deleteId) {
                receiptService.deleteReceiptItemLine(receiptId, deleteId)
                    .then(submitLineSuccess, submitLineFail);
            });
        }

        function submitLineSuccess(res) {
            lineSucceedNum++;
            if(lineSucceedNum == lineSubmmitNum)
            {
                submitSuccessPopUp();
            }
        }

        function submitSuccessPopUp() {
            $scope.loading = false;
            if(!isAddAction){
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go('wms.inbound.receipt.view', {"receiptId":$stateParams.receiptId});
                });
            }else {
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('wms.inbound.receipt.list');
                });
            }
        }

        function submitLineFail(res) {
            $scope.loading = false;
            if(!isFailure) {
                lincUtil.errorPopup('Save itemLine Error! ' + res.data.error);
                isFailure = true;
            }
        }

        $scope.cancel = function(form) {
            $state.go('wms.inbound.receipt.list');
        };

        var types = ['archive', 'audio', 'code', 'excel', 'image',
            'movie', 'pdf', 'powerpoint', 'video', 'word', 'zip'];
        $scope.loadFileChange = function(element) {
            $scope.$apply(function() {
                var file = {};
                file.name = element.files[0].name;
                angular.forEach(types, function (value, key) {
                    if(element.files[0].type.indexOf(value) > -1)
                        file.type = value;
                });
                $scope.receipt.files.push(file);
            });
        };

        $scope.removeFile = function (index) {
            lincUtil.deleteConfirmPopup('Would you like to remove this file?',function () {
                $scope.receipt.files.splice(index, 1);
            });
        };


        $scope.getStatusList = function(name) {
            return lincResourceFactory.getReceiptStatus(name).then(function(response) {
                $scope.statusList = response;
            });
        };

        $scope.titleCustomCtrl = {};
        $scope.carrierCustomCtrl = {};

        $scope.onCustomerSelect = function (customer) {
            if (customer.id) {
                customerService.getCustomerByOrgId(customer.id).then(function (response) {
                    $scope.receipt.isTransload = response.isTransload;
                });
            }
            $scope.titleCustomCtrl.manualRefreshOptions(customer.id);
            $scope.carrierCustomCtrl.manualRefreshOptions(customer.id);
        };

        $scope.changeTab = function (tab) {
            $scope.activetab = tab;
        };

        $scope.onReturnOrderChange =function(order){
            var hasNullOrginReceiptItemLine = !orginReceipt.itemLines || orginReceipt.itemLines.length === 0;
            if(!order){
                $scope.receipt.returnedOrderId = null;
                if(hasNullOrginReceiptItemLine){
                    clearReturnData();
                }
                
            }else{
                if(!orginReceipt.referenceNo){
                    $scope.receipt.referenceNo = order.referenceNo;
                }
                if(hasNullOrginReceiptItemLine){
                    $scope.receipt.itemLines = order.orderItemLines;
                    $scope.loadContent_itemLines($scope.current_page_item);
                }
            }
      
        };

       function clearReturnData(){
            $scope.receipt.returnedOrderId = null;
            if(!orginReceipt.referenceNo){
                $scope.receipt.referenceNo = null;
            }
            $scope.receipt.itemLines = [];
            $scope.loadContent_itemLines($scope.current_page_item);
        }
        $scope.changeReceiptType = function(){
            if($scope.receipt.receiptType!='Return' && (!orginReceipt.itemLines || orginReceipt.itemLines.length === 0)){
                clearReturnData();
            }
         
        }
    };
    controller.$inject = ['$scope', 'lincResourceFactory',
        'itemService', 'receiptService', 'organizationService', "materialLineService",
        '$resource', '$mdDialog', 'lincUtil', '$state', '$stateParams', 'isAddAction', 'customerService'];
    return controller;
});