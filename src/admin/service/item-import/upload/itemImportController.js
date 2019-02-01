/**
 * Created by Giroux on 2016/11/2.
 */

'use strict';

define([
    'angular',
    'lodash',
    './importSuccessOrErrorController'
], function (angular, _, importSuccessOrErrorController) {
    var itemImportController = function ($scope, $http, lincUtil, itemService, itemPropertyService, $mdDialog) {
        $scope.importUploadFields = [];
        $scope.importUploadData = [];
        $scope.importUploadDataSimple = [];
        $scope.submitLabel = 'Submit';

        $scope.importMappingSearch = {};

        function clearData() {
            $scope.importUploadFields = [];
            $scope.importUploadData = [];
            $scope.importUploadDataSimple = [];

            if ($scope.activetab == "itemSpec") {
                itemspecExcelData = [];
                itemspecFields = [];
            }
        }

        var itemspecFields = [];

        function importDataRefresh(data) {
            if (data == null) data = [];
            $scope.importUploadData = data;

            $scope.importUploadFields = [];
            if ($scope.activetab == "itemSpec") {
                itemspecFields = [];
            }

            if (data.length == 0) return;
            _.forEach(data[0], function (val, filed) {
                if ($scope.activetab == "itemSpec") {
                    itemspecFields.push(filed);

                }
            })

            if ($scope.activetab == "itemSpec") {
                $scope.fieldMatch = {};
                $scope.itemUnitMatch = {};
                $scope.importUploadFields = itemspecFields;

                $scope.importMappingSearch.fields = $scope.importUploadFields;
                $scope.importMappingSearch.customerId = $scope.fieldDefaultVal['customerId'];


            }
        }

        var itemspecFieldMatch = {};
        $scope.fieldMatch = itemspecFieldMatch;
        $scope.dynamicFieldMatch = {};

        var itemspecFieldDefaultVal = {};
        var itemkittingFieldDefaultVal = {};
        $scope.fieldDefaultVal = itemspecFieldDefaultVal;
        $scope.unitFieldDefaultVal = {};

        $scope.activetab = "itemSpec";


        function excelFileValidate(element) {
            var fileName = element.value;
            var temp = fileName.toLowerCase().split(".");
            var fileType = temp[temp.length - 1];

            if (fileType != "xls" && fileType != "xlsx") {
                element.value = "";
                lincUtil.errorPopup("Please upload Excel file!");
                throw new Error("Please upload Excel file!");
            }
        }
      $scope.ImportSetting ={isImportMateria:false}
        $scope.changeImportMateria = function (isImportMateria) {
            $scope.ImportSetting.isImportMateria = isImportMateria;
            if(isImportMateria){
                $scope.fieldDefaultVal = {};
            }
        }

        $scope.isUploading = false;
        var itemspecExcelData = [];
        var itemkittingExcelData = [];

        $scope.excelDataFileChange = function (element) {

            if ($scope.isUploading) return;

            var data = new FormData();
            data.append("excelDataFile", element.files[0]);

            excelFileValidate(element);

            $scope.isUploading = true;
            $http.post("/fd-app/item-import/upload", data, {
                withCredentials: true,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity
            }).then(function (res) {
                // element.value = "";
                $scope.isUploading = false;
                if (res.data == null || res.data.jsonArray == null) {
                    lincUtil.errorPopup("No data of the file you uploaded!");
                } else {
                    if ($scope.activetab == "itemSpec") {
                        itemspecExcelData = res.data.jsonArray;
                        importDataRefresh(itemspecExcelData);
                    }
                    $scope.isShowDown = true;
                    apply();
                }
            }, function (error) {
                //element.value = "";
                $scope.isUploading = false;
                lincUtil.processErrorResponse(error);
            });

        };

        $scope.overwrite = false;
        $scope.checkOverwrite = function () {
            if ($scope.overwrite) $scope.overwrite = false;
            else $scope.overwrite = true;
        };

        $scope.searchDynamicProperties = function (param) {
            itemPropertyService.getProperties(param).then(function (data) {
                $scope.dynamicProperties = data.itemProperties;
            });
        };

        function setUnits(item) {
            var units = [];
            var count = 0;
            _.forEach($scope.itemUnits, function (itemUnitMatch, i) {

                var unit = null;
                _.forEach(itemUnitMatch, function (val, field) {
                    if (val) {
                        var fieldVal = item[field];
                        if ($scope.matchUnitLines[i]) {
                            _.forEach($scope.matchUnitLines[i][field], function (matchUnitLine) {
                                if (matchUnitLine.name === fieldVal && matchUnitLine.itemSpecValue) {
                                    fieldVal = matchUnitLine.itemSpecValue;
                                    return;
                                }
                            });
                        }
                        if (fieldVal == null || fieldVal.length == 0) {
                            return;
                        }

                        if (unit == null) unit = {};

                        unit[val] = fieldVal;
                    }

                });
                if (unit != null) {
                    if (itemUnitMatch['isBaseUOM']) {
                        unit['isBaseUnit'] = true;
                        count++;
                    }
                    if (count > 1) {
                        lincUtil.errorPopup("Only one base unit is supported. please check");
                        throw "Only one base unit is supported. please check";
                    }
                    units.push(unit);
                }
            });
            return units;
        }

        function setItemAKAs(item) {
            var akas = [];
            // $scope.isEmptyValue = false;
            _.forEach($scope.itemAKAs, function (itemAKAMatch, i) {
                var aka = null;
                var mulAkas = setMultipleAkaFromObject(itemAKAMatch);
                    _.forEach(mulAkas,function(akaItem){
                             aka = {};
                            _.forEach(akaItem, function (val, field) {
                            
                                if (val) {
                                    var fieldVal = item[field];
                                    if ($scope.matchAkaLines[i]) {
                                        _.forEach($scope.matchAkaLines[i][field], function (matchAkaLine) {
                                            if (matchAkaLine.name === fieldVal && matchAkaLine.itemSpecValue) {
                                                fieldVal = matchAkaLine.itemSpecValue;
                                                return;
                                            }
                                        });
                                    }
                                    if (fieldVal == null || fieldVal.length == 0) {
                                        return;
                                    }
                                    aka[val] = fieldVal;             
                                }
                            });
                            if (aka != null && (!_.isEmpty(aka['value']))) {
                                akas.push(aka);
                            }
                    });
            });

            return akas;
        }

        function setMultipleAkaFromObject(akaItem){
            var akaList =[];
            _.forEach(akaItem, function (val, key) {
                if(val==="tag" ){
                  var aka={};
                  aka[key] = val;
                  var splitKey = key.split(' ')[0].replace('AKA','');
                  _.forEach(akaItem, function (v, k){
                    if(k.indexOf(splitKey)>-1 && v != 'tag'){
                        aka[k] =v;
                    }
                  });
                  akaList.push(aka);
                }
            });
            return akaList;
        }

        function setLpConfigurations(item) {
            var lpConfigurations = [];
            var LPConfigImport = {};
            if (item["Cases_Per_Pallet"]) {
                LPConfigImport["total"] = item["Cases_Per_Pallet"];

            }
            if (item["Pallet_Hi"]) {
                LPConfigImport["tier"] = item["Pallet_Ti"];

            }
            if (item["Pallet_Ti"]) {
                LPConfigImport["height"] = item["Pallet_Hi"];

            }
            lpConfigurations.push(LPConfigImport);
            return lpConfigurations;

        }


        function integratedSubmitData() {
            var data = [];

            _.forEach($scope.importUploadData, function (item) {
                var newItem = null;
                var items = [];
                _.forEach($scope.fieldMatch, function (val, field) {
                    if (val) {
                        // if (val === 'dynamicField') {
                        //     if (newItem == null) newItem = {};
                        //     if (!newItem.fields) {
                        //         newItem.fields = [];
                        //     }
                        //     newItem.fields.push({
                        //         propertyId: $scope.dynamicFieldMatch[field],
                        //         value: item[field],
                        //         diverse: false,
                        //         key: false
                        //     });
                        //     return;
                        // }
                        var fieldVal = item[field];

                        _.forEach($scope.matchItemLines[field], function (matchItemLine) {
                            if (matchItemLine.name === fieldVal && matchItemLine.itemSpecValue) {

                                fieldVal = matchItemLine.itemSpecValue;
                            }
                        });

                        if (fieldVal == null || fieldVal.length == 0) {
                            return;
                        }
                        if (newItem == null) {
                            newItem = {
                                "hasSerialNumber": false,
                                "bundle": false,
                                "tags": ['Product']
                            }
                        }


                        if (val.indexOf(".") >= 0) {
                            addItems(items, val, fieldVal);
                            return;
                        }


                        if (fieldIsList(val)) {
                            if (newItem[val] == null) {
                                newItem[val] = [];
                            }
                            if (field === "labels") {
                                newItem[val] = _.flattenDeep(item[field].split(','));
                            } else {
                                if(field === 'tags' && fieldVal ){
                                    newItem[val] = [fieldVal];
                                }else{
                                    newItem[val].push(fieldVal);
                                }
                              
                            }

                        } else {
                            newItem[val] = fieldVal;
                        }
                    }
                });
                if (newItem == null) {
                    return;
                }
                if (items.length > 0) {
                    newItem.items = items;
                }
                _.forEach($scope.fieldDefaultVal, function (val, field) {
                    if (!newItem[field]) {
                        if (fieldIsNotNull(field) && (val == null || val.length == 0)) {
                            lincUtil.errorPopup(field + " is not to be null!");
                            return;
                        }
                        if (fieldIsList(field)) {
                            if (val.constructor == Array) {
                                newItem[field] = val;
                            } else {
                                newItem[field] = [];
                                newItem[field].push(val);
                            }
                        } else {
                            newItem[field] = val;
                        }
                    }
                });


                if ($scope.activetab == "itemSpec") {
                    var obj = {};
                    if (item["ActionCode_AU"] === "A") {
                        obj.actionCode = "Add";
                    }
                    if (item["ActionCode_AU"] === "U") {
                        obj.actionCode = "Update";
                    }
                    obj.itemSpec = newItem;
                    obj.itemSpec.fields = integratedDynamic(item);
                    obj.itemUnits = setUnits(item);
                    obj.itemAKAs = setItemAKAs(item);
                    obj.lpConfigurations = setLpConfigurations(item);

                    data.push(obj);
                } else if ($scope.activetab == "itemKitting") {
                    data.push(newItem);
                }
            });
            return data;
        }

        $scope.loading = false;
        $scope.submit = function () {
            getMapping();

        };

        function integratedDynamic(item) {
            var dynamicFieldList = [];
            _.forEach($scope.importUploadFields, function (field) {
                if (field.indexOf('Dyn') > -1) {
                    dynamicFieldList.push(field);
                }
            });
            var dynamicLists = [];

            _.forEach(dynamicFieldList, function (dynFeild) {
                if (!_.isEmpty(item[dynFeild]) && dynFeild.indexOf('PropertyName') > -1) {
                    var dynamicSource = {};
                    if (dynFeild.indexOf('DynTxtProperty') > -1) {
                        dynamicSource.type = 'Text';
                    }
                    if (dynFeild.indexOf('DynDateTimeProperty') > -1) {
                        dynamicSource.type = 'Date';
                    }
                    if (dynFeild.indexOf('DynNumberProperty') > -1) {
                        dynamicSource.type = 'Number';
                    }
                    dynamicSource.name = item[dynFeild];
                    dynamicSource.value = item[_.replace(dynFeild, 'Name', 'Value')];
                    dynamicLists.push(dynamicSource);
                }

            });

            return dynamicLists;
        }

        function autoSubmitData() {

            var data = integratedSubmitData();
            var post = {};
            post.isOverwrite = $scope.overwrite;

            if ($scope.activetab == "itemSpec") {
                post.itemSpecs = data;
            } else if ($scope.activetab == "itemKitting") {
                post.kittingItems = data;
            }
            $scope.loading = true;
            itemService.importItem(post).then(function (data) {

                $scope.loading = false;
                if (data.failItems != null && data.failItems.length > 0) {
                    $scope.dataInfo = data;
                    popupSubmitInfo();
                } else {
                    clearData();
                    lincUtil.saveSuccessfulPopup();
                }

                apply();
            }, function (error) {
                $scope.dataInfo = error.data;
                $scope.loading = false;
                lincUtil.processErrorResponse(error);

            })
        }

        $scope.importListFields = [];

        function fieldIsList(col) {
            var isList = false;
            _.forEach($scope.importListFields, function (item) {
                if (item.fieldName == col) {
                    isList = item.isList;
                }
            });
            return isList;
        }

        function fieldIsNotNull(col) {
            var isNotNull = false;
            _.forEach($scope.importNotNullFields, function (item) {
                if (item.fieldName == col) {
                    isNotNull = item.isNotNull;
                }
            });
            return isNotNull;
        }


        $scope.matchItemLines = {};
        $scope.matchUnitLines = {};
        $scope.matchAkaLines = {};

        function getMapping() {
            if (!$scope.importMappingSearch.fields) {
                lincUtil.errorPopup("Please upload the excel!");
                return;
            } else if (!$scope.importMappingSearch.customerId && !$scope.ImportSetting.isImportMateria) {
                lincUtil.errorPopup("Please select a customer!");
                return;
            }
            var newParam = {
                fields: $scope.importMappingSearch.fields
            }
            itemService.searchMappingItem(newParam).then(function (dataMappings) {
                if (dataMappings.length === 0) {
                    $scope.excelFields.itemSpec = [];
                    $scope.excelFields.itemUOM = [];
                    $scope.excelFields.itemAKA = [];
                    $scope.itemAKAs = [{}];
                    $scope.itemUnits = [{}];
                    lincUtil.errorPopup("Does not find any mapping template ,  please setup the mapping template at Item Import Setup page first.");
                    return;
                } else {
                    askCloneItemMappingIfNotExsit(dataMappings, function (data) {
                        $scope.fieldDefaultVal['customerId'] = $scope.importMappingSearch.customerId
                        $scope.excelFields.itemSpec = data.itemSpecFields;
                        $scope.excelFields.itemUOM = data.itemUnitFields;
                        $scope.excelFields.itemAKA = data.akaFields;

                        var itemSpecMappings = data.itemSpecMappings;
                        var itemUnitMappings = data.itemUnitMappings;
                        var akaMappings = data.akaMappings;

                        _.forEach(itemSpecMappings, function (itemSpecMapping) {
                            var templateField = itemSpecMapping.templateField;
                            $scope.fieldMatch[templateField] = itemSpecMapping.wiseField;

                            if (itemSpecMapping.propertyId)
                                $scope.dynamicFieldMatch[templateField] = itemSpecMapping.propertyId;

                            if (itemSpecMapping.valueMapping) {
                                $scope.matchItemLines[templateField] = [];
                                _.forEach(itemSpecMapping.valueMapping, function (val, field) {
                                    $scope.matchItemLines[templateField].push({
                                        "name": field,
                                        "itemSpecValue": val
                                    });
                                });
                            }
                        });

                        $scope.itemUnits = [];
                        $scope.matchUnitLines = {};
                        for (var i in itemUnitMappings) {
                            $scope.itemUnits.push({});
                            _.forEach(itemUnitMappings[i].entries, function (unitMappingEntry) {

                                var templateField = unitMappingEntry.templateField;
                                $scope.itemUnits[i][templateField] = unitMappingEntry.wiseField;
                                $scope.itemUnits[i]["isBaseUOM"] = unitMappingEntry.isBaseUOM;

                                if (unitMappingEntry.valueMapping) {
                                    $scope.matchUnitLines[i] ? $scope.matchUnitLines[i] : $scope.matchUnitLines[i] = {};
                                    $scope.matchUnitLines[i][templateField] = [];
                                    _.forEach(unitMappingEntry.valueMapping, function (val, field) {
                                        $scope.matchUnitLines[i][templateField].push({
                                            "name": field,
                                            "itemSpecValue": val
                                        });
                                    });
                                }

                            });
                        }

                        $scope.itemAKAs = [];
                        $scope.matchAkaLines = {};
                        for (var i in akaMappings) {
                            $scope.itemAKAs.push({});
                            _.forEach(akaMappings[i].entries, function (akaMappingEntry) {

                                var templateField = akaMappingEntry.templateField;
                                $scope.itemAKAs[i][templateField] = akaMappingEntry.wiseField;

                                if (akaMappingEntry.valueMapping) {
                                    $scope.matchAkaLines[i] ? $scope.matchAkaLines[i] : $scope.matchAkaLines[i] = {};
                                    $scope.matchAkaLines[i][templateField] = [];
                                    _.forEach(akaMappingEntry.valueMapping, function (val, field) {
                                        $scope.matchAkaLines[i][templateField].push({
                                            "name": field,
                                            "itemSpecValue": val
                                        });
                                    });
                                }

                            });
                        }

                        autoSubmitData();

                    });
                }


            }, function (error) {
                lincUtil.processErrorResponse(error);
            })

        }

        function askCloneItemMappingIfNotExsit(dataMappings, callback) {
            var data;
            var currentDateMapping = _.find(dataMappings, function (dataMapping) {
                return dataMapping.customerId === $scope.importMappingSearch.customerId;
            });
            var commomDateMapping = _.find(dataMappings, function (dataMapping) {
                return !dataMapping.customerId;
            });
            if (currentDateMapping) {
                data = currentDateMapping;
                callback(data);
            } else if (commomDateMapping) {
                data = commomDateMapping;
                callback(data);
            } else {
                lincUtil.confirmPopupPromise("Comfirm Message", "Can not find a mapping for this customer and field set. But there is  a mapping has the same field set from other customer , do you want to use this mapping ?").then(function () {
                    data = dataMappings[0];
                    callback(data);
                }, function () {

                });
            }
        }


        function popupSubmitInfo() {
            var form = {
                templateUrl: 'admin/service/item-import/config/template/importSuccessOrError.html',
                locals: {
                    Items: $scope.dataInfo
                },
                autoWrap: true,
                controller: importSuccessOrErrorController
            };

            $mdDialog.show(form).then(function (data) {});
        }

        $scope.isShowDown = true;
        $scope.showUpOrDown = function () {
            if ($scope.isShowDown) $scope.isShowDown = false;
            else $scope.isShowDown = true;
        };

        function apply() {
            if (!$scope.$$phase) {
                try {
                    $scope.$apply();
                } catch (e) {}
            }
        }
        var itemspecImportFields = [];
        var itemspecListFields = [];
        $scope.importFields = [];

        function getImportFields() {
            if ($scope.activetab == "itemSpec") {
                $scope.importFields = [{
                    "fieldName": "customerId"
                }, {
                    "fieldName": "groupId"
                }, {
                    "fieldName": "titleIds"
                }, {
                    "fieldName": "supplierIds"
                }, {
                    "fieldName": "brandId"
                }]; //获取Item Spec Field条目的值
                $scope.importListFields = itemspecListFields;
            }
        }



        $scope.onSelectCustomer = function (customerId) {
            if (customerId && $scope.importUploadFields.length > 0) {
                $scope.fieldDefaultVal['customerId'] = customerId;
                $scope.importMappingSearch.customerId = $scope.fieldDefaultVal['customerId'];
                $scope.importMappingSearch.fields = $scope.importUploadFields;
                // getMapping($scope.importMappingSearch);
            }
            $scope.customerId = customerId;
            $scope.searchAvailableGroups();

        };

        $scope.searchAvailableGroups = function (searchText) {
            if (!$scope.customerId) {
                $scope.availableGroups = [];
                return;
            }
            var searchParam = {};
            if (searchText) {
                searchParam.name = searchText;
            }
            if ($scope.customerId) {
                searchParam.customerId = $scope.customerId;
            }
            itemPropertyService.getItemGroups(searchParam).then(function (groups) {
                delete $scope.fieldDefaultVal["groupId"];
                $scope.availableGroups = groups;
            }, function () {});
        };
        /* jerry*/
        var dynamicField = {
            fieldName: "dynamicField",
            isNotNull: false,
            isList: false
        };

        function init() {
            itemService.getImportFields().then(function (data) {
                if (data == null || data.itemSpecFields == null || data.itemKittingFields == null || data.itemUnitFields == null || data.itemAKAFields == null) {
                    lincUtil.errorPopup("Get item fields fail!");
                    return;
                }

                itemspecImportFields = data.itemSpecFields;
                _.forEach(itemspecImportFields, function (item) {
                    if (item.isList) {
                        itemspecListFields.push(item);
                    }

                });

                itemspecImportFields.push(angular.copy(dynamicField));
                getImportFields();
                apply();

            }, function (error) {
                lincUtil.errorPopup("Get item fields fail!");
            });
            $scope.searchDynamicProperties({});


            initItemUnits();

            initExcelFields();
            initItemAKA();
        }

        function initExcelFields() {
            $scope.excelFields = {};
            $scope.excelFields.itemSpec = [];
            $scope.excelFields.itemUOM = [];
            $scope.excelFields.itemAKA = [];
        }

        function initItemUnits() {
            $scope.itemUnits = [{}];
        }

        function initItemAKA() {
            $scope.itemAKAs = [{}];
        }

        init();

    };
    itemImportController.$inject = ['$scope', '$http', 'lincUtil', 'itemService', 'itemPropertyService', '$mdDialog', ];
    return itemImportController;

});