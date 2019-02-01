'use strict';

define(['angular', 'lodash', './cloneCustomerSettingController', './customerTemplateSaveController', './customerTemplateChooseController'], 
  function (angular, _,cloneCustomerSettingController, customerTemplateSaveController, customerTemplateChooseController) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemPropertyService, customerService,
        lpConfigurationTemplateService, locationService, lincResourceFactory, $interpolate, bolTemplateService,
                               addressService, organizationRelationshipService, session, constantService, $mdDialog,uomDefinitionService) {
        $scope.isShowCustomerAccounts = false;
        $scope.orderPlanGroupByArr = constantService.getOrderPlanItemLineGroupFields();
        $scope.isShowRetailerShipInfos = false;
        $scope.cloneSettings = {};
        $scope.bolDynamicFieldA1 = {
            content: 'Where the rate is dependent on value, shippers are required to state specifically in writing the agreed or declared value of the property as follows: "The agreed or declared value of the property is specifically stated by the shipper to be not exceeding'
        };
        $scope.bolDynamicFieldA2 = {
            content: 'Where the rate is dependent on value, shippers are required to state specifically in writing the agreed or declared value of the property as follows: "The agreed or declared value of the property is specifically stated by the shipper to be not exceeding'
        };
        $scope.bolDynamicFieldB1 = {
            content: 'RECEIVED.subject to individually determined rates or contracts that have been agreed upon in writing between the carrier and shipper, if applicable, otherwise to the rates, classifications and rules that have been established by the carrier and are available to the shipper, on request, and to all applicable state and federal regulations.'
        };
        $scope.bolDynamicFieldB2 = {
            content: 'The carrier shall not make delivery of this shipment without payment of freight and all other lawful charges.'
        };
        $scope.bolFreightCounted = {
            mbolSelected : true,
            bolSelected : true,
            leftContain : true,
            rightContain : true,
            templateSelected: 'leftTemplateSelected'

        };
        $scope.bolOtherOptions = {
            mbolSelected : true,
            bolSelected : true,
        };
        $scope.codAmountAndFeeTerms = {
            mbolSelected:true,
            bolSelected:true,
            codAcceptable:true,
        };
        $scope.pickVersions = ['OLD','NEW','V1','MAKE PALLET'];
        init();
        var initCustomer = {};
        function init() {
            $scope.activetab = 'basic';
            initSet();
            loadCustomer($stateParams.organizationId);
            searchUomDefinition();
            getAllLocationGroup();
            addressService.searchAddress({}).then(function (data) {
                $scope.addresses = data;

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function initSet() {
            getFacilitesOnCurrentCompany();
            $scope.submitLabel = "Save";
            $scope.invoiceFormatOptions = ["SeperateInvoiceForInbound",
                "SeperateInvoiceForStorage",
                "SeperateInvoiceForOutbound",
                "SeperateInvoiceForFreight",
                "SeperateInvoiceForLateFee",
                "InvoiceGroupByService",
                "SeperateInvoiceByCarrierType",
                "SeperateInvoiceByItemGrade"
            ];
            $scope.shipperAddressTypes = ["RETAILER_ADDRESS", "FACILITY_ADDRESS", "ORDER_SHIP_FROM_ADDRESS"];
            $scope.shipperNameTypes= [ "ORDER_SHIP_FROM_NAME",  "RETAILER_NAME"];
            $scope.LPItemQTYCalcMethods=["By Inbound LP Template","By Item Line"];

            $scope.pickTypes = ["Bulk Pick", "Pallet Pick", "Piece Pick", "Case Pick"];
            $scope.shipmentTrackingTypes = ['LP Level', 'Order Level'];
            $scope.deliverConfirmationLevels = ['By Order', 'By Shipment Ticket'];
            $scope.defaultPickWays = ["Order Pick", "Wave Pick", "Wave Pick(By Order)", "Wave Pick(By Item)"];
            $scope.orderUniqueKeys = ['poNo', 'referenceNo','soNos'];
            $scope.orderItemLineUniqueKeys = ['poLineNo', 'dynTxtPropertyValue01', 'dynTxtPropertyValue02', 'dynTxtPropertyValue03', 'dynTxtPropertyValue04', 'dynTxtPropertyValue05', 'dynTxtPropertyValue06', 'dynTxtPropertyValue07', 'dynTxtPropertyValue08', 'dynTxtPropertyValue09', 'dynTxtPropertyValue10'];
            $scope.receiptUniqueKeys = ['referenceNo'];
            $scope.defaultFreightTerms = ["Collect", "Prepaid", "Third Party"];
            $scope.receiptItemLineUniqueKeys = ['poLineNo', 'dynTxtPropertyValue01', 'dynTxtPropertyValue02', 'dynTxtPropertyValue03', 'dynTxtPropertyValue04', 'dynTxtPropertyValue05', 'dynTxtPropertyValue06', 'dynTxtPropertyValue07', 'dynTxtPropertyValue08', 'dynTxtPropertyValue09', 'dynTxtPropertyValue10'];
            $scope.shippingLabelPrintTypes=['Zebra','PDF'];
            $scope.lpLabelSizes=['2-1','4-6'];
            $scope.creditHandles = ["Credit Limit Exempt", "Credit Hold"];
            $scope.invoiceFormats = ["Detail", "Simple", "Both"];
            $scope.paymentTerms = ["COD", "NET15", "NET30", "NET40", "NET45", "NET60"];
            $scope.shippingRules = ['FIFO', 'LIFO', 'FEFO', 'LSFO'];
            $scope.pickSuggestLevels = ['LP_LEVEL', 'LOCATION_LEVEL'];
            $scope.orderTypes = ['Regular Order', 'Title Transfer Order', 'Migo Transfer Order', 'DropShip Order','Blur Order','CrossDock'];
            $scope.itemLineDynamicFieldLists = ['dynTxtPropertyValue01', 'dynTxtPropertyValue02', 'dynTxtPropertyValue03', 'dynTxtPropertyValue04', 'dynTxtPropertyValue05', 'dynTxtPropertyValue06', 'dynTxtPropertyValue07', 'dynTxtPropertyValue08', 'dynTxtPropertyValue09', 'dynTxtPropertyValue10', 'dynTxtPropertyValue11', 'dynTxtPropertyValue12', 'dynTxtPropertyValue13', 'dynTxtPropertyValue14', 'dynTxtPropertyValue15','dynTxtPropertyValue16', 'dynTxtPropertyValue17','dynTxtPropertyValue18', 'dynTxtPropertyValue19','dynTxtPropertyValue20', 'dynDatePropertyValue01', 'dynDatePropertyValue02', 'dynDatePropertyValue03', 'dynDatePropertyValue04', 'dynDatePropertyValue05'];
            $scope.billingLevels = ["BY PALLET","BY CASE"];
            $scope.locationTypes = ["LOCATION","STAGING","PICK"];
            $scope.isAddAction = $stateParams.organizationId ? true : false;
            $scope.customer = {
                isTransload: false,
                bulkReceving: false,
                allowPartialLockInventory: false,
                isIncludeWip: false,
                isAllowKitting: false,
                hasSerialNumber: false,
                isAllowShortShip: false,
                allowOverWriteItem: false,
                requireCollectLotNoOnReceive: false,
                requireCollectExpirationDateOnReceive: false,
                requireCollectMfgDateOnReceive: false,
                requireCollectShelfLifeDaysOnReceive: false,
                requireCollectLotNoOnTransloadLPN: false,
                requireCollectExpirationDateOnTransloadLPN: false,
                requireCollectPalletNoOnTransloadLPN: false,
                allowReceiptEDI: false,
                allowOrderEDI: false,
                allowReceiveConfirmationEDI: false,
                allowDeliverConfirmationEDI: false,
                allowReceiveConfirmationByNonEDISource: false,
                allowDeliverConfirmationByNonEDISource: false,
                autoGenerateOutboundOrderWhenReceiptIsClosed:false,
                allowIncrementalSendDC: false,
                masterBOLByTrailer: false,
                isForceReceiveByUPC: false,
                autoTriggerPackTask: true,
                enableItemLocationCheck: false,
                releaseCancelledOrderInventoryLockBeforePutBack: false,
                transloadLPNStep: false,
                transloadPutAwayStep: false,
                allowCreateTransloadTaskWithoutMappedOrder: false,
                allowAddingNewItemForReceiving: false,
                requireScanSerialNumberOnTransloadLPN:false,
                onlyCollectSNDuringShipping: false,
                allowCreatePickTaskWithoutPickStrategy:false,
                allowTransloadPhotosStep:false,
                useSLPForShipping:false,
                forceScanCaseUPCForCasePick:false,
                allowAutoAllocateInWavePick:false,
                allowStageAllInWavePick:false,
                disableCreateItemSpecWarningsOnEDI:false,
                allowBatchCloseOrder: false,
                isAllowRetryCommit: false,
                allowUpdateOrderDetailWIP: false,
                autoCollectLotNoFromItemLine: false,
                autoCollectExpDateFromItemLine: false,
                allowSendPI: false,
                allowSendPK: false,
                allowSendGI: false,
                enablePickPullStep:false,
                allowPickByClickItem:false,
                skipCLPInOrderPick:false,
                allowSendSTA: false,
                customerAccounts: [],
                orderTypePickTypeMappings:[],
                retailerShipInfos:[],
                determinePickTypeByUom: false,
                enablePalletPick : false,
                lpLabelSize: "2-1",
                isPackNeedCheckPackagingType: false,
                skipPrintCLPInPick: false,
                enableSelectLPTemplateByTiHiOnReceive:false,
                skipPutAwayOnReceive:false,
                allowReceiveToStorageLocation:false,
                allowMixedPackagingForSmallParcel:false,
                reCalcOrderQtyOnCommitmentByWeight:false,
                disablePickByPallet:false,
                orderUniqueKeys: ['poNo'],
                requireTriggerReplenishOnPickSuggest: false,
                allowSyncReceiptToHon:false,
                allowSyncOrderToHon:false,
                allowPickAutoSubmit:false,
                forceUseLPTemplate:false,
                enablePickBySn:false,
                allowMaterialLineByLPConfigWhenPicked:false,
            };
        }

        $scope.relevancyDynamicFieldA1Mbol = function (mbolSelected, bolDynamicField) {
            if (mbolSelected) {
                bolDynamicField.mbolSelected = false;
            }
        };

        $scope.relevancyDynamicFieldA1Bol = function (bolSelected, bolDynamicField) {
            if (bolSelected) {
                bolDynamicField.bolSelected = false;
            }

        };

        $scope.onCodAmountAndFeeTerms = function (name, isClick) {
            if (!isClick) {
                $scope.codAmountAndFeeTerms[name] = false;
            } else {
                $scope.codAmountAndFeeTerms.codCollect = false;
                $scope.codAmountAndFeeTerms.codPrepaid = false;
                $scope.codAmountAndFeeTerms.codAcceptable = false;
                $scope.codAmountAndFeeTerms[name] = true;
            }
        };

        $scope.onBolFreightCountedLeft = function (name, isClick) {
            if (!isClick) {
                $scope.bolFreightCounted[name] = false;
            } else {
                $scope.bolFreightCounted.leftShipper = false;
                $scope.bolFreightCounted.leftContain = false;
                $scope.bolFreightCounted.leftPieces = false;
                $scope.bolFreightCounted[name] = true;
            }

        };

        $scope.onBolFreightCountedRight = function (name, isClick) {
            if (!isClick) {
                $scope.bolFreightCounted[name] = false;
            } else {
                $scope.bolFreightCounted.rightContain = false;
                $scope.bolFreightCounted.rightPieces = false;
                $scope.bolFreightCounted[name] = true;
            }

        };

        $scope.inactive = function(){
            if($stateParams.organizationId) {
                lincUtil.confirmPopupPromise("Inactive Customer Confirm", "Are you sure to inactive this customer?").then(function(){
                    organizationRelationshipService.inactiveOrganizationCustomer($stateParams.organizationId).then(function(response){
                        lincUtil.messagePopup("Inactive Customer", "Inactive Customer Successful");
                    },function(error){
                        lincUtil.processErrorResponse(error);
                    });
                }, function(){});
            }
            
        }

        function loadBolTemplate(response) {
            if(response.codAmountAndFeeTerms) $scope.codAmountAndFeeTerms = response.codAmountAndFeeTerms;
            if(response.bolDynamicFieldA1) $scope.bolDynamicFieldA1 = response.bolDynamicFieldA1;
            if(response.bolDynamicFieldA2) $scope.bolDynamicFieldA2 = response.bolDynamicFieldA2;
            if(response.bolDynamicFieldB1) $scope.bolDynamicFieldB1 = response.bolDynamicFieldB1;
            if(response.bolDynamicFieldB2) $scope.bolDynamicFieldB2 = response.bolDynamicFieldB2;
            if(response.bolOtherOptions) $scope.bolOtherOptions = response.bolOtherOptions;
            if(response.bolFreightCounted) $scope.bolFreightCounted = response.bolFreightCounted;

            if ($scope.bolFreightCounted && $scope.bolFreightCounted.templateSelected) {
                if ($scope.bolFreightCounted.templateSelected === 'leftTemplateSelected') {
                    $scope.bolFreightCounted.leftSelected = true;
                    $scope.bolFreightCounted.rightSelected = false;

                }
                if ($scope.bolFreightCounted.templateSelected === 'rightTemplateSelected') {
                    $scope.bolFreightCounted.leftSelected = false;
                    $scope.bolFreightCounted.rightSelected = true;
                }

            }
            if ($scope.bolFreightCounted && $scope.bolFreightCounted.leftCheckedLabels) {

                if ($scope.bolFreightCounted.leftCheckedLabels.indexOf('By Driver/pallets said to contain') > -1) {
                    $scope.bolFreightCounted.leftContain = true;
                }

                if ($scope.bolFreightCounted.leftCheckedLabels.indexOf('By Driver/Pieces') > -1) {
                    $scope.bolFreightCounted.leftPieces = true;
                }

                if ($scope.bolFreightCounted.leftCheckedLabels.indexOf('By Shipper') > -1) {
                    $scope.bolFreightCounted.leftShipper = true;
                }

                if ($scope.bolFreightCounted.rightCheckedLabels.indexOf('By Driver/pallets said to contain') > -1) {
                    $scope.bolFreightCounted.rightContain = true;
                }

                if ($scope.bolFreightCounted.rightCheckedLabels.indexOf('By Driver/Pieces') > -1) {
                    $scope.bolFreightCounted.rightPieces = true;
                }

            }
            if ($scope.codAmountAndFeeTerms && $scope.codAmountAndFeeTerms.checkedLabels) {
                if ($scope.codAmountAndFeeTerms.checkedLabels.indexOf('Collect') > -1) {
                    $scope.codAmountAndFeeTerms.codCollect = true;
                }

                if ($scope.codAmountAndFeeTerms.checkedLabels.indexOf('Prepaid') > -1) {
                    $scope.codAmountAndFeeTerms.codPrepaid = true;
                }

                if ($scope.codAmountAndFeeTerms.checkedLabels.indexOf('acceptable') > -1) {
                    $scope.codAmountAndFeeTerms.codAcceptable = true;
                }

            }

        }

        function loadCustomer(orgId) {

            customerService.getCustomerDetailByOrgId(orgId).then(function (response) {  
                $scope.customer = response;
                $scope.getActivatedFacilityNames();
                loadBolTemplate(response);
                if(!$scope.customer.customerAccounts) {
                    $scope.customer.customerAccounts = [];
                }
                if(!$scope.customer.orderTypePickTypeMappings) {
                    $scope.customer.orderTypePickTypeMappings = [];
                }else {
                    $scope.isShowOrderTypePickTypeMappings = true;
                }
                if(!$scope.customer.retailerShipInfos) {
                    $scope.customer.retailerShipInfos = [];
                }else {
                    $scope.isShowRetailerShipInfos = true;
                    initRetailerShipInfos($scope.customer.retailerShipInfos);
                }

                $scope.isSetOutboundOrder= response.defaultCarrierIdByAutoGenerateOutboundOrder;
                $scope.submitLabel = "Update";
                initReceiptFields();
            }, function (error) {
                lincUtil.processErrorResponse(error);
             });
        }
        
        function initRetailerShipInfos(retailerShipInfos) {
            _.forEach(retailerShipInfos, function (info) {
                info.retailerAddressInfo = addressService.generageAddressData(info.retailerAdress);
            });
        }

        function initReceiptFields() {
            if ($scope.customer && $scope.customer.receiptFields) {
                if ($scope.customer.receiptFields.indexOf('containerNo') > -1) {
                    $scope.customer.receiptContainerNo = true;
                }
            }
        }

        function organizeReceiptFieldToSubmit() {
            _.forEach($scope.customer.receiptItemLineDynamicFields, function (val, key) {
                if (!val) {
                    $scope.customer.receiptItemLineDynamicFields[key] = null;
                }
            });
            _.forEach($scope.customer.orderItemLineDynamicFields, function (val, key) {
                if (!val) {
                    $scope.customer.orderItemLineDynamicFields[key] = null;
                }
            });
            _.forEach($scope.customer.receiptDynamicFields, function (val, key) {
                if (!val) {
                    $scope.customer.receiptDynamicFields[key] = null;
                }
            });
            _.forEach($scope.customer.orderDynamicFields, function (val, key) {
                if (!val) {
                    $scope.customer.orderDynamicFields[key] = null;
                }
            });

            $scope.customer.receiptFields = [];
            if ($scope.customer.receiptContainerNo) {
                $scope.customer.receiptFields.push("containerNo");
            }
        }

        function updateBolTemplate(customer) {
            $scope.interpolates = {}
            if ($scope.bolFreightCounted) {

                $scope.interpolates.leftShipper = $scope.bolFreightCounted.leftShipper ? ' ' : 'color: white;';
                $scope.interpolates.leftContain = $scope.bolFreightCounted.leftContain ? ' ' : 'color: white;';
                $scope.interpolates.rightContain = $scope.bolFreightCounted.rightContain ? ' ' : 'color: white;';
                $scope.interpolates.rightPieces = $scope.bolFreightCounted.rightPieces ? ' ' : 'color: white;';
                $scope.interpolates.leftPieces = $scope.bolFreightCounted.leftPieces ? ' ' : 'color: white;';
            }
            if ($scope.bolOtherOptions) {
                $scope.interpolates.displayDriverLicenseNo = $scope.bolOtherOptions.displayDriverLicenseNo ? ' ' : 'color: white;';
                $scope.interpolates.orderTotalPalletsFirst = $scope.bolOtherOptions.orderTotalPalletsFirst ? ' ' : 'color: white;';
            }
            if ($scope.codAmountAndFeeTerms) {
                $scope.interpolates.codAcceptable = $scope.codAmountAndFeeTerms.codAcceptable ? ' ' : 'color: white;';
                $scope.interpolates.codPrepaid = $scope.codAmountAndFeeTerms.codPrepaid ? ' ' : 'color: white;';
                $scope.interpolates.codCollect = $scope.codAmountAndFeeTerms.codCollect ? ' ' : 'color: white;';
            }
            if ($scope.bolDynamicFieldA1) {
                if (!$scope.bolDynamicFieldA1.leftInput) {
                    $scope.bolDynamicFieldA1.leftInputTemplate = '&nbsp;';
                }else {
                    $scope.bolDynamicFieldA1.leftInputTemplate = $scope.bolDynamicFieldA1.leftInput;
                }
                if (!$scope.bolDynamicFieldA1.rightInput) {
                    $scope.bolDynamicFieldA1.rightInputTemplate = '&nbsp;';
                }else {
                    $scope.bolDynamicFieldA1.rightInputTemplate = $scope.bolDynamicFieldA1.rightInput;
                }
                var bolDynamicFieldA1 = bolTemplateService.templateBolDynamicFieldA1();
                $scope.bolDynamicFieldA1.html = $interpolate(bolDynamicFieldA1)($scope);
            }
            if ($scope.bolDynamicFieldA2) {
                if (!$scope.bolDynamicFieldA2.signatureInput) {
                    $scope.bolDynamicFieldA2.signatureInputTemplate = '&nbsp;';
                }else {
                    $scope.bolDynamicFieldA2.signatureInputTemplate = $scope.bolDynamicFieldA2.signatureInput;
                }
                var bolDynamicFieldA2 = bolTemplateService.templateBolDynamicFieldA2();
                $scope.bolDynamicFieldA2.html = $interpolate(bolDynamicFieldA2)($scope);
            }
            if ($scope.bolDynamicFieldB1) {
                var bolDynamicFieldB1 = bolTemplateService.templateBolDynamicFieldB1();
                $scope.bolDynamicFieldB1.html = $interpolate(bolDynamicFieldB1)($scope);
            }
            if ($scope.bolDynamicFieldB2) {
                if (!$scope.bolDynamicFieldB2.signatureInput) {
                    $scope.bolDynamicFieldB2.signatureInputTemplate = '&nbsp;';
                }else {
                    $scope.bolDynamicFieldB2.signatureInputTemplate = $scope.bolDynamicFieldB2.signatureInput;
                }
                var bolDynamicFieldB2 = bolTemplateService.templateBolDynamicFieldB2();
                $scope.bolDynamicFieldB2.html = $interpolate(bolDynamicFieldB2)($scope);
            }

            if ($scope.bolOtherOptions) {
                var bolOtherOptions = bolTemplateService.templatebolOtherOptions();
                $scope.bolOtherOptions.html = $interpolate(bolOtherOptions)($scope);
            }

            if ($scope.codAmountAndFeeTerms) {
                var codAmountAndFeeTerms = bolTemplateService.templateCODAmountandFeeTerms();
                $scope.codAmountAndFeeTerms.html = $interpolate(codAmountAndFeeTerms)($scope);
            }

            if ($scope.bolFreightCounted && $scope.bolFreightCounted.templateSelected) {
                if ($scope.bolFreightCounted.templateSelected === 'leftTemplateSelected') {
                    var leftBolFreightCounted = bolTemplateService.templateleftBolFreightCounted();
                    $scope.bolFreightCounted.html = $interpolate(leftBolFreightCounted)($scope);
                }

                if ($scope.bolFreightCounted.templateSelected === 'rightTemplateSelected') {

                    var rightBolFreightCounted = bolTemplateService.templaterightBolFreightCounted();
                    $scope.bolFreightCounted.html = $interpolate(rightBolFreightCounted)($scope);
                }
            }

            if ($scope.bolFreightCounted) {
                $scope.bolFreightCounted.leftCheckedLabels = [];
                $scope.bolFreightCounted.rightCheckedLabels = [];

                if ($scope.bolFreightCounted.leftContain) {
                    $scope.bolFreightCounted.leftCheckedLabels.push('By Driver/pallets said to contain');
                }

                if ($scope.bolFreightCounted.leftPieces) {
                    $scope.bolFreightCounted.leftCheckedLabels.push('By Driver/Pieces');
                }

                if ($scope.bolFreightCounted.leftShipper) {
                    $scope.bolFreightCounted.leftCheckedLabels.push('By Shipper');
                }

                if ($scope.bolFreightCounted.rightContain) {
                    $scope.bolFreightCounted.rightCheckedLabels.push('By Driver/pallets said to contain');
                }

                if ($scope.bolFreightCounted.rightPieces) {
                    $scope.bolFreightCounted.rightCheckedLabels.push('By Driver/Pieces');
                }

            }

            if ($scope.codAmountAndFeeTerms) {
                $scope.codAmountAndFeeTerms.checkedLabels = [];
                if ($scope.codAmountAndFeeTerms.codCollect) {
                    $scope.codAmountAndFeeTerms.checkedLabels.push('Collect');
                }


                if ($scope.codAmountAndFeeTerms.codPrepaid) {
                    $scope.codAmountAndFeeTerms.checkedLabels.push('Prepaid');
                }


                if ($scope.codAmountAndFeeTerms.codAcceptable) {
                    $scope.codAmountAndFeeTerms.checkedLabels.push('acceptable');
                }
            }


            customer.bolDynamicFieldA1 = $scope.bolDynamicFieldA1;
            customer.bolDynamicFieldA2 = $scope.bolDynamicFieldA2;
            customer.bolDynamicFieldB1 = $scope.bolDynamicFieldB1;
            customer.bolDynamicFieldB2 = $scope.bolDynamicFieldB2;
            customer.bolOtherOptions = $scope.bolOtherOptions;
            customer.bolFreightCounted = $scope.bolFreightCounted;
            customer.codAmountAndFeeTerms = $scope.codAmountAndFeeTerms;
        }

        $scope.cloneCustomerSetting = function() {


            $mdDialog.show({
                templateUrl: 'foundation-data/organization/template/cloneCustomerSetting.html',
                locals: {},
                autoWrap: true,
                controller: cloneCustomerSettingController
            }).then(function (customerId) { 
                if(customerId){
                    customerService.getCustomerDetailByOrgId(customerId).then(function (response) { 
                        var customer = angular.copy($scope.customer);
                      var cloneCustomer = _.merge(customer,response);
                      cloneSelectCustomerToCurrentCustomer(cloneCustomer)
                    },function(error){
                        lincUtil.processErrorResponse(error);
                    })
                }
             
            }, function () { }); 
        }
        
        function cloneSelectCustomerToCurrentCustomer(cloneCustomer){
               
            $scope.cloneCustomerLoading =true;
            var customer = angular.copy($scope.customer);
            cloneCustomer.orgId = $stateParams.organizationId;
            if(customer.id){
                cloneCustomer.id = customer.id;
                customerService.updateCustomer(cloneCustomer).then(function () {
                    $scope.cloneCustomerLoading =false;
                    lincUtil.messagePopup("Message", "Clone Customer Successful.", loadCustomer($stateParams.organizationId));
                }, function(error){
                    $scope.cloneCustomerLoading =false;
                    lincUtil.processErrorResponse(error);
                    initSet();
                });
            }else {
                 delete cloneCustomer.id;
                customerService.createCustomer(cloneCustomer).then(function (res) {
                    $scope.cloneCustomerLoading =false;
                    $scope.submitLabel = "Update";
                    lincUtil.messagePopup("Message", "Clone Customer Successful.", loadCustomer($stateParams.organizationId));
                }, function(error){
                    $scope.cloneCustomerLoading =false;
                    lincUtil.processErrorResponse(error);
                    initSet();
                });
            }
          
        
        }

        $scope.saveAsATemplate = function(){
            $mdDialog.show({
                templateUrl: 'foundation-data/organization/template/customerTemplateSave.html',
                locals: {
                    customerId : $stateParams.organizationId
                },
                autoWrap: true,
                controller: customerTemplateSaveController
            })
        }

        $scope.chooseTemplate = function(){
            $mdDialog.show({
                templateUrl: 'foundation-data/organization/template/customerTemplateChoose.html',
                locals: {
                    customerId : $stateParams.organizationId
                },
                autoWrap: true,
                controller: customerTemplateChooseController
            }).then(function (customerTemplate) {
                if(customerTemplate){
                    var id = $scope.customer.id;
                    $scope.customer = customerTemplate;
                    $scope.customer.id = id;
                    $scope.customer.orgId = $stateParams.organizationId;
                    lincUtil.saveSuccessfulPopup();
                }
            }, function () { }); 
        }

        $scope.getActivatedFacilityNames = function(){
            $scope.activatedFacilityNames = [];
            _.forEach($scope.customer.activatedFacilityIds,function(id){
                $scope.activatedFacilityNames.push($scope.facilitiesList[id].name);
            });
            $scope.customer.requiredCountingSheetFacilities = _.intersection($scope.customer.requiredCountingSheetFacilities,$scope.activatedFacilityNames);
        }

        $scope.getFieldUnits = function (type) {
            if ("Linear" === type) {
                return ["CM", "M", "INCH"];
            } else if ("Weight" === type) {
                return ["G", "KG", "Pound"];
            } else if ("Currency" === type) {
                return ["USD", "EUR", "CNY"];
            }
            return [];
        };

        $scope.cancelEditOrganization = function () {
            $state.go("fd.organization.list");
        };

        $scope.addOrUpdateCustomer = function () {
            var orderTypePickTypeMappings=_.map($scope.customer.orderTypePickTypeMappings, 'orderType');
            if(_.isEqual(orderTypePickTypeMappings,_.uniq(orderTypePickTypeMappings))){
                organizeReceiptFieldToSubmit();
                var customer = angular.copy($scope.customer);
                $scope.loading = true;
                if (customer.id) {
                    updateCustomer(customer);
                } else {
                    customer.orgId = $stateParams.organizationId;
                    createCustomer(customer);
                }

            }else {
                $scope.loading = false;
                lincUtil.errorPopup('Error: Found duplicate order type pick type mapping set');
            }

        };



        function createCustomer(customer) {
            updateBolTemplate(customer);
          customerService.createCustomer(customer).then(function (res) {
                $scope.loading = false;
                $scope.customer.id = res.id;
                $scope.submitLabel = "Update";
                lincUtil.saveSuccessfulPopup(loadCustomer(customer.id));
            }, accessServiceFail);
        }

        function updateCustomer(customer) {
            updateBolTemplate(customer);
            customerService.updateCustomer(customer).then(function (res) {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(loadCustomer(customer.orgId));
            }, accessServiceFail);
        }

        function accessServiceFail(error) {
            $scope.loading = false;
            lincUtil.processErrorResponse(error);
        }

        function getAllLocationGroup() {
            locationService.searchLocationGroup({}).then(function (data) {
                $scope.locationGroups = data;

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.searchAvailableGroups = function (searchText) {
            var param = { customerId: $stateParams.organizationId };
            if (searchText) {
                param.name = searchText;
            }
            itemPropertyService.getItemGroups(param
            ).then(function (data) {
                $scope.availableGroups = data;
            }, function () { });
        };

        $scope.getLpConfigurationTemplates = function (searchText) {
            lpConfigurationTemplateService.searchLpConfigurationSingleTemplate(
                { description: searchText, customerId: $stateParams.organizationId }).then(function (response) {
                    $scope.lpConfigurationTemplates = response;
                });
        };

        $scope.onSelect = function (propertyName) {
            if ($scope.customer && $scope.customer.id) {
                if (!$scope.customer[propertyName]) {
                    $scope.customer[propertyName] = null;
                }
            }
        };

        $scope.clearAllRetailer = function () {
            $scope.customer.allowAutoCloseBackOrderRetailerIds = [];
        };

        $scope.getOrderStatusList = function () {
            lincResourceFactory.getOrderStatus().then(function (response) {
                $scope.orderStatuses = response;
            });
        };

        $scope.getReceiptStatusList = function () {
            lincResourceFactory.getReceiptStatus().then(function (response) {
                $scope.receiptStatuses = response;
            });
        };

        $scope.selectedTab = function (name) {
            $scope.activetab = name;
        }

        $scope.filterAddress = function (name) {

            addressService.searchAddress({ keyword: name }).then(function (data) {
                $scope.addresses = data;

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.generageAddressData = function (data) {
            if(_.isEmpty(data)) return "";
            var orgName = data.organizationName ? "[" +data.organizationName+"] " : "";
            var addressInfo = orgName + "\n" + data.name;
            if (data.address1) {
                addressInfo += " - " + data.address1;
            }
            if (data.city) {
                addressInfo += " " + data.city;
            }
            if (data.state) {
                addressInfo += " " + data.state;
            }
            if (data.zipCode) {
                addressInfo += " " + data.zipCode;
            }
            if (data.storeNo) {
                addressInfo += " (" + data.storeNo + ")";
            }
            return addressInfo;
        };

        $scope.setAutoOutboundOrder=function(value){
             if(value){
                 $scope.isSetOutboundOrder=true;
             }else{
                $scope.customer.defaultFreightTermByAutoGenerateOutboundOrder=null;
                $scope.customer.defaultShipToAddressIdByAutoGenerateOutboundOrder="";
                $scope.customer.defaultCarrierIdByAutoGenerateOutboundOrder="";
                $scope.isSetOutboundOrder=false;
             }
        };

        $scope.addRetailerShipInfo = function () {
            $scope.isShowRetailerShipInfos =  true;
            $scope.customer.retailerShipInfos.push({});
        };
        $scope.removeRetailerShipInfo = function (index) {
            $scope.customer.retailerShipInfos.splice(index, 1);
        };

        $scope.addCustomerAccount = function () {
            $scope.isShowCustomerAccounts =  true;
            $scope.customer.customerAccounts.push({});
        };

        $scope.addOrderTypePickTypeMappings = function () {
            $scope.isShowOrderTypePickTypeMappings =  true;
            $scope.customer.orderTypePickTypeMappings.push({});

        };

        $scope.removeCustomerAccount = function (index) {
            $scope.customer.customerAccounts.splice(index, 1);
        };

        $scope.removeOrderTypePickTypeMappings = function (index) {
            $scope.customer.orderTypePickTypeMappings.splice(index, 1);
        };

        function getFacilitesOnCurrentCompany(){
            $scope.facilities = [];
            organizationRelationshipService.searchRelationship({organizationId: session.getCompanyFacility().companyId,
                relationship: "Facility", scenario: "ORGANIZATION_ONLY_THE_BASIC"
            }).then(function (response) {
                $scope.facilities = lincUtil.extractOrganizationBasicField(response);
                $scope.facilitiesList =_.keyBy($scope.facilities,"id");
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

       function searchUomDefinition() {
            uomDefinitionService.searchUomDefinition({}).then(function (response) {
                
                $scope.uomDefinitions = _.filter(response.uomDefinitions,function(uomDefinition){
                         return _.indexOf(uomDefinition.customerIds,$stateParams.organizationId)>-1 || uomDefinition.isCommon;
                   })
            
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        };
    };
    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemPropertyService',
        'customerService', 'lpConfigurationTemplateService', 'locationService', 'lincResourceFactory','$interpolate', 'bolTemplateService',  'addressService',
    'organizationRelationshipService', 'session', 'constantService','$mdDialog','uomDefinitionService'];

    return controller;
});
