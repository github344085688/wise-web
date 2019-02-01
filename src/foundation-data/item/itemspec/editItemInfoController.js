'use strict';

define([
    'angular',
    'lodash',
    'src/common/upload/uploadController'
], function(angular, _,  uploadController) {
    var controller = function($scope, $state, $stateParams, lincUtil, customerService,
                              inheritPropertiesService,
                              itemService, itemPropertyService, lincResourceFactory, $mdDialog) {

        var availableAllProperties = [];
        var orginalAllItemProperties = [];
        var isAddAction;
        $scope.itemUpcCollects = [];
        $scope.itemSNValidateRule={};
        $scope.oldItemSNValidateRule={};
        var ITEM_ENTRY = {
            hasSerialNumber: false,
            bundle: false,
            validationInboundSerialNo: false,
            validationOutboundSerialNo: false,
            validatedOutboundSerialNoAgainstInbound: false,
            serialNoScanLotNoCheck: false,
            requireCollectLotNoOnReceive: false,
            requireCollectExpirationDateOnReceive: false,
            requireCollectMfgDateOnReceive: false,
            requireCollectShelfLifeDaysOnReceive: false,
            isHazardousMaterial: false,
            allowOverWriteItem: false,
            isCaseUPCVerified: false,
            allowMixedPackagingForSmallParcel: false,
            fields: [],
            tags: ["Product"]
        };

        function getItem(id) {
            itemService.getItemById(id).then(function (data) {
                ITEM_ENTRY = angular.copy(data);
                $scope.item = data;
                if (!$scope.item.titleIds) {
                    $scope.item.titleIds = [];
                }
                if (!$scope.item.supplierIds) {
                    $scope.item.supplierIds = [];
                }
                if (!$scope.item.fields) {
                    $scope.item.fields = [];
                }
                if (!$scope.bundle) {
                    $scope.bundle = false;
                }
                if (!$scope.hasSerialNumber) {
                    $scope.hasSerialNumber = false;
                }
                if (!$scope.item.seletedUpcId && defaultUpcId) {
                    $scope.item.seletedUpcId = defaultUpcId;
                }

                getCustomerSetting($scope.item.customerId);
            });
        }

        function searchItemSNValidationRule(itemSpecId) {
            itemService.searchItemSNValidationRule({itemSpecId:itemSpecId}).then(function (response) {
                $scope.loading = false;
                if(response && response.length>0){
                    $scope.itemSNValidateRule=response[0];
                    $scope.oldItemSNValidateRule=angular.copy(response[0]);
                }

            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        /*item info page*/
        function init() {
            itemUpcCollectSearch();
            getFieldUnits();
            if ($stateParams.itemSpecId) {
                $scope.submitLabel = "Update";
                isAddAction = false;
                getItem($stateParams.itemSpecId);
                initItemPicture($stateParams.itemSpecId);
                searchItemSNValidationRule($stateParams.itemSpecId);
            }
            else {
                $scope.submitLabel = "Save";
                isAddAction = true;
                $scope.item = angular.copy(ITEM_ENTRY);
                if (!$scope.item.seletedUpcId && defaultUpcId) {
                    $scope.item.seletedUpcId = defaultUpcId;
                }
                $scope.customerIsRequired = true;
            }
            getAvailableProperties();
        }

        function getAvailableProperties() {
            itemPropertyService.getItemProperties({}).then(function (response) {
                $scope.availableProperties = response;
                availableAllProperties = angular.copy(response);
            });
        }

        // $scope.diverseChange = function (index) {
        //     var field = $scope.item.fields[index];
        //     if (field.diverse) {
        //         field.value = null;
        //         field.unit = null;
        //     }
        // };

        $scope.removeProperty = function (index) {
            $scope.item.fields.splice(index, 1);
        };

        $scope.addProperty = function () {
            $scope.item.fields.push({});
        };

        $scope.itemPropertyOnSelect = function (property, index) {
            property.itemProperty = angular.copy(property);
            property.propertyId = property.id;
            $scope.item.fields[index] = property;
        };

        function createItem(item) {
            if (!item.bundle) {
                item.bundle = false;
            }
            $scope.loading = true;
            item.channel = 'MANUAL';
            itemService.addItemSpec(item).then(function (data) {
                $scope.item.id = data.id;
                if(item.hasSerialNumber && $scope.itemSNValidateRule.validateRegex){
                    $scope.itemSNValidateRule.itemSpecId=data.id;
                    itemService.createItemSNValidationRule($scope.itemSNValidateRule).then(function (response) {
                        $scope.loading = false;
                        lincUtil.saveSuccessfulPopup(function () {
                            $state.go("fd.item.itemspec.edit", {itemSpecId: $scope.item.id});
                        });
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                        lincUtil.saveSuccessfulPopup(function () {
                            $state.go("fd.item.itemspec.edit", {itemSpecId: $scope.item.id});
                        });
                    });

                }else {
                    $scope.loading = false;
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go("fd.item.itemspec.edit", {itemSpecId: $scope.item.id});
                    });
                }

            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function itemServiceSNValidationRule(itemSNValidateRule) {
            itemSNValidateRule.then(function (response) {
                if(response.id){
                    $scope.itemSNValidateRule.id=response.id;
                }else {
                    $scope.itemSNValidateRule={};
                }
                lincUtil.updateSuccessfulPopup();
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function updateItem(item) {
            $scope.loading = true;
            item.updateFrom = "Web";

           itemService.updateItemSpec(item).then(function (data) {
               $scope.$parent.item.bundle = $scope.item.bundle;
               if(item.hasSerialNumber && !_.isEqual($scope.itemSNValidateRule,$scope.oldItemSNValidateRule)){
                   if($scope.itemSNValidateRule.id &&  $scope.itemSNValidateRule.validateRegex){
                       itemServiceSNValidationRule(itemService.updateItemSNValidationRule($scope.itemSNValidateRule));
                       return false;
                   }
                   if($scope.itemSNValidateRule.id && !$scope.itemSNValidateRule.validateRegex ){
                       itemServiceSNValidationRule(itemService.deleteItemSNValidationRule($scope.itemSNValidateRule));
                       return false;
                   }
                   if(!$scope.itemSNValidateRule.id && $scope.itemSNValidateRule.validateRegex){
                       $scope.itemSNValidateRule.itemSpecId=item.id;
                       itemServiceSNValidationRule(itemService.createItemSNValidationRule($scope.itemSNValidateRule));
                       return false;
                   }

               }
               if(!item.hasSerialNumber && $scope.itemSNValidateRule['id']) {
                   itemServiceSNValidationRule(itemService.deleteItemSNValidationRule($scope.itemSNValidateRule));
                   return false;
               }
                   $scope.loading = false;
                   lincUtil.updateSuccessfulPopup();

            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function getCustomerIsRequired() {
            var tags = $scope.item.tags;
            if(tags.indexOf("Product") > -1) {
                return true;
            }else {
                return false;
            }
        }

        $scope.saveOrUpdateItemInfo = function () {
            if(!$scope.item.customerId && getCustomerIsRequired()) {
                lincUtil.messagePopup("Message", "Select customer!");
                return;
            }
            var item = angular.copy($scope.item);
            if (!$stateParams.itemSpecId) {
                createItem(item);
            } else {
                updateItem(item);
            }
        };


        $scope.searchAvailableGroups = function(searchText) {
            // if((!$scope.item || !$scope.item.customerId)) {
            //     $scope.availableGroups = [];
            //     return;
            // }
            var searchParam = {};
            if(searchText) {
                searchParam.name = searchText;
            }
            searchParam.customerId = $scope.item.customerId
            if(!searchParam.customerId) {
                searchParam.customerId = null;
            }
            itemPropertyService.getItemGroups(searchParam).then(function(groups) {
                removeGroup(groups);
                $scope.availableGroups = groups;
            }, function() {});
        };

        function removeGroup(groups) {
            if($scope.item.groupId) {
                var index = _.findIndex(groups, function (group) {
                    return group.id == $scope.item.groupId;
                });
                if(index < 0) {
                    delete $scope.item.groupId;
                }
            }
        }
        $scope.cancel = function () {
            $state.go("fd.item.itemspec", {itemSpecId: $scope.item.id});
        };

        $scope.onSelectCustomer = function (customerId) {
            $scope.searchAvailableGroups();
            if(!customerId) {
                $scope.item.groupId = null;
                return;
            }
            customerService.getCustomerByOrgId(customerId).then(function (customer) {
                if(customer.itemGroup) {
                    $scope.item.groupId = customer.itemGroup;
                    $scope.onSelectGroup($scope.item.groupId);
                }else {
                    if(isAddAction) {
                        inheritPropertiesService.inheritPropertiesFromCustomer($scope.item, customer);
                    } else {
                        $scope.item.isAllowKitting = customer.isAllowKitting;
                    }
                }
            });
        };

        $scope.onSelectGroup = function (groupId) {
            if (groupId) {
                itemPropertyService.getItemPropertiesByGroupId(groupId).then(function (groupProperties) {
                    orginalAllItemProperties = angular.copy($scope.item.fields);
                    updateItemProperties(groupProperties);
                });
                if(isAddAction) {
                    inheritPropertiesService.inheritPropertiesFromGroupByGroupId($scope.item, groupId);
                }
            }
        };

        function getCustomerSetting(customerId) {
                customerService.getCustomerByOrgId(customerId).then(function (ct) {
                    $scope.item.isAllowKitting = ct.isAllowKitting;
                });
        }

        $scope.hasSerialNumberOnChange = function (value) {
            if(!value) {
                $scope.item.validationInboundSerialNo = false;
                $scope.item.validationOutboundSerialNo = false;
                $scope.item.validatedOutboundSerialNoAgainstInbound = false;
                $scope.item.serialNoScanLotNoCheck = false;
            }
        };

        function updateItemProperties(groupProperties) {
            var temp = angular.copy(orginalAllItemProperties);
            var groupDiffProperties = _.differenceWith(groupProperties, temp, function (object, other) {
                return object.propertyId === other.propertyId;
            });
            itemPropertyService.idToProperties(groupDiffProperties);
            temp = _.concat(orginalAllItemProperties, groupDiffProperties);
            $scope.item.fields = temp;
        }

        function initItemPicture(id) {
            $scope.itemPictures = [];
            if(id)
            {
                itemService.searchItemPictures({ itemSpecId: id }).then(function(response) {
                    if (response && response.length > 0)
                        $scope.itemPictures = response;
                });
            }
            if($scope.itvId){
                clearInterval($scope.itvId);
            }

            $scope.itvId = setInterval(function() {
                if (_.size($scope.itemPictures) > 3){
                    var rest = _.takeRight($scope.itemPictures, _.size($scope.itemPictures)-1);
                    rest.push(_.first($scope.itemPictures));
                    $scope.itemPictures = rest;
                    $scope.$apply("itemPictures");
                }
            }, 3000);
        }

        $scope.uploadFiles = function() {
            if(!$stateParams.itemSpecId){
                lincUtil.messagePopup("Message", "Save item info first.");
                return;
            }
            var form = {
                templateUrl: 'common/upload/template/upload.html',
                autoWrap: true,
                title: 'Upload product images',
                locals: {
                    formTitle: "Upload product images",
                    fileIds: $scope.item.fileIds,
                    itemSpecId: $stateParams.itemSpecId,
                    refresh: initItemPicture
                },
                controller: uploadController
            };
            $mdDialog.show(form).then(function(response) {
                init();
            });
        };

        function getFieldUnits() {
            lincResourceFactory.getFieldUnits().then(function (response) {
                $scope.fieldUnits = response;
            });
        }
        var defaultUpcId;
        function itemUpcCollectSearch() {
            itemService.itemUpcCollectSearch({itemSpecId:$stateParams.itemSpecId, statuses: ["New"]}).then(function (response) {
                $scope.itemUpcCollects = response;
                if ($scope.itemUpcCollects && $scope.itemUpcCollects.length > 0) {
                    defaultUpcId = $scope.itemUpcCollects[$scope.itemUpcCollects.length - 1].id;
                }
            });
        }

        $scope.approve=function(){
            $scope.approveLoading=true;
            var seletedUpcId=$scope.item.seletedUpcId;
            if(seletedUpcId){
                itemService.itemUpcCollectApprove({id:seletedUpcId}).then(function (response) {
                    $scope.approveLoading=false;
                    init();
                },function(error){
                    $scope.approveLoading=false;
                    lincUtil.processErrorResponse(error);
                });
            }else{
                $scope.approveLoading=false;
                lincUtil.messagePopup("Message", "Please Select An Upc Code Collect.");
            }
        }
        init();

        $scope.getStatusList = function(name) {
            return lincResourceFactory.getItemStatus(name).then(function(response) {
                $scope.statusList = response;
            });
        };

        $scope.removeFile = function (ItemPictureId) {
            lincUtil.deleteConfirmPopup("Are you sure to delete this img?", function() {
                 itemService.removeItemPicture(ItemPictureId);
                _.remove($scope.itemPictures, function (pic) {
                    return pic.id == ItemPictureId;
                });
            });
        }

    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'customerService',
        'inheritPropertiesService', 'itemService',
        'itemPropertyService', 'lincResourceFactory', '$mdDialog'];

    return controller;
});
    