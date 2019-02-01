'use strict';
define([
    'angular',
    'lodash',
    './newLpController',
    './newInventoryController'
], function(angular, _, newLpController, newInventoryController) {

    var controller = function($scope, $state, $stateParams, $resource, $timeout,
                              inventoryService, adjustmentService, itemService, lincUtil) {

        newLpController($scope, $timeout, inventoryService);
        newInventoryController($scope, adjustmentService,inventoryService, lincUtil);
        $scope.adjustmentReasons = ["Cycle Count","Damaged item","Customer Exit Clean Up","Consolidate Plates",
            "Non-conforming Casepack Qty","Concealed Shortage","Expired Product","Freight Damage","LP Split",
            "Per Customer","Physical Inventory","Part Number Change","QA Inspection Complete","QA Inspection Hold",
            "Shipping Error","Suspense","Warehouse Damage","Concealed Damage","Receiving Error","Return To Vendor",
            "Pack Change","Title Transfer","Make Pallet","Internal Adjustment"
        ];

        function getUnits(itemSpecId) {
            return new Promise(function (resolve, reject) {
                itemService.searchItemUnits({itemSpecId: itemSpecId}).then(function (data) {
                    if (resolve) resolve(data.units);
                });
            });
        }

        function getDiverse(itemSpecId) {
            return new Promise(function (resolve, reject) {
                itemService.diverseSearch({itemSpecId:itemSpecId}).then(function (data) {
                    var diverseList = [];
                    _.forEach(data, function (diverse) {
                        var obj = {};
                        obj.name = "";
                        obj.productId = diverse.id;
                        _.forEach(diverse.diverseProperties, function (property) {
                            if (obj.name) obj.name += " | ";
                            obj.name += property.name + "(" + property.value + ")";
                        });
                        diverseList.push(obj);
                    });
                    if (resolve) resolve(diverseList);
                });
            });
        }
        function getItem(id) {
            return new Promise(function (resolve, reject) {
                itemService.getItemById(id).then(function (data) {
                    if (resolve) resolve(data);
                });
            });
        }

        //============================================

        var tempStatus = "Temp adjust";
        var trueStatus = "True adjust";
        var source = "Manual";
        //var adjustType = ["Adjust Location", "Adjust LP", "Adjust Status", "Adjust QTY", "Adjust Item", "Adjust UOM", "Adjust Customer", "Adjust Title"];

        $scope.qualitys = ["AVAILABLE", "DAMAGE", "ON_HOLD"];
        function getLowcaseQuality(quality) {
            if (quality == "AVAILABLE") {
                return "Available";
            } else if (quality == "RECEIVING") {
                return "Receiving";
            }else if (quality == "DAMAGE") {
                return "Damage";
            } else if (quality == "ON_HOLD") {
                return "OnHold";
            } else if (quality == "PICKED") {
                return "Picked";
            } else if (quality == "LOADED") {
                return "Loaded";
            } else if (quality == "CONFIGURATION") {
                return "Configuration";
            } else if (quality == "SHIPPED") {
                return "Shipped";
            } else if (quality == "OCCUPIED") {
                return "Occupied";
            }
            return quality;
        }
        function getUpcaseQuality(quality) {
            if (quality == "Available") {
                return "AVAILABLE";
            } else if (quality == "Receiving") {
                return "RECEIVING";
            } else if (quality == "Damage") {
                return "DAMAGE";
            } else if (quality == "OnHold") {
                return "ON_HOLD";
            } else if (quality == "Picked") {
                return "PICKED";
            } else if (quality == "Loaded") {
                return "LOADED";
            } else if (quality == "Configuration") {
                return "CONFIGURATION";
            } else if (quality == "Shipped") {
                return "SHIPPED";
            } else if (quality == "Occupied") {
                return "OCCUPIED";
            }
            return quality;
        }

        // 历史操作记录
        var adjustMoveLocation = null;
        var adjustMoveLP = null;
        var adjustStatus = null;
        var adjustQTY = null;
        var adjustUOM = null;
        var adjustItem = null;
        var lPAdjustTitle = null;
        var lPAdjustLotNo = null;
        var lPAdjustExpDate = null;
        var lPAdjustMfgDate = null;
        var lPAdjustShelfLifeDays = null;
        var lPAdjustSN = null;

        // 批量 adjustment
        var bAdjustTitle = null;
        var bAdjustStatus = null;
        var bAdjustMoveLocation = null;
        var batchAdjustLotNo = null;
        var batchAdjustExpDate = null;
        var batchAdjustMfgDate = null;
        var batchAdjustShelfLifeDays = null;

        var bAdjustCustomer = {};
        bAdjustCustomer.type = "Adjust Customer";
        bAdjustCustomer.status = trueStatus;
        // 正在创建的 Adjustment
        $scope.newAdjustment = {};
        $scope.newAdjustment.type = "Adjust Location";
        $scope.newAdjustment.status = tempStatus;
        
        function adjustmentInit(adjustment) {
            adjustment.source = source;
            adjustment.hasSN = true;
            adjustment.itemList = [];
            adjustment.titleList = [];
            adjustment.unitList = [];
            adjustment.customerList = [];
            adjustment.inventorys = [];
            adjustment.adjustmentContent = {};
            adjustment.adjustmentContent.QTY = 0;
        }
        function lpListInit(adjustment) {
            // if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabSelectActiveId == "Select2" && adjustment != null)
            //     return;
            adjustment.lpList = {};
            adjustment.lpList.data = [];
            adjustment.lpList.sel = [];
        }
        adjustmentInit($scope.newAdjustment);
        adjustmentInit(bAdjustCustomer);

        function adjustmentClear(adjustment) {
            if ($scope.bTabSelectActiveId != "Select2") {
                adjustment.locationId = null;
            }
            if ($scope.subTabActiveId != "BatchAdjustment" || $scope.bTabSelectActiveId != "Select1") {
                adjustment.customerId = null;
            }
            if ($scope.subTabActiveId != "LPAdjustment" && $scope.bTabSelectActiveId != "Select3") {
                adjustment.lpId = null;
            }
            if ($scope.subTabActiveId != "BatchAdjustment" || $scope.bTabActiveId != 'AdjustStatus' ) {
                adjustment.adjustFrom = null;
            }
            adjustment.itemSpecId = null;
            adjustment.titleId = null;
            adjustment.productId = null;
            adjustment.unitId = null;
            adjustment.qty = null;
            adjustment.sn = null;

            if ($scope.subTabActiveId != "LPAdjustment" && $scope.tabActiveId == "AdjustItem") {
                adjustment.adjustTo = null;
                adjustment.adjustToUnit = null;
                adjustment.adjustToDiverse = null;
            }
        }
        function adjustmentCopy(adjustment) {
            adjustment.locationId = $scope.newAdjustment.locationId;
            adjustment.lpId = $scope.newAdjustment.lpId;
            adjustment.customerId = $scope.newAdjustment.customerId;
            adjustment.itemSpecId = $scope.newAdjustment.itemSpecId;
            adjustment.titleId = $scope.newAdjustment.titleId;
            adjustment.productId = $scope.newAdjustment.productId;
            adjustment.unitId = $scope.newAdjustment.unitId;
            adjustment.qty = $scope.newAdjustment.qty;
            adjustment.itemStatus = $scope.newAdjustment.itemStatus;

            adjustment.hasSN = $scope.newAdjustment.hasSN;
            adjustment.itemList = $scope.newAdjustment.itemList;
            adjustment.titleList = $scope.newAdjustment.titleList;
            adjustment.unitList = $scope.newAdjustment.unitList;
            adjustment.customerList = $scope.newAdjustment.customerList;
            adjustment.lpList = $scope.newAdjustment.lpList;
            adjustment.adjustmentContent = $scope.newAdjustment.adjustmentContent;
            adjustment.inventorys = $scope.newAdjustment.inventorys;
        }

        // 当前激活的标签
        $scope.subTabActiveId = "LPAdjustment";
        $scope.tabActiveId = "MoveLocation";
        $scope.bTabActiveId = "AdjustCustomer";
        $scope.bTabSelectActiveId = "Select1";

        function leaveLPAdjustment() {
            if ($scope.tabActiveId == "MoveLocation") {
                adjustMoveLocation = $scope.newAdjustment;
            } else if ($scope.tabActiveId == "MoveLP") {
                adjustMoveLP = $scope.newAdjustment;
            } else if ($scope.tabActiveId == "AdjustStatus") {
                adjustStatus = $scope.newAdjustment;
            } else if ($scope.tabActiveId == "AdjustQTY") {
                adjustQTY = $scope.newAdjustment;
            } else if ($scope.tabActiveId == "AdjustUOM") {
                adjustUOM = $scope.newAdjustment;
            } else if ($scope.tabActiveId == "AdjustItem") {
                adjustItem = $scope.newAdjustment;
            }else if ($scope.tabActiveId == "LPAdjustTitle") {
                lPAdjustTitle = $scope.newAdjustment;
            }else if ($scope.tabActiveId == "adjustLotNo") {
                lPAdjustLotNo = $scope.newAdjustment;
            }else if ($scope.tabActiveId == "adjustExpDate") {
                lPAdjustExpDate = $scope.newAdjustment;
            }else if ($scope.tabActiveId == "adjustMfgDate") {
                lPAdjustMfgDate = $scope.newAdjustment;
            }else if ($scope.tabActiveId == "adjustShelfLifeDays") {
                lPAdjustShelfLifeDays = $scope.newAdjustment;
            }else if ($scope.tabActiveId == "adjustSN") {
                lPAdjustSN = $scope.newAdjustment;
            }
        }

        function leaveBatchAdjustment() {
            if ($scope.bTabActiveId == "AdjustCustomer") {
                bAdjustCustomer = $scope.newAdjustment;
            } else if ($scope.bTabActiveId == "AdjustTitle") {
                bAdjustTitle = $scope.newAdjustment;
            } else if ($scope.bTabActiveId == "AdjustStatus") {
                bAdjustStatus = $scope.newAdjustment;
            } else if ($scope.bTabActiveId == "MoveLocation") {
                bAdjustMoveLocation = $scope.newAdjustment;
            } else if ($scope.bTabActiveId == "adjustLotNo") {
                batchAdjustLotNo = $scope.newAdjustment;
            } else if ($scope.bTabActiveId == "adjustExpDate") {
                batchAdjustExpDate = $scope.newAdjustment;
            } else if ($scope.bTabActiveId == "adjustMfgDate") {
                batchAdjustMfgDate = $scope.newAdjustment;
            } else if ($scope.bTabActiveId == "adjustShelfLifeDays") {
                batchAdjustShelfLifeDays = $scope.newAdjustment;
            }
        }

        function tabLPAdjustmentActive() {
            if ($scope.subTabActiveId == "BatchAdjustment") {
                leaveBatchAdjustment();
            }
            //====================
            if ($scope.tabActiveId == "MoveLocation") {
                $scope.newAdjustment = adjustMoveLocation;
            } else if ($scope.tabActiveId == "MoveLP") {
                $scope.newAdjustment = adjustMoveLP;
            } else if ($scope.tabActiveId == "AdjustStatus") {
                $scope.newAdjustment = adjustStatus;
            } else if ($scope.tabActiveId == "AdjustQTY") {
                $scope.newAdjustment = adjustQTY;
            } else if ($scope.tabActiveId == "AdjustUOM") {
                $scope.newAdjustment = adjustUOM;
            } else if ($scope.tabActiveId == "AdjustItem") {
                $scope.newAdjustment = adjustItem;
            }else if ($scope.tabActiveId == "LPAdjustTitle") {
                $scope.newAdjustment = lPAdjustTitle;
            }else if ($scope.tabActiveId == "adjustLotNo") {
                $scope.newAdjustment = lPAdjustLotNo;
            }else if ($scope.tabActiveId == "adjustExpDate") {
                $scope.newAdjustment = lPAdjustExpDate;
            }else if ($scope.tabActiveId == "adjustMfgDate") {
                $scope.newAdjustment = lPAdjustMfgDate;
            }else if ($scope.tabActiveId == "adjustShelfLifeDays") {
                $scope.newAdjustment = lPAdjustShelfLifeDays;
            }else if ($scope.tabActiveId == "adjustSN") {
                $scope.newAdjustment = lPAdjustSN;
            }
        }
        function tabBatchAdjustmentActive() {
            if ($scope.subTabActiveId == "LPAdjustment") {
                leaveLPAdjustment();
            }
            //====================
            if ($scope.bTabActiveId == "AdjustCustomer") {
                $scope.newAdjustment = bAdjustCustomer;
            } else if ($scope.bTabActiveId == "AdjustTitle") {
                $scope.newAdjustment = bAdjustTitle;
            } else if ($scope.bTabActiveId == "AdjustStatus") {
                $scope.newAdjustment = bAdjustStatus;
            } else if ($scope.bTabActiveId == "MoveLocation") {
                $scope.newAdjustment = bAdjustMoveLocation;
            }else if ($scope.bTabActiveId == "adjustLotNo") {
                $scope.newAdjustment = batchAdjustLotNo;
            }else if ($scope.bTabActiveId == "adjustExpDate") {
                $scope.newAdjustment = batchAdjustExpDate;
            }else if ($scope.bTabActiveId == "adjustMfgDate") {
                $scope.newAdjustment = batchAdjustMfgDate;
            }else if ($scope.bTabActiveId == "adjustShelfLifeDays") {
                $scope.newAdjustment = batchAdjustShelfLifeDays;
            }
        }
        function tabNewLP() {
            if ($scope.subTabActiveId == "LPAdjustment") {
                leaveLPAdjustment();
            } else if ($scope.subTabActiveId == "BatchAdjustment") {
                leaveBatchAdjustment();
            }
        }
        function tabNewInventory() {
            if ($scope.subTabActiveId == "LPAdjustment") {
                leaveLPAdjustment();
            } else if ($scope.subTabActiveId == "BatchAdjustment") {
                leaveBatchAdjustment();
            }
        }

        $scope.subTabActive = function (tabId) {
            if (tabId == $scope.subTabActiveId) return;
            if (tabId == "LPAdjustment") {
                tabLPAdjustmentActive();
            } else if (tabId == "BatchAdjustment") {
                tabBatchAdjustmentActive();
            } else if (tabId == "NewInventory") {
                tabNewInventory();
            } else if (tabId == "NewLP") {
                tabNewLP();
            }
            $scope.subTabActiveId = tabId;
        };
        $scope.tabActive = function (tabId) {
            leaveLPAdjustment();
            if (tabId == "MoveLocation") {
                if (adjustMoveLocation == null) {
                    adjustMoveLocation = {};
                    adjustMoveLocation.type = "Adjust Location";
                    adjustMoveLocation.status = tempStatus;
                    adjustmentInit(adjustMoveLocation);
                    adjustMoveLocation.adjustFrom = $scope.newAdjustment.locationId;
                }
                adjustmentCopy(adjustMoveLocation);
                $scope.newAdjustment = adjustMoveLocation;
            } else if (tabId == "MoveLP") {
                if (adjustMoveLP == null) {
                    adjustMoveLP = {};
                    adjustMoveLP.type = "Adjust LP";
                    adjustMoveLP.status = tempStatus;
                    adjustmentInit(adjustMoveLP);
                    adjustMoveLP.adjustFrom = $scope.newAdjustment.lpId;
                }
                adjustmentCopy(adjustMoveLP);
                $scope.newAdjustment = adjustMoveLP;
            } else if (tabId == "AdjustStatus") {
                if (adjustStatus == null) {
                    adjustStatus = {};
                    adjustStatus.type = "Adjust Status";
                    adjustStatus.status = trueStatus;
                    adjustmentInit(adjustStatus);
                }
                adjustmentCopy(adjustStatus);
                $scope.newAdjustment = adjustStatus;
                $scope.newAdjustment.adjustFrom = $scope.newAdjustment.itemStatus;

            } else if (tabId == "AdjustQTY") {
                if (adjustQTY == null) {
                    adjustQTY = {};
                    adjustQTY.type = "Adjust QTY";
                    adjustQTY.status = trueStatus;
                    adjustmentInit(adjustQTY);
                    adjustQTY.adjustFrom = $scope.newAdjustment.adjustmentContent.QTY;
                }
                adjustmentCopy(adjustQTY);
                $scope.newAdjustment = adjustQTY;
                $scope.newAdjustment.adjustFrom = $scope.newAdjustment.qty;

            } else if (tabId == "AdjustUOM") {
                if (adjustUOM == null) {
                    adjustUOM = {};
                    adjustUOM.type = "Adjust UOM";
                    adjustUOM.status = trueStatus;
                    adjustmentInit(adjustUOM);
                    adjustUOM.adjustFrom = $scope.newAdjustment.unitId;
                }
                adjustmentCopy(adjustUOM);
                $scope.newAdjustment = adjustUOM;
            } else if (tabId == "AdjustItem") {
                if (adjustItem == null) {
                    adjustItem = {};
                    adjustItem.type = "Adjust Item";
                    adjustItem.status = trueStatus;
                    adjustmentInit(adjustItem);
                    adjustItem.adjustFrom = $scope.newAdjustment.itemSpecId;
                }
                adjustmentCopy(adjustItem);
                $scope.newAdjustment = adjustItem;
            } else if (tabId == "LPAdjustTitle") {
                if (lPAdjustTitle == null) {
                    lPAdjustTitle = {};
                    lPAdjustTitle.type = "Adjust Title";
                    lPAdjustTitle.status = trueStatus;
                    adjustmentInit(lPAdjustTitle);
                    lPAdjustTitle.adjustFrom = $scope.newAdjustment.titleId;
                }
                adjustmentCopy(lPAdjustTitle);
                $scope.newAdjustment = lPAdjustTitle;
            }else if (tabId == "adjustLotNo") {
                if (lPAdjustLotNo == null) {
                    lPAdjustLotNo = {};
                    lPAdjustLotNo.type = "Adjust LotNo";
                    lPAdjustLotNo.status = tempStatus;
                    adjustmentInit(lPAdjustLotNo);
                    lPAdjustLotNo.adjustFrom = $scope.newAdjustment.lPAdjustLotNo;
                }
                adjustmentCopy(lPAdjustLotNo);
                $scope.newAdjustment = lPAdjustLotNo;
            } else if (tabId == "adjustExpDate") {
                if (lPAdjustExpDate == null) {
                    lPAdjustExpDate = {};
                    lPAdjustExpDate.type = "Adjust ExpirationDate";
                    lPAdjustExpDate.status = tempStatus;
                    adjustmentInit(lPAdjustExpDate);
                    lPAdjustExpDate.adjustFrom = $scope.newAdjustment.lPAdjustExpDate;
                }
                adjustmentCopy(lPAdjustExpDate);
                $scope.newAdjustment = lPAdjustExpDate;
            } else if (tabId == "adjustMfgDate") {
                if (lPAdjustMfgDate == null) {
                    lPAdjustMfgDate = {};
                    lPAdjustMfgDate.type = "Adjust MfgDate";
                    lPAdjustMfgDate.status = tempStatus;
                    adjustmentInit(lPAdjustMfgDate);
                    lPAdjustMfgDate.adjustFrom = $scope.newAdjustment.lPAdjustMfgDate;
                }
                adjustmentCopy(lPAdjustMfgDate);
                $scope.newAdjustment = lPAdjustMfgDate;
            }else if (tabId == "adjustShelfLifeDays") {
                if (lPAdjustShelfLifeDays == null) {
                    lPAdjustShelfLifeDays = {};
                    lPAdjustShelfLifeDays.type = "Adjust ShelfLifeDays";
                    lPAdjustShelfLifeDays.status = tempStatus;
                    adjustmentInit(lPAdjustShelfLifeDays);
                    lPAdjustShelfLifeDays.adjustFrom = $scope.newAdjustment.lPAdjustShelfLifeDays;
                }
                adjustmentCopy(lPAdjustShelfLifeDays);
                $scope.newAdjustment = lPAdjustShelfLifeDays;
            }else if (tabId == "adjustSN") {
                if (lPAdjustSN == null) {
                    lPAdjustSN = {};
                    lPAdjustSN.type = "Adjust SN";
                    lPAdjustSN.status = trueStatus;
                    adjustmentInit(lPAdjustSN);
                    lPAdjustSN.adjustFrom = $scope.newAdjustment.sn;
                }
                adjustmentCopy(lPAdjustSN);
                $scope.newAdjustment = lPAdjustSN;
            }
            $scope.tabActiveId = tabId;
        };

        $scope.bTabActive = function (tabId) {
            if ($scope.bTabActiveId == "AdjustCustomer") {
                bAdjustCustomer = $scope.newAdjustment;
            } else if ($scope.bTabActiveId == "AdjustTitle") {
                bAdjustTitle = $scope.newAdjustment;
            } else if ($scope.bTabActiveId == "AdjustStatus") {
                bAdjustStatus = $scope.newAdjustment;
            } else if ($scope.bTabActiveId == "MoveLocation") {
                bAdjustMoveLocation = $scope.newAdjustment;
            }

            if (tabId == "AdjustCustomer") {
                if (bAdjustCustomer == null) {
                    bAdjustCustomer = {};
                    bAdjustCustomer.type = "Adjust Customer";
                    bAdjustCustomer.status = trueStatus;
                    adjustmentInit(bAdjustCustomer);
                }
                adjustmentCopy(bAdjustCustomer);
                if ($scope.newAdjustment.customerId) {
                    bAdjustCustomer.adjustFrom = $scope.newAdjustment.customerId;
                }
                $scope.newAdjustment = bAdjustCustomer;
            } else if (tabId == "AdjustTitle") {
                if (bAdjustTitle == null) {
                    bAdjustTitle = {};
                    bAdjustTitle.type = "Adjust Title";
                    bAdjustTitle.status = trueStatus;
                    adjustmentInit(bAdjustTitle);
                }
                adjustmentCopy(bAdjustTitle);
                if ($scope.newAdjustment.titleId) {
                    bAdjustTitle.adjustFrom = $scope.newAdjustment.titleId;
                }
                $scope.newAdjustment = bAdjustTitle;
            } else if (tabId == "AdjustStatus") {
                if (bAdjustStatus == null) {
                    bAdjustStatus = {};
                    bAdjustStatus.type = "Adjust Status";
                    bAdjustStatus.status = trueStatus;
                    adjustmentInit(bAdjustStatus);
                }
                adjustmentCopy(bAdjustStatus);
                $scope.newAdjustment = bAdjustStatus;
            } else if (tabId == "MoveLocation") {
                if (bAdjustMoveLocation == null) {
                    bAdjustMoveLocation = {};
                    bAdjustMoveLocation.type = "Adjust Location";
                    bAdjustMoveLocation.status = tempStatus;
                    bAdjustMoveLocation.adjustFrom = $scope.newAdjustment.adjustmentContent.LocationId;
                    adjustmentInit(bAdjustMoveLocation);
                }
                adjustmentCopy(bAdjustMoveLocation);
                $scope.newAdjustment = bAdjustMoveLocation;
            }else if (tabId == "adjustLotNo") {
                if (batchAdjustLotNo == null) {
                    batchAdjustLotNo = {};
                    batchAdjustLotNo.type = "Adjust LotNo";
                    batchAdjustLotNo.status = tempStatus;
                    adjustmentInit(batchAdjustLotNo);
                }
                adjustmentCopy(batchAdjustLotNo);
                $scope.newAdjustment = batchAdjustLotNo;
            } else if (tabId == "adjustExpDate") {
                if (batchAdjustExpDate == null) {
                    batchAdjustExpDate = {};
                    batchAdjustExpDate.type = "Adjust ExpirationDate";
                    batchAdjustExpDate.status = tempStatus;
                    adjustmentInit(batchAdjustExpDate);
                }
                adjustmentCopy(batchAdjustExpDate);
                $scope.newAdjustment = batchAdjustExpDate;
            } else if (tabId == "adjustMfgDate") {
                if (batchAdjustMfgDate == null) {
                    batchAdjustMfgDate = {};
                    batchAdjustMfgDate.type = "Adjust MfgDate";
                    batchAdjustMfgDate.status = tempStatus;
                    adjustmentInit(batchAdjustMfgDate);
                }
                adjustmentCopy(batchAdjustMfgDate);
                $scope.newAdjustment = batchAdjustMfgDate;
            } else if (tabId == "adjustShelfLifeDays") {
                if (batchAdjustShelfLifeDays == null) {
                    batchAdjustShelfLifeDays = {};
                    batchAdjustShelfLifeDays.type = "Adjust ShelfLifeDays";
                    batchAdjustShelfLifeDays.status = tempStatus;
                    adjustmentInit(batchAdjustShelfLifeDays);
                }
                adjustmentCopy(batchAdjustShelfLifeDays);
                $scope.newAdjustment = batchAdjustShelfLifeDays;
            }
            if ($scope.bTabActiveId == "AdjustStatus" || tabId == "AdjustStatus") {
                $scope.bTabActiveId = tabId;
                if ($scope.bTabSelectActiveId == "Select1" && $scope.newAdjustment.customerId != null) {
                    $scope.getQTY();
                } else if (($scope.bTabSelectActiveId == "Select2" && $scope.newAdjustment.locationId != null) ||
                    ($scope.bTabSelectActiveId == "Select3" && $scope.newAdjustment.lpId != null)) {
                    $scope.getInventory();
                }

            } else {
                $scope.bTabActiveId = tabId;
            }
        };

        var adjustSelect1 = angular.copy(bAdjustCustomer);
        var adjustSelect2 = angular.copy(bAdjustCustomer);
        var adjustSelect3 = angular.copy(bAdjustCustomer);
        $scope.bTabSelActive = function (tabId) {
            if ($scope.bTabSelectActiveId == "Select1") {
                adjustSelect1 = $scope.newAdjustment;
            } else if ($scope.bTabSelectActiveId == "Select2") {
                adjustSelect2 = $scope.newAdjustment;
            } else if ($scope.bTabSelectActiveId == "Select3") {
                adjustSelect3 = $scope.newAdjustment;
            }

            $scope.bTabSelectActiveId = tabId;

            if (tabId == "Select1") {
                adjustSelect1.adjustFrom = $scope.newAdjustment.adjustFrom;
                adjustSelect1.adjustTo = $scope.newAdjustment.adjustTo;
                $scope.newAdjustment = adjustSelect1;

            } else if (tabId == "Select2") {
                adjustSelect2.adjustFrom = $scope.newAdjustment.adjustFrom;
                adjustSelect2.adjustTo = $scope.newAdjustment.adjustTo;
                $scope.newAdjustment = adjustSelect2;

            } else if (tabId == "Select3") {
                adjustSelect3.adjustFrom = $scope.newAdjustment.adjustFrom;
                adjustSelect3.adjustTo = $scope.newAdjustment.adjustTo;
                $scope.newAdjustment = adjustSelect3;
            }
        };

        //============================================

        var validator = {};
        validator.validateInventorySel = function () {
            if (!selInventoryId) {
                var mesg = "Please select a inventory record.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
        };
        validator.validateAdjustFromTo = function () {
            if ($scope.newAdjustment.adjustTo == null) {
                var mesg = "Adjust To must not be null.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }

            if ($scope.newAdjustment.adjustFrom == $scope.newAdjustment.adjustTo && $scope.newAdjustment.type != "Adjust Item") {
                var mesg = "Adjust From & Adjust To can not be the same.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
        };
        validator.validateLP = function () {
            if ($scope.newAdjustment.lpIds == null || $scope.newAdjustment.lpIds.length == 0) {
                var mesg = "LP must not be null.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
        };
        validator.validateAdjustLocation = function () {

        };
        validator.validateAdjustLP = function () {
            if ($scope.newAdjustment.sn == null && ($scope.newAdjustment.qty == null || $scope.newAdjustment.qty <= 0)) {
                var mesg = "SN must not be null Or QTY must be greater than 0.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
        };
        validator.validateAdjustStatus = function () {
            $scope.newAdjustment.adjustFrom = getUpcaseQuality($scope.newAdjustment.adjustFrom);
            // if ($scope.newAdjustment.sn == null && ($scope.newAdjustment.qty == null || $scope.newAdjustment.qty <= 0)) {
            //     var mesg = "SN must not be null Or QTY must be greater than 0.";
            //     lincUtil.errorPopup(mesg);
            //     throw new Error(mesg);
            // }
        };
        validator.validateAdjustQTY = function () {

        };
        validator.validateAdjustUOM = function () {

        };
        validator.validateAdjustItem = function () {
            if ($scope.newAdjustment.adjustToUnit == null) {
                var mesg = "Adjust To Unit can not be null.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
            if ($scope.itemDiverses.length > 0 && $scope.newAdjustment.adjustToDiverse == null) {
                var mesg = "Adjust To Diverse can not be null.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }

            if ($scope.newAdjustment.adjustFrom == $scope.newAdjustment.adjustTo) {
                if ($scope.newAdjustment.adjustToDiverse == null && $scope.newAdjustment.unitId == $scope.newAdjustment.adjustToUnit) {
                    var mesg = "Adjust From & Adjust To can not be the same.";
                    lincUtil.errorPopup(mesg);
                    throw new Error(mesg);
                }
                if ($scope.newAdjustment.productId == $scope.newAdjustment.adjustToDiverse
                    && $scope.newAdjustment.unitId == $scope.newAdjustment.adjustToUnit) {
                    var mesg = "Adjust From & Adjust To can not be the same.";
                    lincUtil.errorPopup(mesg);
                    throw new Error(mesg);
                }
            }
        };
        validator.validateAdjustCustomer = function () {
            if ($scope.newAdjustment.adjustmentContent.QTY == null || $scope.newAdjustment.adjustmentContent.QTY == 0) {
                var mesg = "QTY is null or 0, No inventory found.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
        };
        validator.validateAdjustTitle = function () {
            if ($scope.newAdjustment.adjustmentContent.QTY == null || $scope.newAdjustment.adjustmentContent.QTY == 0) {
                var mesg = "QTY is null or 0, No inventory found.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
        };
        validator.validateNewInventory = function () {
            if ($scope.newInventory.customerId == null) {
                var mesg = "The customer must not be null.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
            if ($scope.newInventory.titleId == null) {
                var mesg = "The title must not be null.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
            if ($scope.newInventory.itemSpecId == null) {
                var mesg = "The item must not be null.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
            if ($scope.newInventory.unitId == null) {
                var mesg = "The UOM must not be null.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
            if ($scope.newInventory.lpId == null) {
                var mesg = "The LP must not be null.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
            if ($scope.newInventory.adjustTo == null) {
                var mesg = "The QTY must not be null.";
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            }
        };
        function validate() {
            if ($scope.subTabActiveId === 'NewInventory') {
                validator.validateNewInventory();
                return;
            }

            if ($scope.newAdjustment.lpId != null) {
                $scope.newAdjustment.lpIds = [];
                $scope.newAdjustment.lpIds.push($scope.newAdjustment.lpId);
            } else if ($scope.newAdjustment.lpList != null && $scope.newAdjustment.lpList.sel != null) {
                $scope.newAdjustment.lpIds = $scope.newAdjustment.lpList.sel;
            }

            validator.validateAdjustFromTo();
            validator.validateLP();

            if ($scope.subTabActiveId == "LPAdjustment" && $scope.tabActiveId != "MoveLocation") {
                validator.validateInventorySel();
            }

            if ($scope.newAdjustment.type == "Adjust Location") {
                validator.validateAdjustLocation();
            } else if ($scope.newAdjustment.type == "Adjust LP") {
                validator.validateAdjustLP();
            } else if ($scope.newAdjustment.type == "Adjust Status") {
                validator.validateAdjustStatus();
            } else if ($scope.newAdjustment.type == "Adjust QTY") {
                validator.validateAdjustQTY();
            } else if ($scope.newAdjustment.type == "Adjust Item") {
                validator.validateAdjustItem();
            } else if ($scope.newAdjustment.type == "Adjust UOM") {
                validator.validateAdjustUOM();
            } else if ($scope.newAdjustment.type == "Adjust Customer") {
                validator.validateAdjustCustomer();
            } else if ($scope.newAdjustment.type == "Adjust Title" && lPAdjustTitle == null ) {
                validator.validateAdjustTitle();
            }
        }

        function lpMovingItemLines() {
            $scope.newAdjustment.lpMovingItemLines = [];

            var itemLine = {};
            itemLine.itemSpecId = $scope.newAdjustment.itemSpecId;
            itemLine.productId = $scope.newAdjustment.productId;
            itemLine.unitId = $scope.newAdjustment.unitId;
            itemLine.qty = $scope.newAdjustment.qty;
            itemLine.titleId = $scope.newAdjustment.titleId;
            itemLine.itemStatus = getLowcaseQuality($scope.newAdjustment.itemStatus);
            if ($scope.newAdjustment.sn) {
                itemLine.sns = [];
                itemLine.sns.push($scope.newAdjustment.sn);
            }

            $scope.newAdjustment.lpMovingItemLines.push(itemLine);
        }

        $scope.adjustmentObj = {};
        $scope.isSaving = false;
        $scope.saveData = function () {
            if (!$scope.adjustmentObj.notes) {
                lincUtil.errorPopup("Please enter notes");
                return;
            }
            if (!$scope.adjustmentObj.reason) {
                lincUtil.errorPopup("Reason is required");
                return;
            }
            if ($scope.isSaving) return;
            validate();

            $scope.newAdjustment.notes = $scope.adjustmentObj.notes;
            $scope.newAdjustment.reason = $scope.adjustmentObj.reason;
            $scope.newAdjustment.receiptId = $scope.adjustmentObj.receiptId;
            if ($scope.subTabActiveId === 'NewInventory') {
                $scope.addInventory(approveNow);
                return;
            }
            if ($scope.newAdjustment.type == "Adjust LP") {
                lpMovingItemLines();
            }
            $scope.newAdjustment.itemStatus = getLowcaseQuality($scope.newAdjustment.itemStatus);
            $scope.isSaving = true;
            adjustmentService.saveAdjustment($scope.newAdjustment, approveNow).then(function (response) {
                $scope.isSaving = false;
                lincUtil.saveSuccessfulPopup();
                $scope.newAdjustment.adjustFrom = null;
                $scope.newAdjustment.adjustTo = null;

                selInventoryId = null;
                inventoryViews = null;
                if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabSelectActiveId == "Select2") {
                    $scope.getQTY();
                } else {
                    $scope.getInventory();
                }

            }, function (error) {
                $scope.isSaving = false;
                var mesg = error;
                if (error.data && error.data.error) {
                    mesg = error.data.error;
                }
                lincUtil.errorPopup(mesg);
                throw new Error(mesg);
            });
        };

        $scope.cancel = function () {
            $state.go('inventory.adjustment.list');
        };

        var approveNow = false;
        $scope.checkOrUnCheck = function () {
            if (approveNow) approveNow = false;
            else approveNow = true;
        };

        //============================================

        function getLpLocationRes(data) {
            if ($scope.subTabActiveId == "LPAdjustment") {
                $scope.newAdjustment.locationId = data.locationId;
                $scope.newAdjustment.adjustmentContent.Location = data.locationName;
                $scope.newAdjustment.adjustmentContent.LocationId = data.locationId;

                if ($scope.tabActiveId == "MoveLocation") {
                    $scope.newAdjustment.adjustFrom = data.locationId;
                }
            } else if ($scope.subTabActiveId == "BatchAdjustment") {
                $scope.newAdjustment.locationId = data.locationId;
                $scope.newAdjustment.adjustmentContent.Location = data.locationName;
                $scope.newAdjustment.adjustmentContent.LocationId = data.locationId;
            }
        }

        function getChildrenLP(lpid) {
            inventoryService.getInventoryLP(lpid).then(function (data) {
                $scope.newAdjustment.adjustmentContent.childrenLps = data.childrenIds;
            });
        }

        function hasSNChange(ishas) {
            if ($scope.newAdjustment.hasSN == ishas) {
                return;
            }
            $scope.newAdjustment.hasSN = ishas;

            if (ishas) {
                $scope.newAdjustment.qty = null;
            } else {
                $scope.newAdjustment.sn = null;
            }
            if ($scope.newAdjustment.adjustmentContent.QTY) {
                $scope.newAdjustment.adjustmentContent.QTY = null;
            }
        }

        var inventoryParam;
        var inventoryViews;
        function copyParam(param) {
            inventoryParam = {};
            inventoryParam.status = param.status;
            inventoryParam.lpIds = [];
            _.forEach(param.lpIds, function (lpid) {
                inventoryParam.lpIds.push(lpid);
            })
        }
        function checkParam(param) {
            if (inventoryParam && param) {
                if (inventoryParam.status != param.status) return false;
                if (inventoryParam.lpIds.length != param.lpIds.length) return false;
                for (var i = 0; i < param.lpIds.length; i++) {
                    var index = _.findIndex(inventoryParam.lpIds, function (id) {
                        return id == param.lpIds[i];
                    })
                    if (index < 0) return false;
                }
                return true;
            }
            return false;
        }
        $scope.isSearching = false;
        var getInventoryWait;
        $scope.getInventory = function () {
            if ($scope.isSearching) {
                if (getInventoryWait) {
                    clearTimeout(getInventoryWait);
                }
                getInventoryWait = setTimeout(function () {
                    $scope.getInventory();
                }, 500);
                return;
            }
            var param = {};
            param.lpIds = [];

            if ($scope.newAdjustment.lpList && $scope.newAdjustment.lpList.sel && $scope.newAdjustment.lpList.sel.length > 0) {
                param.lpIds = $scope.newAdjustment.lpList.sel;
            } else if ($scope.newAdjustment.lpId != null) {
                param.lpIds.push($scope.newAdjustment.lpId);
            }

            if ($scope.subTabActiveId == "LPAdjustment" && $scope.tabActiveId == "AdjustStatus") {
                param.status = $scope.newAdjustment.adjustFrom;
            } else if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabActiveId == "AdjustStatus") {
                param.status = $scope.newAdjustment.adjustFrom;
            } else if ($scope.newAdjustment.itemStatus) {
                param.status = $scope.newAdjustment.itemStatus;
            }
            param.status = getLowcaseQuality(param.status);

            adjustmentClear($scope.newAdjustment);
            adjustmentInit($scope.newAdjustment);

            if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabSelectActiveId == "Select2") {
                $scope.newAdjustment.adjustFrom = getUpcaseQuality(param.status);
            }

            if (param.lpIds.length == 0) return;
            if (param.lpIds.length == 1) getChildrenLP(param.lpIds[0]);

            if (checkParam(param) && inventoryViews) {
                manageInventory(inventoryViews);
                return;
            }
            copyParam(param);

            $scope.isSearching = true;
            inventoryService.searchSimpleInventory(param).then(function (data) {
                inventoryViews = data;
                manageInventory(inventoryViews);
                $scope.isSearching = false;
            });
        };

        function manageInventory(data) {
            if (!data || data.length == 0) return;

            getLpLocationRes(data[0]);
            $scope.newAdjustment.adjustmentContent.Total = 0;

            _.forEach(data, function (view) {
                var index = _.findIndex($scope.newAdjustment.itemList, function (tag) {
                    return tag.id == view.itemSpecId;
                });
                if (index < 0) {
                    var item = {};
                    item.id = view.itemSpecId;
                    item.name = view.itemName;
                    $scope.newAdjustment.itemList.push(item);
                }

                index = _.findIndex($scope.newAdjustment.customerList, function (tag) {
                    return tag.id == view.customerId;
                });
                if (index < 0) {
                    var customer = {};
                    customer.id = view.customerId;
                    customer.name = view.customerName;
                    $scope.newAdjustment.customerList.push(customer);
                }

                index = _.findIndex($scope.newAdjustment.titleList, function (tag) {
                    return tag.id == view.titleId;
                });
                if (index < 0) {
                    var title = {};
                    title.id = view.titleId;
                    title.name = view.titleName;
                    $scope.newAdjustment.titleList.push(title);
                }

                $scope.newAdjustment.adjustmentContent.Total += view.qty;
                if (view.sn) {
                    $scope.newAdjustment.inventorys.push(angular.copy(view));
                    return;
                }

                var isFound = false;
                var key = view.itemSpecId + view.productId + view.unitId
                    + view.customerId + view.titleId + view.status;
                for (var i = 0; i < $scope.newAdjustment.inventorys.length; i++) {
                    var key1 = $scope.newAdjustment.inventorys[i].itemSpecId
                        + $scope.newAdjustment.inventorys[i].productId
                        + $scope.newAdjustment.inventorys[i].unitId
                        + $scope.newAdjustment.inventorys[i].customerId
                        + $scope.newAdjustment.inventorys[i].titleId
                        + $scope.newAdjustment.inventorys[i].status;

                    if (key == key1) {
                        isFound = true;
                        $scope.newAdjustment.inventorys[i].qty += view.qty;
                        break;
                    }
                }
                if (!isFound) {
                    $scope.newAdjustment.inventorys.push(angular.copy(view));
                }
            });
            if ($scope.newAdjustment.customerList.length == 1) {
                $scope.newAdjustment.customerId = $scope.newAdjustment.customerList[0].id;
                $scope.newAdjustment.adjustmentContent.Customer = $scope.newAdjustment.customerList[0].name;

                if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabActiveId == "AdjustCustomer") {
                    $scope.newAdjustment.adjustFrom = $scope.newAdjustment.customerId;
                }
            }

            if ($scope.newAdjustment.titleList.length == 1) {
                $scope.newAdjustment.titleId = $scope.newAdjustment.titleList[0].id;
                $scope.newAdjustment.adjustmentContent.Title = $scope.newAdjustment.titleList[0].name;

                if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabActiveId == "AdjustTitle") {
                    $scope.newAdjustment.adjustFrom = $scope.newAdjustment.titleId;
                }
            }
            if ($scope.newAdjustment.itemList.length == 1) {
                $scope.newAdjustment.itemSpecId = $scope.newAdjustment.itemList[0].id;
                $scope.newAdjustment.adjustmentContent.Item = $scope.newAdjustment.itemList[0].name;
                if ($scope.subTabActiveId == "LPAdjustment") {
                    getItem($scope.newAdjustment.itemSpecId).then(function (item) {
                        hasSNChange(item.hasSerialNumber);
                    });
                }
                getUnits($scope.newAdjustment.itemSpecId).then(function (data) {
                     $scope.newAdjustment.unitList = data;
                });

                if ($scope.subTabActiveId == "LPAdjustment" && $scope.tabActiveId == "AdjustItem") {
                    $scope.newAdjustment.adjustFrom = $scope.newAdjustment.itemSpecId;
                }
            }
            if ($scope.subTabActiveId == "LPAdjustment") {
                if ($scope.tabActiveId == "MoveLP") {
                    $scope.newAdjustment.adjustFrom = $scope.newAdjustment.lpId;
                } else if ($scope.tabActiveId == "AdjustQTY") {
                    $scope.newAdjustment.adjustFrom = $scope.newAdjustment.adjustmentContent.QTY;
                }
            }
            if ($scope.subTabActiveId == "BatchAdjustment") {
                $scope.newAdjustment.adjustmentContent.QTY = $scope.newAdjustment.adjustmentContent.Total;
                $scope.newAdjustment.qty = $scope.newAdjustment.adjustmentContent.Total;
            }
        }

        var selInventoryId;
        $scope.checkToSel = function (view) {
            if ($scope.tabActiveId == 'MoveLocation') return;

            selInventoryId = view.id;

            $scope.newAdjustment.customerId = view.customerId;
            $scope.newAdjustment.adjustmentContent.Customer = view.customerName;

            $scope.newAdjustment.titleId = view.titleId;
            $scope.newAdjustment.adjustmentContent.Title = view.titleName;

            $scope.newAdjustment.itemSpecId = view.itemSpecId;
            $scope.newAdjustment.adjustmentContent.Item = view.itemName;

            $scope.newAdjustment.productId = view.productId;
            $scope.newAdjustment.adjustmentContent.Diverse = view.diverseName;

            $scope.newAdjustment.unitId = view.unitId;
            $scope.newAdjustment.adjustmentContent.Unit = view.unitName;

            getItem($scope.newAdjustment.itemSpecId).then(function (item) {
                hasSNChange(item.hasSerialNumber);
            });

            if ($scope.subTabActiveId == "LPAdjustment") {
                if ($scope.tabActiveId == "AdjustItem") {
                    $scope.newAdjustment.adjustFrom = $scope.newAdjustment.itemSpecId;
                } else if ($scope.newAdjustment.type == "Adjust Status") {
                    $scope.newAdjustment.adjustFrom = getUpcaseQuality(view.status);
                } else if ($scope.tabActiveId == "AdjustUOM") {
                    $scope.newAdjustment.adjustFrom = $scope.newAdjustment.unitId;
                } else if ($scope.tabActiveId == "AdjustQTY") {
                    $scope.newAdjustment.adjustFrom = view.qty;
                } else if ($scope.tabActiveId == "adjustLotNo") {
                    $scope.newAdjustment.adjustFrom = view.lotNo;
                } else if ($scope.tabActiveId == "adjustExpDate") {
                    $scope.newAdjustment.adjustFrom = view.expirationDate;
                } else if ($scope.tabActiveId == "adjustMfgDate") {
                    $scope.newAdjustment.adjustFrom = view.mfgDate;
                } else if ($scope.tabActiveId == "adjustShelfLifeDays") {
                    $scope.newAdjustment.adjustFrom = view.shelfLifeDays;
                } else if ($scope.tabActiveId == "adjustSN") {
                    $scope.newAdjustment.adjustFrom = view.sn;
                }
            }

            $scope.newAdjustment.qty = view.qty;
            $scope.newAdjustment.sn = view.sn;
            $scope.newAdjustment.itemStatus = view.status;

            $scope.newAdjustment.lPAdjustLotNo = view.lotNo;
            $scope.newAdjustment.lPAdjustExpDate = view.expirationDate;
            $scope.newAdjustment.lPAdjustMfgDate = view.mfgDate;
            $scope.newAdjustment.lPAdjustShelfLifeDays = view.shelfLifeDays;

            getUnits($scope.newAdjustment.itemSpecId).then(function (data) {
                $scope.newAdjustment.unitList = data;
            });
        }
        $scope.isChecked = function(id) {
            return selInventoryId == id;
        }

        var timer;
        var isGettingQTY = false;
        $scope.getQTY = function () {
            if (($scope.bTabSelectActiveId == "Select2" && $scope.newAdjustment.locationId != null) ||
                ($scope.bTabSelectActiveId == "Select3" && $scope.newAdjustment.lpId != null)) {
                $scope.getInventory();
                return;
            }

            if (isGettingQTY) {
                if (timer != null) {
                    $timeout.cancel(timer);
                }
                timer = $timeout(function () {
                    $scope.getQTY();
                }, 500);

                return;
            }
            isGettingQTY = true;

            if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabSelectActiveId == "Select2") {
                $scope.newAdjustment.customerId = null;
                $scope.newAdjustment.adjustmentContent.Customer = null;
                $scope.newAdjustment.titleId = null;
                $scope.newAdjustment.adjustmentContent.Title = null;
                $scope.newAdjustment.itemSpecId = null;
                $scope.newAdjustment.adjustmentContent.Item = null;
                $scope.newAdjustment.productId = null;
                $scope.newAdjustment.adjustmentContent.Diverse = null;
                $scope.newAdjustment.hasSN = true;
                $scope.newAdjustment.adjustmentContent.QTY = 0;

                $scope.newAdjustment.batchAdjustLotNo = null;
                $scope.newAdjustment.batchAdjustExpDate = null;
                $scope.newAdjustment.batchAdjustMfgDate = null;
                $scope.newAdjustment.batchAdjustShelfLifeDays = null;
            }

            getSelectList().then(function (data) {
                if ($scope.subTabActiveId == "LPAdjustment") {
                    if ($scope.tabActiveId == "AdjustQTY") {
                        $scope.newAdjustment.adjustFrom = data.sumQty;
                    }

                } else if ($scope.subTabActiveId == "BatchAdjustment") {
                    if (data.customerIds.length == 1) {
                        $scope.newAdjustment.customerId = data.customerIds[0];
                        $scope.newAdjustment.adjustmentContent.Customer = data.customers[0].name;

                        if ($scope.bTabActiveId == "AdjustCustomer") {
                            $scope.newAdjustment.adjustFrom = $scope.newAdjustment.customerId;
                        }
                    }

                    if (data.titleIds.length == 1) {
                        $scope.newAdjustment.titleId = data.titleIds[0];
                        $scope.newAdjustment.adjustmentContent.Title = data.titles[0].name;

                        if ($scope.bTabActiveId == "AdjustTitle") {
                            $scope.newAdjustment.adjustFrom = $scope.newAdjustment.titleId;
                        }
                    }

                    if (data.itemSpecIds.length == 1) {
                        $scope.newAdjustment.itemSpecId = data.itemSpecIds[0];
                        $scope.newAdjustment.adjustmentContent.Item = data.itemSpecs[0].name;
                        hasSNChange(data.itemSpecs[0].hasSerialNumber);
                    }

                    if (data.diverses.length == 1) {
                        $scope.newAdjustment.productId = data.diverses[0].productId;
                        $scope.newAdjustment.adjustmentContent.Diverse = data.diverses[0].name;
                    }
                }
                $scope.newAdjustment.adjustmentContent.QTY = data.sumQty;

                isGettingQTY = false;
            }, function () {
                isGettingQTY = false;
            });
        };

        function getSelectList() {
            var param = {};
            param.lpIds = [];
            if ($scope.newAdjustment.lpList.sel && $scope.newAdjustment.lpList.sel.length > 0) {
                param.lpIds = $scope.newAdjustment.lpList.sel;
            } else if ($scope.newAdjustment.lpId != null) {
                param.lpIds.push($scope.newAdjustment.lpId);
            }
            param.customerId = $scope.newAdjustment.customerId;
            param.itemSpecId = $scope.newAdjustment.itemSpecId;
            param.titleId = $scope.newAdjustment.titleId;
            param.productId = $scope.newAdjustment.productId;
            param.unitId = $scope.newAdjustment.unitId;

            if ($scope.subTabActiveId == "LPAdjustment" && $scope.tabActiveId == "AdjustStatus") {
                param.status = $scope.newAdjustment.adjustFrom;
            } else if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabActiveId == "AdjustStatus") {
                param.status = $scope.newAdjustment.adjustFrom;
            } else if ($scope.newAdjustment.itemStatus) {
                if ($scope.newAdjustment.itemStatus == "Available") {
                    param.status = "AVAILABLE";
                } else if ($scope.newAdjustment.itemStatus == "Damage") {
                    param.status = "DAMAGE";
                } else if ($scope.newAdjustment.itemStatus == "OnHold") {
                    param.status = "ON_HOLD";
                }
            }

            return inventoryService.statistics(param);
        }

        $scope.itemDiverses = [];
        $scope.itemUnits = [];
        $scope.adjustToItemChange = function (item) {
            if ($scope.subTabActiveId === "NewInventory") {
                $scope.newInventory.unitId = null;
                $scope.newInventory.productId = null;
                getDiverse(item.id).then(function (data) {
                    $scope.newInventory.itemDiverses = data;
                });
                getUnits(item.id).then(function (data) {
                    $scope.newInventory.itemUnits = data;
                });

            } else {
                $scope.newAdjustment.adjustToUnit = null;
                $scope.newAdjustment.adjustToDiverse = null;

                if (item) {
                    getDiverse(item.id).then(function (data) {
                        $scope.itemDiverses = data;
                    });
                    getUnits(item.id).then(function (data) {
                        $scope.itemUnits = data;
                    });
                }
            }
        };

        //============================================

        function getTitleList(data) {
            $scope.newAdjustment.titleList = data.titles;

            if ($scope.newAdjustment.titleList.length == 1) {
                $scope.newAdjustment.titleId = $scope.newAdjustment.titleList[0].id;

                if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabActiveId == "AdjustTitle") {
                    $scope.newAdjustment.adjustFrom = $scope.newAdjustment.titleId;
                    $scope.newAdjustment.adjustmentContent.Title = $scope.newAdjustment.titleList[0].name;
                }
            } else if ($scope.newAdjustment.titleId != null) {
                var index = _.findIndex(data.titleIds, function(titleId) {
                    return titleId == $scope.newAdjustment.titleId;
                });
                if (index < 0) {
                    $scope.newAdjustment.titleId = null;
                }
            }
        }

        function getItemList(data) {
            $scope.newAdjustment.itemList = data.itemSpecs;

            if ($scope.newAdjustment.itemList.length == 1) {
                $scope.newAdjustment.itemSpecId = $scope.newAdjustment.itemList[0].id;

            } else if ($scope.newAdjustment.itemSpecId != null) {
                var index = _.findIndex(data.itemList, function(itemId) {
                    return itemId == $scope.newAdjustment.itemSpecId;
                });
                if (index < 0) {
                    $scope.newAdjustment.itemSpecId = null;
                }
            }
        }

        function getLPList(data) {
            lpListInit($scope.newAdjustment);

            if (data.lpIds == null) {
                return;
            }

            _.forEach(data.lpIds, function (id) {
                var obj = {};
                obj.id = id;
                obj.name = id;
                $scope.newAdjustment.lpList.data.push(obj);
            })
            if (data.lpIds.length == 1) {
                $scope.newAdjustment.lpId = data.lpIds[0];
                if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabSelectActiveId == "Select2") {
                    $scope.getQTY();
                }
            } else if ($scope.newAdjustment.lpId != null) {
                var index = _.findIndex(data.lpIds, function(lpId) {
                    return lpId == $scope.newAdjustment.lpId;
                });
                if (index < 0) {
                    $scope.newAdjustment.lpId = null;
                }
            }
        }

        $scope.customerChange = function (customer) {
            adjustmentClear($scope.newAdjustment);
            adjustmentInit($scope.newAdjustment);

            getSelectList().then(function (data) {
                getItemList(data);
                getTitleList(data);
                if ($scope.newAdjustment.itemSpecId != null) {
                    getLPList(data);
                } else {
                    lpListInit($scope.newAdjustment);
                    $scope.newAdjustment.lpId = null;
                }
                $scope.newAdjustment.adjustmentContent.QTY = data.sumQty;
            });

            if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabActiveId == "AdjustCustomer") {
                $scope.newAdjustment.adjustFrom = $scope.newAdjustment.customerId;
            }
            $scope.newAdjustment.adjustmentContent.Customer = customer.name;
        };

        $scope.itemSpecIdOnSelect = function () {
            getSelectList().then(function (data) {
                getTitleList(data);
                if ($scope.newAdjustment.itemSpecId != null) {
                    getLPList(data);
                } else {
                    lpListInit($scope.newAdjustment);
                    $scope.newAdjustment.lpId = null;
                }
                $scope.newAdjustment.adjustmentContent.QTY = data.sumQty;
            });
        };

        $scope.titleOnSelect = function (title) {
            getSelectList().then(function (data) {
                getItemList(data);
                if ($scope.newAdjustment.itemSpecId != null) {
                    getLPList(data);
                } else {
                    lpListInit($scope.newAdjustment);
                    $scope.newAdjustment.lpId = null;
                }
                $scope.newAdjustment.adjustmentContent.QTY = data.sumQty;
            });

            if ($scope.subTabActiveId == "BatchAdjustment" && $scope.bTabActiveId == "AdjustTitle") {
                $scope.newAdjustment.adjustFrom = $scope.newAdjustment.titleId;
            }
            $scope.newAdjustment.adjustmentContent.Title = title.name;
        };

        $scope.locationOnSelect = function (loc) {
            $scope.newAdjustment.adjustmentContent = $scope.newAdjustment.adjustmentContent || {};
            $scope.newAdjustment.adjustmentContent.Location = loc.name;
            $scope.newAdjustment.adjustmentContent.LocationId = loc.id;
            if ($scope.bTabActiveId == "MoveLocation") {
                $scope.newAdjustment.adjustFrom = loc.id;
            }

            inventoryService.getLocationInventoryLPs($scope.newAdjustment.locationId).then(function (data) {
                var res = {};
                res.lpIds = data;
                getLPList(res);
            });
        };

        //============================================

        function init() {
            $scope.getEmptyLP();
        }
        init();
    }

    controller.$inject = ['$scope', '$state', '$stateParams', '$resource', '$timeout',
        'inventoryService', 'adjustmentService', 'itemService', 'lincUtil'];
    return controller;
});