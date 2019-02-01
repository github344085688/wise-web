'use strict';

define(['lodash',
    'moment',
    "./popupBatchMessageController"
], function (_, moment, popupBatchMessageController) {
    var waitingConfirmController = function ($scope, $state, $mdDialog, itemService, lincUtil, checkItemIds, itemPropertyService, lincResourceFactory) {

        $scope.filterPropertys = [];
        $scope.propertyfields = [];
        $scope.inactivePropertyIds = [];
        $scope.classList = [];
        $scope.btnInfo = [];
        $scope.ItemFieldBatch = {};
        $scope.submitName = "Update";
        $scope.isShowError = false;
        $scope.isLoading = false;

        function _init() {
            $scope.activeTab_line = "updateProperty";
            $scope.itemIds = checkItemIds;
            getAvailableProperties();
            getItemProperties();
            getFieldUnits();

        }

        function getItemProperties() {
            itemService.itemSearch({ "ids": checkItemIds }).then(function (response) {
                $scope.itemList = response;
                getItemSpecFieldMap(response);
                var itemPropertys = _.flattenDeep(_.map(response, function (item) {
                    if (item.hasOwnProperty('fields')) {
                        return item.fields
                    }
                    else {
                        return [];
                    }
                }));

                var filterFalseDiversePropertys = _.filter(itemPropertys, function (item) {
                    return item.diverse == false;
                });
                var filterDiverseTruePropertys = _.filter(itemPropertys, function (item) {
                    return item.diverse == true;
                });

                $scope.ItemSpecFieldIdMap = _.keyBy(filterFalseDiversePropertys, 'id');

                var notDiversePropertyIds = _.uniq(_.flattenDeep(_.map(filterFalseDiversePropertys, function (item) {
                    if (item.hasOwnProperty('propertyId')) {
                        return item.propertyId
                    } else {
                        return [];
                    }
                })));
                var diverseTruePropertyIds = _.uniq(_.flattenDeep(_.map(filterDiverseTruePropertys, function (item) {
                    if (item.hasOwnProperty('propertyId')) {
                        return item.propertyId
                    } else {
                        return [];
                    }
                })));

                _.forEach(notDiversePropertyIds, function (propertyId) {
                    if (_.indexOf(diverseTruePropertyIds, propertyId) < 0) {
                        var obj = _.filter(filterFalseDiversePropertys, { 'propertyId': propertyId });
                        var mapValue = _.uniq(_.flattenDeep(_.map(obj, function (item) {
                            if (item.hasOwnProperty('value')) {
                                return item.value
                            }
                            else {
                                return [];
                            }
                        })));
                        var filterPropertyObject = {
                            'propertyId': propertyId,
                            'value': mapValue.length == 1 ? mapValue[0] : "",
                            'diverse': false
                        };
                        $scope.filterPropertys.push(filterPropertyObject);
                    }

                });

            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function getItemSpecFieldMap(item) {
            $scope.specFieldMapItemName = _.keyBy(item, "name");
            _.forEach($scope.specFieldMapItemName, function (value, key) {


                var diverseFasleFields = _.filter(value.fields, function (item) {
                    return item.diverse == false;

                });
                var specFieldIds = _.flattenDeep(_.map(diverseFasleFields, 'id'));
                $scope.specFieldMapItemName[key] = specFieldIds;
            });

        }

        $scope.changeTab_line = function (tab) {
            $scope.activeTab_line = tab;
            if (tab == "updateProperty") {
                $scope.submitName = "Update";
            }
            if (tab == "inactiveProperty") {
                $scope.submitName = "Inactive";
            }
            if (tab == "addpProperty") {
                $scope.submitName = "Add";
            }
        }

        function getAvailableProperties() {
            itemPropertyService.getItemProperties({}).then(function (response) {
                $scope.availablePropertiesMap = _.keyBy(response, 'id');
                $scope.availableProperties = response;
            });
        }

        $scope.removeProperty = function (index) {
            $scope.propertyfields.splice(index, 1);
        };

        $scope.addProperty = function () {
            $scope.propertyfields.push({});
        };

        $scope.itemPropertyOnSelect = function (property, index) {
            property.itemProperty = angular.copy(property);
            property.propertyId = property.id;
            $scope.propertyfields[index] = property;
        };

        function getFieldUnits() {
            lincResourceFactory.getFieldUnits().then(function (response) {
                $scope.fieldUnits = response;
            });
        }

        $scope.removeUpadateProperty = function (property, index) {
            if ($scope.classList[index]) {
                $scope.classList[index] = !$scope.classList[index];
                $scope.btnInfo[index] = 'Inactive';
            }
            else {
                $scope.classList[index] = true;
                $scope.btnInfo[index] = 'Active'
            }
            if (_.indexOf($scope.inactivePropertyIds, property.propertyId) > -1) {
                _.remove($scope.inactivePropertyIds, function (propertyId) {

                    return property.propertyId == propertyId;
                })
            } else {
                $scope.inactivePropertyIds.push(property.propertyId);
            }

        }

        $scope.confirm = function () {
            $scope.isLoading = true;
            $scope.ItemFieldBatch = {};
            $scope.ItemFieldBatch.itemSpecIds = checkItemIds;

            if ($scope.submitName == "Update") {
                UpdateItemFieldPropety();
            }
            if ($scope.submitName == "Inactive") {
                InactiveItemFieldPropety();
            }
            if ($scope.submitName == "Add") {
                AddItemFieldPropety();
            }

        };

        function UpdateItemFieldPropety() {
            if ($scope.filterPropertys.length > 0) {
                var updateDatas = _.filter($scope.filterPropertys, function (item) {
                    return item.value;
                })
                $scope.ItemFieldBatch.updateItemFields = updateDatas;
                if (updateDatas.length > 0) {
                    itemFieldBatchUpdate($scope.ItemFieldBatch);
                } else {
                    $scope.errorLabel = 'You must fill one value  at least if  you want to update';
                    $scope.isShowError = true;
                    $scope.isLoading = false;
                }

            }
        }

        function AddItemFieldPropety() {
            if ($scope.propertyfields.length > 0) {
                var addItemFields = [];
                var validateTip = false;
                _.forEach($scope.propertyfields, function (item) {
                    var itemLine = {
                        "diverse": false,
                    }
                    if (item.hasOwnProperty('propertyId')) {
                        itemLine.propertyId = item.propertyId;
                        if (item.hasOwnProperty('value') && item.value) {
                            itemLine.value = item.value;
                        }
                        if (item.hasOwnProperty('unit')) {
                            itemLine.unit = item.unit;
                        }
                        addItemFields.push(itemLine);
                    }
                    else {
                        validateTip = true;
                    }

                });
                if (validateTip) {
                    $scope.errorLabel = 'Please select one property at least.';
                    $scope.isShowError = true;
                    $scope.isLoading = false;
                } else {
                    $scope.ItemFieldBatch.addItemFields = addItemFields;
                    itemFieldBatchUpdate($scope.ItemFieldBatch);
                }

            } else {
                $scope.errorLabel = 'Please add one property at least.';
                $scope.isShowError = true;
                $scope.isLoading = false;
            }
        }

        function InactiveItemFieldPropety() {
            if ($scope.inactivePropertyIds.length > 0) {
                $scope.ItemFieldBatch.inactivePropertyIds = $scope.inactivePropertyIds;
                itemFieldBatchUpdate($scope.ItemFieldBatch);
            }
            else {
                $scope.errorLabel = 'No property was selected to be inactive.';
                $scope.isShowError = true;
                $scope.isLoading = false;
            }
        }

        function itemFieldBatchUpdate(param, msg) {
            itemService.itemFieldBatchUpdate(param).then(function (response) {

                if (response.length > 0) {
                    var form = {
                        templateUrl: 'foundation-data/item/itemspec/template/popupBatchMessage.html',
                        locals: {
                            titleName: $scope.submitName,
                            checkItemIds: checkItemIds,
                            ItemSpecFieldIdMap: $scope.ItemSpecFieldIdMap,
                            updateSucessIds: response,
                            availablePropertiesMap: $scope.availablePropertiesMap,
                            specFieldMapItemName: $scope.specFieldMapItemName
                        },
                        autoWrap: true,
                        controller: popupBatchMessageController
                    };
                    $mdDialog.show(form).then(function (response) {

                    });
                } else {
                    lincUtil.messagePopup("Message", $scope.submitName + " Successful.");

                }



            }, function (error) {
                $scope.errorLabel = error.data.error;
                $scope.isShowError = true;
                $scope.isLoading = false;
            });
        }

        $scope.closeAlert = function () {
            $scope.isShowError = false;

        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        _init();

    };

    waitingConfirmController.$inject = ['$scope', '$state', '$mdDialog', 'itemService', 'lincUtil', 'checkItemIds', 'itemPropertyService', 'lincResourceFactory'];
    return waitingConfirmController;

});
