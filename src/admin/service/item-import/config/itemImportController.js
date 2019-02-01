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
        $scope.pageSize = 10;
        $scope.pageRecordSize = 10;
        $scope.submitLabel = 'Submit';
        $scope.submitMappingLabel = 'Save Mapping';
        $scope.importMappingSearch = {
            isCommonMapping: false
        };
        $scope.data = {
            kittingItemsIsOverWrite: false
        };

        var itemImportSpec = [];
        var itemImportUOM = [];
        var itemImportAKA = [];

        var itemKittingSpec = [];
        var itemKittingUOM = [];
        var itemKittingtAKA = [];

        $scope.enumAdapterTable = {
            "allowOverWriteItem": ['true', 'false'],
            "hasSerialNumber": ['true', 'false'],
            "validationInboundSerialNo": ['true', 'false'],
            "serialNoScanLotNoCheck": ['true', 'false'],
            "validationOutboundSerialNo": ['true', 'false'],
            "validatedOutboundSerialNoAgainstInbound": ['true', 'false'],
            "bundle": ['true', 'false'],
            "isHazardousMaterial": ['true', 'false'],
            "requireCollectLotNoOnReceive": ['true', 'false'],
            "status": ['Inactive', 'Discontinue', 'Active'],
            "channel": ['Android', 'EDI'],
            "tags": ['Customer', 'Material', 'Packaging'],
            "tag": ['Retailer', 'Customer', 'Supplier', 'Brand'],
            "isDefaultUnit": ['true', 'false'],
            "isBaseUnit": ['true', 'false'],
            "linearUnit": ['CM', 'INCH', 'M'],
            "weightUnit": ['G', 'KG', 'Pound'],
            "priceUnit": ['CNY', 'USD', 'EUR'],
            "volumeUnit": ['cu in', 'cu ft', 'cbm'],
            "itemCodeTag": ['Customer', 'Retailer', 'Supplier', 'Brand', 'UPC'],
            "allowOverWriteByImport": ['true', 'false']
        }

        function clearData() {
            $scope.importUploadFields = [];
            $scope.importUploadData = [];
            $scope.importUploadDataSimple = [];

            if ($scope.activetab == "itemSpec") {
                itemspecExcelData = [];
                itemspecFields = [];
            } else if ($scope.activetab == "itemKitting") {
                itemkittingExcelData = [];
                itemkittingFields = [];
            }
        }

        var itemspecFields = [];
        var itemkittingFields = [];


        function importDataRefresh(data) {
            if (data == null) data = [];
            $scope.importUploadData = data;
            $scope.loadContent(1);

            $scope.importUploadFields = [];
            if ($scope.activetab == "itemSpec") {
                itemspecFields = [];
            } else if ($scope.activetab == "itemKitting") {
                itemkittingFields = [];
            }

            if (data.length == 0) return;
            _.forEach(data[0], function (val, filed) {
                if ($scope.activetab == "itemSpec") {
                    itemspecFields.push(filed);

                } else if ($scope.activetab == "itemKitting") {
                    itemkittingFields.push(filed);
                }
            })
            getImportFields();
            if ($scope.activetab == "itemSpec") {
                $scope.fieldMatch = {};

                $scope.importUploadFields = itemspecFields;

                // if ($scope.importMappingSearch.customerId) {
                // $scope.fieldDefaultVal['customerId'] = $scope.importMappingSearch.customerId;
                $scope.importMappingSearch.fields = $scope.importUploadFields;
                getItemImportMapping($scope.importMappingSearch);

                // }

            } else if ($scope.activetab == "itemKitting") {
                $scope.fieldMatch = {};
                $scope.importUploadFields = itemkittingFields;

            }
        }

        $scope.isFieldBoolean = function (col) {
            if (col == 'hasSerialNumber') return true;
            if (col == 'valiationInboundSerialNo') return true;
            if (col == 'serialNoScanLotNoCheck') return true;
            if (col == 'validationOutboundSerialNo') return true;
            if (col == 'validatedOutboundSerialNoAgainstInbound') return true;
            if (col == 'bundle') return true;

            if (col == 'isDefaultUnit') return true;
            if (col == 'isBaseUnit') return true;

            return false;
        };

        $scope.isItemFieldInput = function (col) {
            if (col == "titleIds") return false;
            if (col == "customerId") return false;
            if (col == "supplierIds") return false;
            if (col == "status") return false;
            if (col == "channel") return false;
            if (col == "groupId") return false;
            if (col == "brandId") return false;
            if (col == "tags") return false;
            if ($scope.isFieldBoolean(col)) return false;

            return true;
        };

        $scope.isUnitFieldInput = function (col) {
            if (col == 'linearUnit') return false;
            if (col == 'weightUnit') return false;
            if (col == 'channel') return false;
            if (col == "status") return false;
            if (col == 'priceUnit') return false;
            if (col == 'itemCodeTag') return false;
            if (col == 'itemCodeOrganization') return false;
            if ($scope.isFieldBoolean(col)) return false;

            return true;
        };

        $scope.itemCodeTagChange = function () {
            $scope.unitFieldDefaultVal.itemCodeOrganization = null;
        };

        var currentPgno;
        $scope.loadContent = function (pageNo) {
            if (pageNo == null) pageNo = 1;
            currentPgno = pageNo;
            var total = $scope.importUploadData.length;
            $scope.importUploadDataSimple = $scope.importUploadData.slice((pageNo - 1) * $scope.pageSize,
                pageNo * $scope.pageSize > total ? total : pageNo * $scope.pageSize);
        };

        $scope.deleteItem = function (index) {
            index = (currentPgno - 1) * $scope.pageSize + index;
            $scope.importUploadData.splice(index, 1);

            $scope.loadContent(currentPgno);
        };

        $scope.removeField = function (index, colArray, mapping) {
            lincUtil.deleteConfirmPopup("Are you sure to remove this field?", function () {
                var col = colArray[index];
                colArray.splice(index, 1);
                delete mapping[col];


                var itemUomFields = $scope.excelFields.itemUOM;
                var itemAkaFields = $scope.excelFields.itemAKA;

                if (itemAkaFields.length == 0) {
                    $scope.itemAKAs = [{}];
                } else {
                    _.forEach($scope.itemAKAs, function (itemAka) {
                        _.forEach(itemAka, function (value, field) {
                            if (_.indexOf(itemUomFields, field) == -1) {
                                delete $scope.itemAKAs.field;
                            }
                        })
                    });
                }
                if (itemUomFields.length == 0) {
                    $scope.itemUnits = [{}];
                } else {
                    _.forEach($scope.itemUnits, function (itemUnit) {
                        _.forEach(itemUnit, function (value, field) {
                            if (_.indexOf(itemAkaFields, field) == -1) {
                                delete $scope.itemUnits.field;
                            }
                        })
                    });

                }

            });
        };

        var itemspecFieldMatch = {};
        var itemkittingFieldMatch = {};
        $scope.fieldMatch = itemspecFieldMatch;
        $scope.dynamicFieldMatch = {};

        var itemspecFieldDefaultVal = {};
        var itemkittingFieldDefaultVal = {};
        $scope.fieldDefaultVal = itemspecFieldDefaultVal;
        $scope.unitFieldDefaultVal = {};

        $scope.activetab = "itemSpec";

        $scope.changeTab = function (tabName) {
            if ($scope.isUploading) return;

            if ($scope.activetab == "itemSpec") {

                itemImportSpec = $scope.excelFields.itemSpec;
                itemImportUOM = $scope.excelFields.itemUOM;
                itemImportAKA = $scope.excelFields.itemAKA;

                itemspecExcelData = $scope.importUploadData;
                itemspecFields = $scope.importUploadFields;
                itemspecFieldMatch = $scope.fieldMatch;
                itemspecFieldDefaultVal = $scope.fieldDefaultVal;


            } else if ($scope.activetab == "itemKitting") {
                itemKittingSpec = $scope.excelFields.itemSpec;
                itemKittingUOM = $scope.excelFields.itemUOM;
                itemKittingtAKA = $scope.excelFields.itemAKA;

                itemkittingExcelData = $scope.importUploadData;
                itemkittingFields = $scope.importUploadFields;
                itemkittingFieldMatch = $scope.fieldMatch;
                itemkittingFieldDefaultVal = $scope.fieldDefaultVal;
            }

            $scope.activetab = tabName;
            getImportFields();

            if (tabName == "itemSpec") {

                $scope.excelFields.itemSpec = itemImportSpec;
                $scope.excelFields.itemUOM = itemImportUOM;
                $scope.excelFields.itemAKA = itemImportAKA;

                $scope.importUploadData = itemspecExcelData;
                $scope.importUploadFields = itemspecFields;
                $scope.fieldMatch = itemspecFieldMatch;
                $scope.fieldDefaultVal = itemspecFieldDefaultVal;

            } else if (tabName == "itemKitting") {

                $scope.excelFields.itemSpec = itemKittingSpec;
                $scope.excelFields.itemUOM = itemKittingUOM;
                $scope.excelFields.itemAKA = itemKittingtAKA;

                $scope.importUploadData = itemkittingExcelData;
                $scope.importUploadFields = itemkittingFields;
                $scope.fieldMatch = itemkittingFieldMatch;
                $scope.fieldDefaultVal = itemkittingFieldDefaultVal;
            }

            if (tabName != "importRecord") {
                $scope.loadContent(1);
            }
        }

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

        $scope.isUploading = false;
        var itemspecExcelData = [];
        var itemkittingExcelData = [];

        $scope.excelDataFileChange = function (element) {
            if ($scope.isUploading) return;

            if (!$scope.importMappingSearch.isCommonMapping && $scope.activetab == "itemSpec" && !$scope.importMappingSearch.customerId) {
                lincUtil.errorPopup("Please select customer first!");
                element.value = "";
                return;
            }

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
                element.value = "";
                $scope.isUploading = false;
                if (res.data == null || res.data.jsonArray == null) {
                    lincUtil.errorPopup("No data of the file you uploaded!");
                } else {
                    $scope.matchItemLines = {};
                    $scope.mapUnitValue = {};
                    $scope.mapAkaValue = {};
                    if ($scope.activetab == "itemSpec") {
                        itemspecExcelData = res.data.jsonArray;
                        importDataRefresh(itemspecExcelData);
                    } else if ($scope.activetab == "itemKitting") {
                        itemkittingExcelData = res.data.jsonArray;
                        importDataRefresh(itemkittingExcelData);
                        $scope.onSelectMappingCustomer($scope.importMappingSearch.customerId);
                    }
                    $scope.isShowDown = true;
                }

                apply();

            }, function (error) {
                element.value = "";
                $scope.isUploading = false;
                lincUtil.errorPopup(error);
            });

        };

        $scope.itemSpecFieldsEnums = {};
        $scope.fieldMatchOnSelect = function (col, sel) {

            _.forEach($scope.matchItemLines[col], function (item) {
                delete item.itemSpecValue;
            });

            if (!sel) {
                $scope.itemSpecFieldsEnums[col] = [];

            } else {
                if (sel.isList) return;
                if (sel.fieldName) {
                    $scope.itemSpecFieldsEnums[col] = $scope.enumAdapterTable[sel.fieldName];
                }
                _.forEach($scope.fieldMatch, function (val, field) {
                    if (col != field && sel.fieldName == val) {

                        $scope.fieldMatch[col] = null;
                        $scope.itemSpecFieldsEnums[col] = [];
                        lincUtil.errorPopup("The field had been choosed, please check.");

                    }
                })
            }
            if ($scope.matchItemLines && $scope.matchItemLines[col]) {
                _.forEach($scope.matchItemLines[col], function (item) {
                    item.itemSpecValue = null;
                })
            }
        }

        $scope.itemUnitAndCodeFieldsEnums = {};
        $scope.fieldUnitMatchOnSelect = function (col, sel, index) {


            if (!sel) {
                $scope.itemUnitAndCodeFieldsEnums[col] = [];

            } else {
                if (sel.isList) return;
                if (sel.fieldName) {
                    $scope.itemUnitAndCodeFieldsEnums[col] = $scope.enumAdapterTable[sel.fieldName];
                }
                _.forEach($scope.itemUnits[index], function (val, field) {
                    if (col != field && sel.fieldName == val) {
                        $scope.itemUnits[index][col] = null;
                        $scope.itemUnitAndCodeFieldsEnums[col] = [];
                        lincUtil.errorPopup("The field had been choosed, please check.");

                    }
                });
            }
            if ($scope.matchUnitLines[index] && $scope.matchUnitLines[index][col]) {
                _.forEach($scope.matchUnitLines[index][col], function (item) {
                    item.itemSpecValue = null;
                })
            }
        }

        $scope.itemAkaFieldsEnums = {};
        $scope.fieldAKAMatchOnSelect = function (col, sel, akaIndex) {
            if (!sel) {
                $scope.itemAkaFieldsEnums[col] = [];

            } else {
                if (sel.isList) return;
                if (sel.fieldName) {
                    $scope.itemAkaFieldsEnums[col] = $scope.enumAdapterTable[sel.fieldName];
                }
                // _.forEach($scope.itemAKAs[akaIndex], function (val, field) {
                //     if (col != field && sel.fieldName == val) {
                //         $scope.itemAKAs[akaIndex][col] = null;
                //         $scope.itemAkaFieldsEnums[col] = [];
                //         lincUtil.errorPopup("The field had been choosed, please check.");

                //     }
                // });
            }
            if ($scope.matchAkaLines[akaIndex] && $scope.matchAkaLines[akaIndex][col]) {
                _.forEach($scope.matchAkaLines[akaIndex][col], function (item) {
                    item.itemSpecValue = null;
                })
            }
        }

        function addItems(items, field, val) {
            var temp = field.split(".");
            var pfield = temp[1];
            var isFind = false;
            _.forEach(items, function (item) {
                if (item[pfield] == null) {
                    item[pfield] = val;
                    isFind = true;
                    return;
                }
            })
            if (!isFind) {
                var item = {};
                item[pfield] = val;
                items.push(item);
            }
        }

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

            _.forEach($scope.itemAKAs, function (itemAKAMatch, i) {
                var aka = null;
                _.forEach(itemAKAMatch, function (val, field) {
                    if (val) {
                        var fieldVal = item[field];
                        if ($scope.matchAkaLines[i]) {
                            _.forEach($scope.matchAkaLines[i][field], function (matchAkaLine) {
                                if (matchAkaLine.name === fieldVal && matchUnitLine.itemSpecValue) {
                                    fieldVal = matchAkaLine.itemSpecValue;
                                    return;
                                }
                            });
                        }
                        if (fieldVal == null || fieldVal.length == 0) {
                            return;
                        }
                        if (!aka) {
                            aka = {}
                        };

                        aka[val] = fieldVal;
                    }
                });

                if (aka != null && (!_.isEmpty(aka['value']))) {
                    akas.push(aka);
                }
            });

            return akas;
        }

        function setLpConfigurations(item) {
            var lpConfigurations = [];
            var LPConfigImport = {};
            if (item["Cases_Per_Pallet"]) {
                LPConfigImport["total"] = item["Cases_Per_Pallet"];

            }
            if (item["Pallet_Ti"]) {
                LPConfigImport["tier"] = item["Pallet_Ti"];

            }
            if (item["Pallet_Hi"]) {
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

                        var fieldVal = item[field];

                        _.forEach($scope.matchItemLines[field], function (matchItemLine) {
                            if (matchItemLine.name === fieldVal && matchItemLine.itemSpecValue) {
                                fieldVal = matchItemLine.itemSpecValue;
                            }
                        });

                        if (fieldVal == null || fieldVal.length == 0) {
                            return;
                        }
                        if (newItem == null && $scope.activetab == "itemSpec") {
                            newItem = {
                                "hasSerialNumber": false,
                                "bundle": false,
                                "tags": ['Product']
                            }
                        }
                        if (newItem == null && $scope.activetab == "itemKitting") {
                            newItem = {}
                        }

                        if (val.indexOf(".") >= 0) {
                            addItems(items, val, fieldVal);
                            return;
                        }

                        if (fieldIsList(val)) {
                            fieldVal = fieldVal.split(",");
                            if (newItem[val] == null) {
                                newItem[val] = [];
                            }
                            if (field === "labels") {
                                newItem[val] = _.flattenDeep(item[field].split(','));
                            } else {
                                newItem[val] = _.union(newItem[val], fieldVal);
                            }

                        } else {
                            newItem[val] = fieldVal;
                        }
                    }
                });

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
            if ($scope.isUploading) return;
            var isMatch = false;
            _.forEach($scope.fieldMatch, function (val, field) {
                if (val) {
                    isMatch = true;
                    return;
                }

            });

            if (!isMatch) {
                lincUtil.errorPopup("Please match excel file field with DB field first!");
                return;
            }

            var data = integratedSubmitData();

            var post = {};


            if ($scope.activetab == "itemSpec") {
                post.itemSpecs = data;
            } else if ($scope.activetab == "itemKitting") {
                post.kittingItems = data;
                post.isOverwrite = $scope.data.kittingItemsIsOverWrite;
            }
            $scope.loading = true;
            itemService.importItem(post).then(function (data) {

                $scope.loading = false;
                if (data.failItems != null && data.failItems.length > 0) {
                    // lincUtil.errorPopup(data.failItems.length + " item import failed!");

                    // var colName;
                    // _.forEach($scope.fieldMatch, function (val, field) {
                    //     if (val == "name") {
                    //         colName = field;
                    //         return;
                    //     }
                    // });

                    // var failData = [];
                    // _.forEach(data.failItems, function (item) {

                    //     var obj = _.find($scope.importUploadData, function (uploadData) {
                    //         return uploadData[colName] == item;
                    //     });
                    //     failData.push(obj);
                    // });
                    // $scope.importUploadData = failData;
                    $scope.dataInfo = data;
                    popupSubmitInfo();
                } else {
                    clearData();
                    lincUtil.saveSuccessfulPopup();
                }

                apply();
            }, function (error) {
                $scope.loading = false;
                if (error.data && error.data.failItems) {
                    $scope.dataInfo = error.data;
                    popupSubmitInfo();
                } else {
                    lincUtil.errorPopup(error);
                }
            })
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

        /* jerry mapping begin*/

        $scope.onSelectMappingCustomer = function (customerId) {
            if ($scope.importUploadFields.length > 0) {
                $scope.fieldDefaultVal['customerId'] = customerId;
                $scope.importMappingSearch.fields = $scope.importUploadFields;
                getItemImportMapping($scope.importMappingSearch);

            }
        };

        $scope.changeCommonMapping = function (isCommonMapping) {
            if (isCommonMapping && $scope.importMappingSearch.customerId) {
                $scope.importMappingSearch.customerId = null;
            }
        }

        $scope.selectItemUOMChange = function (select) {
            if (select.length == 0) {
                $scope.itemUnits = [{}];
            } else {
                _.forEach($scope.itemUnits, function (itemUnit) {
                    _.forEach(itemUnit, function (value, field) {
                        if (_.indexOf(select, field) == -1) {
                            delete $scope.itemUnits.field;
                        }
                    })
                });

            }
        };

        $scope.selectItemAkaChange = function (select) {
            if (select.length == 0) {
                $scope.itemAKAs = [{}];
            } else {
                _.forEach($scope.itemAKAs, function (itemAka) {
                    _.forEach(itemAka, function (value, field) {
                        if (_.indexOf(select, field) == -1) {
                            delete $scope.itemAKAs.field;
                        }
                    })
                });
            }
        };

        /* mapping item spec field   */
        $scope.matchItemLines = {};
        $scope.mapValue = {};
        $scope.checkMapValue = function (excelField) {
            if ($scope.mapValue[excelField]) {
                $scope.mapValue[excelField] = !$scope.mapValue[excelField];
                delete $scope.matchItemLines[excelField];
            } else {
                $scope.mapValue[excelField] = true;
                $scope.importDataLists = _.without(_.uniq(_.map($scope.importUploadData, excelField)) == "" ? [] : _.uniq(_.map($scope.importUploadData, excelField)), '');

                if ($scope.importDataLists.length > 0) {
                    $scope.matchItemLines[excelField] = [];
                    _.forEach($scope.importDataLists, function (item) {
                        $scope.matchItemLines[excelField].push({
                            "name": item
                        });
                    })

                }


            }

        }

        /* mapping item Unit field   */
        $scope.mapUnitValue = {};
        $scope.matchUnitLines = {};
        $scope.checkUnitMapValue = function (excelField, parentIndex) {

            var keyName = excelField + parentIndex;
            if ($scope.mapUnitValue[keyName]) {
                $scope.mapUnitValue[keyName] = !$scope.mapUnitValue[keyName];
                delete $scope.matchUnitLines[parentIndex][excelField];
            } else {
                $scope.mapUnitValue[keyName] = true;

                $scope.importDataLists = _.without(_.uniq(_.map($scope.importUploadData, excelField)) == "" ? [] : _.uniq(_.map($scope.importUploadData, excelField)), '');

                if ($scope.importDataLists.length > 0) {

                    $scope.matchUnitLines[parentIndex] ? $scope.matchUnitLines[parentIndex] : $scope.matchUnitLines[parentIndex] = {};
                    $scope.matchUnitLines[parentIndex][excelField] = []
                    _.forEach($scope.importDataLists, function (item) {
                        $scope.matchUnitLines[parentIndex][excelField].push({
                            "name": item
                        });
                    })

                }


            }

        }

        /* mapping item Aka field   */
        $scope.mapAkaValue = {};
        $scope.matchAkaLines = {};
        $scope.checkAkaMapValue = function (excelField, parentIndex) {

            var keyName = excelField + parentIndex;
            if ($scope.mapAkaValue[keyName]) {
                $scope.mapAkaValue[keyName] = !$scope.mapAkaValue[keyName];
                delete $scope.matchAkaLines[parentIndex][excelField];
            } else {
                $scope.mapAkaValue[keyName] = true;

                $scope.importDataLists = _.without(_.uniq(_.map($scope.importUploadData, excelField)) == "" ? [] : _.uniq(_.map($scope.importUploadData, excelField)), '');

                if ($scope.importDataLists.length > 0) {

                    $scope.matchAkaLines[parentIndex] ? $scope.matchAkaLines[parentIndex] : $scope.matchAkaLines[parentIndex] = {};
                    $scope.matchAkaLines[parentIndex][excelField] = []
                    _.forEach($scope.importDataLists, function (item) {
                        $scope.matchAkaLines[parentIndex][excelField].push({
                            "name": item
                        });
                    })

                }
            }

        }

        $scope.removeItemSpecMappingValue = function (col, index) {
            $scope.matchItemLines[col].splice(index, 1);
        }

        $scope.addItemSpecMappingValue = function (col) {
            $scope.matchItemLines[col].push({});
        };

        $scope.removeUnitMappingValue = function (currentUom, index) {
            currentUom.splice(index, 1);
        };

        $scope.addUnitMappingValue = function (currentUom) {
            currentUom.push({});
        };

        $scope.removeAkaMappingValue = function (currentAka, index) {
            currentAka.splice(index, 1);
        };

        $scope.addAkaMappingValue = function (currentAka) {
            currentAka.push({});
        };

        $scope.submitMapping = function () {

            if (validateMapping()) {
                saveMapping();
            }

        };

        function validateMapping() {

            var isUnitOrSpecMatch = false;
            var isMatchValue = false;
            var isMatchDynamicValue = false;
            if (!$scope.importMappingSearch.isCommonMapping && $scope.activetab == "itemSpec" && !$scope.importMappingSearch.customerId) {
                lincUtil.errorPopup("Please select customer first!");
                return false;
            }
            if ($scope.activetab == "itemKitting" && !$scope.importMappingSearch.customerId) {
                lincUtil.errorPopup("Please select customer first!");
                return false;
            }
            _.forEach($scope.fieldMatch, function (val, field) {
                if (val) {
                    isUnitOrSpecMatch = true;
                }
                if (val === "dynamicField") {
                    if (!$scope.dynamicFieldMatch[field]) {
                        isMatchDynamicValue = true;
                    }
                }
            });


            _.forEach($scope.matchItemLines, function (lists, field) {
                _.map(lists, function (item) {
                    if ((!item.hasOwnProperty('itemSpecValue')) && (!item.hasOwnProperty('itemUnitValue'))) {
                        isMatchValue = true;
                    }
                });
            });

            if (!isUnitOrSpecMatch) {
                lincUtil.errorPopup("Please select an item spec field to match the execl field!");
                return false;
            }
            if (isMatchDynamicValue) {
                lincUtil.errorPopup("Please select product for each ‘dynamicFiled’ !");
                return false;
            }
            if (isMatchValue) {
                lincUtil.errorPopup("Please select a mapping value for each Excel field value!");
                return false;
            }
            return true;
        }

        function saveMapping() {
            var ImportMapping = integratedAllMappingData();

            $scope.mapLoading = true;
            if ($scope.activetab == 'itemSpec') {
                itemService.addMappingItem(ImportMapping).then(function (response) {

                    $scope.mapLoading = false;
                    lincUtil.saveSuccessfulPopup();
                }, function (error) {
                    $scope.mapLoading = false;
                    lincUtil.processErrorResponse(error);
                });

            } else if ($scope.activetab == 'itemKitting') {
                itemService.addMappingKitting(ImportMapping).then(function (response) {

                    $scope.mapLoading = false;
                    lincUtil.saveSuccessfulPopup();
                }, function (error) {
                    $scope.mapLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            }


        }

        function integratedItemUnitOrAkaMappings(dataFields, itemAkaOrUnit) {
            var itemUnitMappings = [];

            for (var i in itemAkaOrUnit) {
                var UnitMapping = {}
                UnitMapping.entries = [];
                _.forEach(itemAkaOrUnit[i], function (val, field) {
                    if (field == 'isBaseUOM') return;
                    if (!dataFields[i]) {
                        if (field && val) {
                            var UnitMappingEntry = {
                                "hasValueMapping": false,
                                "isBaseUOM": itemAkaOrUnit[i].isBaseUOM ? true : false,
                                "templateField": field,
                                "wiseField": val
                            };
                            UnitMapping.entries.push(UnitMappingEntry);
                        }

                    } else {
                        if (!dataFields[i][field]) {
                            if (field && val) {
                                var UnitMappingEntry = {
                                    "hasValueMapping": false,
                                    "isBaseUOM": itemAkaOrUnit[i].isBaseUOM ? true : false,
                                    "templateField": field,
                                    "wiseField": val
                                };
                                UnitMapping.entries.push(UnitMappingEntry);
                            }

                        } else {

                        }
                    }
                });
                if (dataFields[i]) {
                    _.forEach(dataFields[i], function (arrval, field) {
                        var valueMappingLists = {};
                        var valueMapping = {};
                        var isHasSpecMap = false;
                        _.forEach(arrval, function (item) {
                            if (item.itemSpecValue) {
                                isHasSpecMap = true;
                                valueMapping[item.name] = item.itemSpecValue;
                            }
                        });
                        if (!isHasSpecMap && itemAkaOrUnit[i][field]) {
                            valueMappingLists['templateField'] = field;
                            valueMappingLists["hasValueMapping"] = true;
                            valueMappingLists["isBaseUOM"] = itemAkaOrUnit[i].isBaseUOM ? true : false;
                            valueMappingLists["wiseField"] = itemAkaOrUnit[i][field];
                            UnitMapping.entries.push(valueMappingLists);
                        }
                        if (isHasSpecMap && itemAkaOrUnit[i][field]) {
                            valueMappingLists['templateField'] = field;
                            valueMappingLists["hasValueMapping"] = true;
                            valueMappingLists["isBaseUOM"] = itemAkaOrUnit[i].isBaseUOM ? true : false;
                            valueMappingLists["wiseField"] = itemAkaOrUnit[i][field];
                            valueMappingLists["valueMapping"] = valueMapping;
                            UnitMapping.entries.push(valueMappingLists);
                        }

                    });
                }

                itemUnitMappings.push(UnitMapping);

            }
            return itemUnitMappings;
        }

        function integratedItemSpecMappings(dataFields) {
            var itemSpecMappings = [];
            _.forEach($scope.fieldMatch, function (val, field) {

                if (!dataFields[field] && val) {
                    var itemSpecMapping = {
                        "hasValueMapping": false,
                        "propertyId": $scope.dynamicFieldMatch[field] ? $scope.dynamicFieldMatch[field] : null,
                        "templateField": field,
                        "wiseField": val
                    };
                    itemSpecMappings.push(itemSpecMapping);
                }
            });
            _.forEach(dataFields, function (arrval, field) {

                var itemSpecMapping = {};

                var valueSpecMapping = {};

                var isHasSpecMap = false;
                if (arrval.length > 0) {
                    _.forEach(arrval, function (item) {
                        if (item.itemSpecValue) {
                            isHasSpecMap = true;
                            valueSpecMapping[item.name] = item.itemSpecValue;
                        }
                    });

                    if (isHasSpecMap) {
                        itemSpecMapping['templateField'] = field;
                        itemSpecMapping["hasValueMapping"] = true;
                        itemSpecMapping["wiseField"] = $scope.fieldMatch[field];
                        itemSpecMapping["valueMapping"] = valueSpecMapping;
                        itemSpecMappings.push(itemSpecMapping);
                    }

                } else {
                    if ($scope.fieldMatch[field]) {
                        itemSpecMapping = {
                            "hasValueMapping": false,
                            "propertyId": $scope.dynamicFieldMatch[field] ? $scope.dynamicFieldMatch[field] : null,
                            "templateField": field,
                            "wiseField": $scope.fieldMatch[field]
                        };
                        itemSpecMappings.push(itemSpecMapping);
                    }

                }


            });
            return itemSpecMappings;

        }

        function integratedAllMappingData() {
            var ImportMapping = {}
            var itemSpecMappings = integratedItemSpecMappings($scope.matchItemLines);
            var itemUnitMappings = integratedItemUnitOrAkaMappings($scope.matchUnitLines, $scope.itemUnits);
            var akaMappings = integratedItemUnitOrAkaMappings($scope.matchAkaLines, $scope.itemAKAs);
            ImportMapping['fields'] = $scope.importUploadFields;

            ImportMapping['itemSpecFields'] = $scope.excelFields.itemSpec;
            ImportMapping['itemUnitFields'] = $scope.excelFields.itemUOM;
            ImportMapping['akaFields'] = $scope.excelFields.itemAKA;

            ImportMapping['itemSpecMappings'] = itemSpecMappings;
            ImportMapping['itemUnitMappings'] = itemUnitMappings;
            ImportMapping['akaMappings'] = akaMappings;
            ImportMapping['customerId'] = $scope.importMappingSearch.customerId;
            return ImportMapping;
        }

        function getItemImportMapping(param) {

            $scope.mapValue = {};
            $scope.mapUnitValue = {};
            $scope.mapAkaValue = {};

            if ($scope.activetab == 'itemSpec') {
                var newParam = {
                    fields: $scope.importMappingSearch.fields
                }

                itemService.searchMappingItem(newParam).then(function (dataMappings) {
                    if (dataMappings.length === 0) return;
                    askCloneItemMappingIfNotExsit(dataMappings, function (data) {

                        // $scope.fieldDefaultVal['customerId'] = $scope.importMappingSearch.customerId;
                        $scope.excelFields.itemSpec = data.itemSpecFields;
                        $scope.excelFields.itemUOM = data.itemUnitFields;
                        $scope.excelFields.itemAKA = data.akaFields;

                        itemImportSpec = data.itemSpecFields;
                        itemImportUOM = data.itemUnitFields;
                        itemImportAKA = data.akaFields;

                        var itemSpecMappings = data.itemSpecMappings;
                        var itemUnitMappings = data.itemUnitMappings;
                        var akaMappings = data.akaMappings;

                        setItemSpecFromMapping(itemSpecMappings);
                        setItemUomFromMapping(itemUnitMappings);
                        setItemAkaFromMapping(akaMappings);

                        apply();
                    });


                }, function (error) {
                    lincUtil.processErrorResponse(error);
                })
            } else if ($scope.activetab == 'itemKitting') {

                var newParam = {
                    fields: $scope.importMappingSearch.fields
                }
                itemService.searchMappingKitting(newParam).then(function (dataMappings) {
                    if (dataMappings.length === 0) return;
                    askCloneItemMappingIfNotExsit(dataMappings, function (data) {
                        if ($scope.importMappingSearch.customerId) {
                            $scope.fieldDefaultVal['customerId'] = $scope.importMappingSearch.customerId;
                        }
                        $scope.excelFields.itemSpec = data.itemSpecFields;
                        itemImportSpec = data.itemSpecFields;
                        var itemSpecMappings = data.itemSpecMappings;

                        setItemSpecFromMapping(itemSpecMappings);

                        apply();
                    })


                }, function (error) {
                    lincUtil.processErrorResponse(error);
                })
            }
        }

        function askCloneItemMappingIfNotExsit(dataMappings, callback) {
            var data;
            var currentDateMapping = _.find(dataMappings, function (dataMapping) {
                return dataMapping.customerId === $scope.importMappingSearch.customerId;
            });
            var commonDateMapping = _.find(dataMappings, function (dataMapping) {
                return !dataMapping.customerId;
            });

            if (currentDateMapping || commonDateMapping) {
                data = currentDateMapping ? currentDateMapping : commonDateMapping;
                callback(data);
            } else {
                lincUtil.confirmPopupPromise("Comfirm Message", "Can not find a mapping for this customer and field set. But there is  a mapping has the same field set from other customer , do you want to use this mapping ?").then(function () {
                    data = dataMappings[0];
                    callback(data);
                }, function () {

                });
            }
        }

        function setItemSpecFromMapping(itemSpecMappings) {
            _.forEach(itemSpecMappings, function (itemSpecMapping) {
                var templateField = itemSpecMapping.templateField;
                $scope.fieldMatch[templateField] = itemSpecMapping.wiseField;
                $scope.itemSpecFieldsEnums[templateField] = $scope.enumAdapterTable[itemSpecMapping.wiseField];
                $scope.mapValue[templateField] = itemSpecMapping.hasValueMapping;
                if (itemSpecMapping.propertyId)
                    $scope.dynamicFieldMatch[templateField] = itemSpecMapping.propertyId;

                if (itemSpecMapping.hasValueMapping) {
                    var valueMap = {};
                    $scope.matchItemLines[templateField] = [];
                    _.forEach(itemSpecMapping.valueMapping, function (val, field) {
                        valueMap[field] = val;
                        $scope.matchItemLines[templateField].push({
                            "name": field,
                            "itemSpecValue": val
                        });
                    });

                    $scope.importDataLists = _.without(_.uniq(_.map($scope.importUploadData, templateField)) == "" ? [] : _.uniq(_.map($scope.importUploadData, templateField)), '');

                    if ($scope.importDataLists.length > 0) {

                        _.forEach($scope.importDataLists, function (item) {
                            if (!valueMap[item]) {
                                $scope.matchItemLines[templateField].push({
                                    "name": item
                                });
                            }

                        });

                    }

                }
            });
        }

        function setItemUomFromMapping(itemUnitMappings) {
            $scope.itemUnits = [];
            $scope.matchUnitLines = {};
            for (var i in itemUnitMappings) {
                $scope.itemUnits.push({});
                _.forEach(itemUnitMappings[i].entries, function (unitMappingEntry) {

                    var templateField = unitMappingEntry.templateField;
                    $scope.itemUnits[i][templateField] = unitMappingEntry.wiseField;
                    $scope.itemUnits[i]["isBaseUOM"] = unitMappingEntry.isBaseUOM;
                    $scope.itemUnitAndCodeFieldsEnums[templateField] = $scope.enumAdapterTable[unitMappingEntry.wiseField];
                    $scope.mapUnitValue[templateField + i] = unitMappingEntry.hasValueMapping;

                    if (unitMappingEntry.hasValueMapping) {
                        $scope.matchUnitLines[i] ? $scope.matchUnitLines[i] : $scope.matchUnitLines[i] = {};
                        $scope.matchUnitLines[i][templateField] = [];
                        var valueMap = {};
                        _.forEach(unitMappingEntry.valueMapping, function (val, field) {
                            valueMap[field] = val;
                            $scope.matchUnitLines[i][templateField].push({
                                "name": field,
                                "itemSpecValue": val
                            });

                        });

                        $scope.importDataLists = _.without(_.uniq(_.map($scope.importUploadData, templateField)) == "" ? [] : _.uniq(_.map($scope.importUploadData, templateField)), '');

                        if ($scope.importDataLists.length > 0) {
                            _.forEach($scope.importDataLists, function (item) {
                                if (!valueMap[item]) {
                                    $scope.matchUnitLines[i][templateField].push({
                                        "name": item
                                    });
                                }
                            })

                        }

                    }

                });
            }

        }

        function setItemAkaFromMapping(akaMappings) {
            $scope.itemAKAs = [];
            $scope.matchAkaLines = {};
            for (var i in akaMappings) {
                $scope.itemAKAs.push({});
                _.forEach(akaMappings[i].entries, function (akaMappingEntry) {

                    var templateField = akaMappingEntry.templateField;
                    $scope.itemAKAs[i][templateField] = akaMappingEntry.wiseField;
                    $scope.itemAkaFieldsEnums[templateField] = $scope.enumAdapterTable[akaMappingEntry.wiseField];
                    $scope.mapAkaValue[templateField + i] = akaMappingEntry.hasValueMapping;

                    if (akaMappingEntry.hasValueMapping) {
                        $scope.matchAkaLines[i] ? $scope.matchAkaLines[i] : $scope.matchAkaLines[i] = {};
                        $scope.matchAkaLines[i][templateField] = [];
                        var valueMap = {};
                        _.forEach(akaMappingEntry.valueMapping, function (val, field) {
                            valueMap[field] = val;
                            $scope.matchAkaLines[i][templateField].push({
                                "name": item,
                                "itemSpecValue": val
                            });

                        });

                        $scope.importDataLists = _.without(_.uniq(_.map($scope.importUploadData, templateField)) == "" ? [] : _.uniq(_.map($scope.importUploadData, templateField)), '');

                        if ($scope.importDataLists.length > 0) {
                            _.forEach($scope.importDataLists, function (item) {
                                if (!valueMap[item]) {
                                    $scope.matchAkaLines[i][templateField].push({
                                        "name": item
                                    });
                                }
                            })

                        }

                    }

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
        /* jerry mapping end*/

        $scope.isShowDown = true;
        $scope.showUpOrDown = function () {
            if ($scope.isShowDown) $scope.isShowDown = false;
            else $scope.isShowDown = true;
        };

        //================

        $scope.isCheckAll = false;
        var checkDatas = [];
        $scope.checkAll = function () {
            if ($scope.isCheckAll) {
                $scope.isCheckAll = false;
                checkDatas = [];
            } else {
                checkDatas = [];
                if ($scope.importRecord.length == 0) {
                    $("#selAll").removeAttr("checked");
                    return;
                }
                _.forEach($scope.importRecord, function (data) {
                    checkDatas.push(data.id);
                })
                $scope.isCheckAll = true;
            }
        };

        $scope.isChecked = function (id) {
            var sel = _.find(checkDatas, function (data) {
                return data == id;
            });
            if (sel == null) return false;
            return true;
        };

        $scope.checkOrUnCheck = function (id) {
            if (_.findIndex(checkDatas, function (checkId) {
                    return checkId == id;
                }) > -1) {
                _.remove(checkDatas, function (checkId) {
                    return checkId == id;
                });
            } else {
                checkDatas.push(id);
            }
        };

        $scope.batchRevert = function () {
            if (checkDatas.length == 0) {
                lincUtil.errorPopup("Please select revert item!");
                return;
            }
            var data = {};
            data.itemNames = checkDatas;

            lincUtil.deleteConfirmPopup('Are you sure you want to revert these item?', function () {

                itemService.revertItemImport(data).then(function (data) {
                    _.forEach(checkDatas, function (checkId) {
                        _.remove($scope.importRecord, function (data) {
                            return data.id == checkId;
                        });
                    });
                    checkDatas = [];

                    lincUtil.messagePopup("Revert", "Revert Successful.");
                    apply();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.revertItemImport = function (id) {
            var data = {};
            data.itemNames = [];
            data.itemNames.push(id);

            lincUtil.deleteConfirmPopup('Are you sure you want to revert this item?', function () {

                itemService.revertItemImport(data).then(function (data) {
                    _.remove($scope.importRecord, function (data) {
                        return data.id == id;
                    });

                    lincUtil.messagePopup("Revert", "Revert Successful.");
                    apply();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.clearRecord = function () {
            if ($scope.importRecord.length == 0) {
                return;
            }
            lincUtil.deleteConfirmPopup('Are you sure you want to clear these record, and you will not be reverted?', function () {
                itemService.clearRecord().then(function (data) {
                    $scope.importRecord = [];
                    apply();
                });
            });
        };

        //================

        $scope.importFields = [];
        $scope.importListFields = [];
        $scope.importNotNullFields = [];

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

        var itemspecImportFields = [];
        var itemspecListFields = [];
        var itemspecNotNullFields = [];

        var itemkittingImportFields = [];
        var itemkittingListFields = [];
        var itemkittingNotNullFields = [];

        $scope.itemunitImportFields = [];
        $scope.itemAKAImportFields = [];


        var dynamicField = {
            fieldName: "dynamicField",
            isNotNull: false,
            isList: false
        };

        function getImportFields() {
            if ($scope.activetab == "itemSpec") {
                $scope.importFields = itemspecImportFields; //获取Item Spec Field条目的值
                $scope.importListFields = itemspecListFields;
                $scope.importNotNullFields = itemspecNotNullFields;

            } else if ($scope.activetab == "itemKitting") {
                $scope.importFields = itemkittingImportFields;


                $scope.importListFields = itemkittingListFields;
                $scope.importNotNullFields = itemkittingNotNullFields;
            }
        }

        $scope.importRecord = {};

        function getImportRecord(customerId) {
            $scope.btnLoading = true;
            itemService.getImportRecord(customerId).then(function (data) {
                $scope.importRecord = data;
                $scope.btnLoading = false;
                $scope.loadRecordContent(1);
                $scope.recordLoading = false;
                if (data.length > 0) {
                    $scope.recordImportShow = true;
                }

                apply();
            })
        }
        $scope.recordLoading = false;
        $scope.recordImportShow = false;
        $scope.importRecordSearch = {}
        $scope.search = function (customerId) {

            if ($scope.importRecordSearch.customerId) {
                $scope.recordLoading = true;
                getImportRecord($scope.importRecordSearch.customerId);
            } else {
                lincUtil.errorPopup("Please select customer.");
            }

        }

        $scope.itemGroup = [];

        function getItemGroup() {
            itemPropertyService.getItemGroups({}).then(function (data) {
                $scope.itemGroup = data;
            })
        }

        function apply() {
            if (!$scope.$$phase) {
                try {
                    $scope.$apply();
                } catch (e) {}
            }
        }

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
                    if (item.isNotNull) {
                        itemspecNotNullFields.push(item);
                    }
                });

                itemkittingImportFields = data.itemKittingFields;

                _.forEach(itemkittingImportFields, function (item) {
                    if (item.isList) {
                        itemkittingListFields.push(item);
                    }
                    if (item.isNotNull) {
                        itemkittingNotNullFields.push(item);
                    }
                });
                //获取Item Unit Field 的字段

                $scope.itemunitImportFields = data.itemUnitFields;
                $scope.itemAKAImportFields = data.itemAKAFields;
                itemspecImportFields.push(angular.copy(dynamicField));
                getImportFields();
                apply();

            }, function (error) {
                lincUtil.errorPopup("Get item fields fail!");
            });
            getItemGroup();
            initItemUnits();
            initLPConfigs();
            initExcelFields();
            initItemAKA();
        }

        /*jerry page modify*/
        $scope.availableFieldName = function (itemSpecField) {

            if (itemSpecField == "customerId" || itemSpecField == "titleIds" || itemSpecField == "supplierIds" || itemSpecField == "brandId" || itemSpecField == "groupId" || itemSpecField == "tags") {
                return true;
            }
        }

        $scope.onSelectCustomer = function (customerId) {
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

        $scope.loadRecordContent = function (pageNo) {
            if (pageNo == null) pageNo = 1;
            var total = $scope.importRecord.length;
            $scope.importRecordSimple = $scope.importRecord.slice((pageNo - 1) * $scope.pageRecordSize,
                pageNo * $scope.pageRecordSize > total ? total : pageNo * $scope.pageRecordSize);
        };


        function initLPConfigs() {
            $scope.lpConfigurations = [{}];
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

        $scope.addUOM = function () {
            $scope.itemUnits.push({});
        };

        $scope.removeUOM = function (index) {
            $scope.itemUnits.splice(index, 1);
        };

        $scope.addAKA = function () {
            $scope.itemAKAs.push({});
        };

        $scope.removeAKA = function (index) {
            $scope.itemAKAs.splice(index, 1);
        };

        $scope.addLP = function () {
            $scope.lpConfigurations.push({});
        };

        $scope.removeLastLP = function () {
            $scope.lpConfigurations.splice(-1, 1);
        };
        init();

    };
    itemImportController.$inject = ['$scope', '$http', 'lincUtil', 'itemService', 'itemPropertyService', '$mdDialog', ];
    return itemImportController;

});