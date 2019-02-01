'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var ctrl = function ($scope, $stateParams, itemPropertyService, locationService, customerService, $state,
        isAddAction, lincUtil, inheritPropertiesService) {

        var ctrl = this;
        var availableAllProperties = [];
        var itemOriginalProperties = [{}];
        var itemGroupEntity = {
            properties: [],
            hasSerialNumber: false,
            bundle: false,
            validationInboundSerialNo: false,
            validationOutboundSerialNo: false,
            validatedOutboundSerialNoAgainstInbound: false,
            serialNoScanLotNoCheck: false,
            isHazardousMaterial: false,
            allowOverWriteItem: false,
            requireCollectLotNoOnReceive: false,
            requireCollectExpirationDateOnReceive: false,
            requireCollectMfgDateOnReceive: false,
            requireCollectShelfLifeDaysOnReceive: false
        };
        init();

        function init() {
            getAllLocationGroup();
            getAvailableProperties();
            ctrl.isAddAction = isAddAction;
            if (ctrl.isAddAction) {
                $scope.submitLabel = "Save";
                ctrl.itemPropertyGroup = angular.copy(itemGroupEntity);
            } else {
                $scope.submitLabel = "Update";
                itemPropertyService.getItemPropertyGroupById($stateParams.itemGroupId).then(function (data) {
                    ctrl.itemPropertyGroup = data;
                    if (ctrl.itemPropertyGroup.properties.length === 0) {
                        ctrl.itemPropertyGroup.properties = [];
                    }
                });
            }
        }

        function getAvailableProperties() {
            itemPropertyService.getProperties({}).then(function (response) {
                ctrl.availableProperties = response.itemProperties;
                availableAllProperties = angular.copy(ctrl.availableProperties);
            });
        }

        ctrl.onSelectCustomer = function (customer) {
            if (customer && !ctrl.itemPropertyGroup.parentId) {
                inheritPropertiesService.inheritPropertiesFromCustomerByCustomerId
                    (ctrl.itemPropertyGroup, customer.id);
            }
            ctrl.getAvailableGroups();
        };

        ctrl.onSelectTag = function () {
            ctrl.getAvailableGroups();
        };

        function addPropertiesToGroup(parentGroupProperties) {
            var groupDiffProperties = _.differenceWith(parentGroupProperties, ctrl.itemPropertyGroup.properties, function (object, other) {
                return object.propertyId === other.propertyId;
            });
            ctrl.itemPropertyGroup.properties = _.concat(ctrl.itemPropertyGroup.properties, groupDiffProperties);
        }

        ctrl.onSelectGroup = function (group) {
            itemPropertyService.idToProperties(group.properties);
            inheritPropertiesService.inheritPropertiesFromGroup(ctrl.itemPropertyGroup, group);
            addPropertiesToGroup(group.properties);
        };

        ctrl.hasSerialNumberOnChange = function (value) {
            if (!value) {
                ctrl.itemPropertyGroup.validationInboundSerialNo = false;
                ctrl.itemPropertyGroup.validationOutboundSerialNo = false;
                ctrl.itemPropertyGroup.validatedOutboundSerialNoAgainstInbound = false;
                ctrl.itemPropertyGroup.serialNoScanLotNoCheck = false;
            }
        }

        function propertyAndGroupPropertyComparator(object, other) {
            return object.id === other.propertyId;
        }

        ctrl.filterAvailableProperties = function () {
            var temp = _.differenceWith(availableAllProperties, ctrl.parentGroupProperties, propertyAndGroupPropertyComparator);
            ctrl.availableProperties = _.differenceWith(temp, ctrl.itemPropertyGroup.properties, propertyAndGroupPropertyComparator);
        };

        ctrl.addGroupProperty = function () {
            ctrl.itemPropertyGroup.properties.push({});
        };

        ctrl.removeGroupProperty = function (index) {
            ctrl.itemPropertyGroup.properties.splice(index, 1);
            ctrl.availableProperties = angular.copy(availableAllProperties);
        };

        function createItemGroup(itemGroup) {
            $scope.loading = true;
            itemPropertyService.addItemGroup(itemGroup).then(function (data) {
                $scope.loading = false;
                ctrl.itemPropertyGroup.id = data.id;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('fd.item.itemGroup.list');
                });
            }, function (err) {
                $scope.loading = false;
                lincUtil.errorPopup(err.data.error);
            });
        }



        function getCustomerIsRequired() {
            var tags = ctrl.itemPropertyGroup.tags;
            if(tags.indexOf("Product") > -1) {
                return true;
            }else {
                return false;
            }
        }

        ctrl.addOrUpdateItemProperty = function () {
            var itemGroup = angular.copy(ctrl.itemPropertyGroup);
            if(!itemGroup.customerId && getCustomerIsRequired()) {
                lincUtil.messagePopup("Message", "Please select customer!");
                return;
            }
            if (ctrl.isAddAction) {
                createItemGroup(itemGroup);
            } else {
                lincUtil.confirmPopup("Message", "Would you like to overwrite to child item group?", function () {
                    itemGroup.isOverwriteToChildItemGroup = true;
                    updateItemGroup(itemGroup);
                }, function () {
                    itemGroup.isOverwriteToChildItemGroup = false;
                    updateItemGroup(itemGroup);
                });
            }
        };

        function updateItemGroup(itemGroup) {
            itemPropertyService.updateItemGroup(itemGroup).then(function (data) {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go('fd.item.itemGroup.list');
                });
            }, function (err) {
                $scope.loading = false;
                lincUtil.errorPopup(err.data.error);
            });
        }

        ctrl.getAvailableGroups = function (group) {
            var searchParam = {};
            if (group) {
                searchParam.name = group.name;
            }
            if (ctrl.itemPropertyGroup && ctrl.itemPropertyGroup.customerId) {
                searchParam.customerId = ctrl.itemPropertyGroup.customerId;
            }
            if(ctrl.itemPropertyGroup && ctrl.itemPropertyGroup.tags
                && ctrl.itemPropertyGroup.tags.length > 0) {
                searchParam.tags = ctrl.itemPropertyGroup.tags;
            }
            itemPropertyService.getItemGroups(searchParam).then(function (groups) {
                removeCurrentGroup(groups);
                removeParentGroup(groups);
                ctrl.availableGroups = groups;
            }, function () { });
        };

        function removeParentGroup(groups) {
            if (ctrl.itemPropertyGroup.parentId) {
                var index = _.findIndex(groups, function (group) {
                    return group.id == ctrl.itemPropertyGroup.parentId;
                });
                if (index < 0) {
                    delete ctrl.itemPropertyGroup.parentId;
                }
            }
        }

        function removeCurrentGroup(groups) {
            if ($stateParams.itemPropertyGroupId) {
                _.remove(groups, function (group) {
                    return group.id == $stateParams.itemPropertyGroupId;
                });
            }
        }

        function getAllLocationGroup() {
            locationService.searchLocationGroup({}).then(function (data) {
                $scope.locationGroups = data;

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        ctrl.cancelEditItemPropertyGoup = function () {
            $state.go('fd.item.itemGroup.list');
        };
    };
    ctrl.$inject = ['$scope', '$stateParams', 'itemPropertyService', 'locationService', 'customerService', '$state',
        'isAddAction', 'lincUtil', 'inheritPropertiesService'];
    return ctrl;
});
