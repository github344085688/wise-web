/**
 * Created by Giroux on 2016/9/25.
 */

'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var adjustmentController = function($scope, $state, $resource, $http, $mdDialog, adjustmentService, lincUtil) {
        $scope.adjustmentType = ["Adjust Location", "Adjust LP", "Adjust Status",
            "Adjust QTY", "Adjust Item", "Adjust UOM", "Adjust Customer", "Adjust Title",
            "Add Inventory", "Adjust LotNo", "Adjust ExpirationDate", "Adjust MfgDate", "Adjust ShelfLifeDays", "Adjust SN"];
        $scope.adjustmentSource = ["Cycle count", "Manual", "Picking"];
        $scope.adjustmentStatus = ["Temp adjust", "True adjust"];
        $scope.adjustmentProgress = ["New", "Complete", "Exception"];
        $scope.adjustmentKind = ["Item", "LP", "Customer", "Title", "Pallet", "Material"];
        $scope.adjustmentReasons = ["Cycle Count", "Damaged item", "Customer Exit Clean Up", "Consolidate Plates",
            "Non-conforming Casepack Qty", "Concealed Shortage", "Expired Product", "Freight Damage", "LP Split",
            "Per Customer", "Physical Inventory", "Part Number Change", "QA Inspection Complete", "QA Inspection Hold",
            "Shipping Error", "Suspense", "Warehouse Damage","Concealed Damage","Receiving Error", "Return To Vendor",
            "Pack Change","Title Transfer", "Make Pallet","Internal Adjustment"
        ];

        $scope.adjustmentSearch = {};

        function fomatSearch() {
            if ($scope.adjustmentSearch.itemSpecId != null && $scope.adjustmentSearch.itemSpecId.length === 0) {
                $scope.adjustmentSearch.itemSpecId = null;
            }
            if ($scope.adjustmentSearch.lpId != null && $scope.adjustmentSearch.lpId.length === 0) {
                $scope.adjustmentSearch.lpId = null;
            }
            $scope.adjustmentSearch.lpIds = null;
            if ($scope.adjustmentSearch.lpId != null) {
                $scope.adjustmentSearch.lpIds = [];
                $scope.adjustmentSearch.lpIds.push($scope.adjustmentSearch.lpId);
            }
            if ($scope.adjustmentSearch.progress != null && $scope.adjustmentSearch.progress.length === 0) {
                $scope.adjustmentSearch.progress = null;
            }
            if ($scope.adjustmentSearch.type != null && $scope.adjustmentSearch.type.length === 0) {
                $scope.adjustmentSearch.type = null;
            }
            if ($scope.adjustmentSearch.status != null && $scope.adjustmentSearch.status.length === 0) {
                $scope.adjustmentSearch.status = null;
            }
            if ($scope.adjustmentSearch.source != null && $scope.adjustmentSearch.source.length === 0) {
                $scope.adjustmentSearch.source = null;
            }
            if ($scope.adjustmentSearch.customerId != null && $scope.adjustmentSearch.customerId.length === 0) {
                $scope.adjustmentSearch.customerId = null;
            }
            if ($scope.adjustmentSearch.titleId != null && $scope.adjustmentSearch.titleId.length === 0) {
                $scope.adjustmentSearch.titleId = null;
            }
        }

        $scope.page = {pageSize: 10};
        $scope.adjustments = [];
        $scope.isSearching = false;
        $scope.search = function(isclick) {
            if ($scope.isSearching) {
                return;
            }
            $scope.isSearching = true;
            if (isclick != null) currentPage = 1;
            if (!currentPage) currentPage = 1;
            fomatSearch();

            var param = angular.copy($scope.adjustmentSearch);
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.page.pageSize) };

            adjustmentService.searchAdjustmentsByPaging(param).then(function(response) {
                $scope.isSearching = false;
                $scope.paging = response.paging;
                $scope.adjustments = refreshData(response.adjustments);
                checkIds = [];
            },function(error) {
                $scope.isSearching = false;
                lincUtil.errorPopup(error);
            });
        }

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.search(1);
            }
            $event.preventDefault();
        }

        $scope.exporting = false;
        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/wms-app/adjustment/export", $scope.adjustmentSearch, {
                responseType: 'arraybuffer'
            }).then(function (res) {

                if(res.data.byteLength == 0){
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "adjustment.xls");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        var currentPage;
        $scope.loadContent = function (pageNo) {
            if (pageNo == null) pageNo = 1;
            currentPage = pageNo;
            $scope.search();
        };

        function refreshAdjustLocation(adjustment) {
            adjustment.note = adjustment.lpIds.join(",");

            if (adjustment.customerName != null) {
                adjustment.adjustmentContent.Customer = adjustment.customerName;
            }
            if (adjustment.titleName != null) {
                adjustment.adjustmentContent.Title = adjustment.titleName;
            }
            if (adjustment.itemName != null) {
                adjustment.adjustmentContent.Item = adjustment.itemName;
                if(adjustment.itemDesc) {
                    adjustment.adjustmentContent.Item =  adjustment.adjustmentContent.Item + "(" + adjustment.itemDesc +")"
                }
            }
            if (adjustment.qty != null) {
                adjustment.adjustmentContent.QTY = adjustment.qty;
            }

            if (adjustment.fromLocation != null) {
                adjustment.adjustmentContent.From = "Location( " + adjustment.fromLocation + " )";
            } else {
                adjustment.adjustmentContent.From = "Location( " + adjustment.adjustFrom + " )";
            }

            if (adjustment.toLocation != null) {
                adjustment.adjustmentContent.To = "Location( " + adjustment.toLocation + " )";
            } else {
                adjustment.adjustmentContent.To = "Location( " + adjustment.adjustTo + " )";
            }
        }
        function refreshAdjustCustomer(adjustment) {
            if (adjustment.customerName != null) {
                adjustment.note = "Customer: " + adjustment.customerName;
            } else if (adjustment.customerId != null) {
                adjustment.note = "Customer: " + adjustment.customerId;
            } else {
                adjustment.note = adjustment.lpIds;
            }

            if (adjustment.titleName != null) {
                adjustment.adjustmentContent.Title = adjustment.titleName;
            }
            if (adjustment.lpIds != null) {
                adjustment.adjustmentContent.LP = adjustment.lpIds;
            }
            if (adjustment.itemName != null) {
                adjustment.adjustmentContent.Item = adjustment.itemName;
            }

            if (adjustment.fromCustomer != null) {
                adjustment.adjustmentContent.From = "Customer( " + adjustment.fromCustomer + " )";
            } else if (adjustment.adjustFrom != null) {
                adjustment.adjustmentContent.From = "Customer( " + adjustment.adjustFrom + " )";
            }

            if (adjustment.toCustomer != null) {
                adjustment.adjustmentContent.To = "Customer( " + adjustment.toCustomer + " )";
            } else {
                adjustment.adjustmentContent.To = "Customer( " + adjustment.adjustTo + " )";
            }
        }
        function refreshAdjustTitle(adjustment) {
            if (adjustment.titleName != null) {
                adjustment.note = "Title: " + adjustment.titleName;
            } else if (adjustment.titleId != null) {
                adjustment.note = "Title: " + adjustment.titleId;
            } else {
                adjustment.note = adjustment.lpIds;
            }

            if (adjustment.customerName != null) {
                adjustment.adjustmentContent.Customer = adjustment.customerName;
            }
            if (adjustment.lpIds != null) {
                adjustment.adjustmentContent.LP = adjustment.lpIds;
            }
            if (adjustment.itemName != null) {
                adjustment.adjustmentContent.Item = adjustment.itemName;
            }

            if (adjustment.fromTitle != null) {
                adjustment.adjustmentContent.From = "Title( " + adjustment.fromTitle + " )";
            } else if (adjustment.adjustFrom != null) {
                adjustment.adjustmentContent.From = "Title( " + adjustment.adjustFrom + " )";
            }

            if (adjustment.toTitle != null) {
                adjustment.adjustmentContent.To = "Title( " + adjustment.toTitle + " )";
            } else {
                adjustment.adjustmentContent.To = "Title( " + adjustment.adjustTo + " )";
            }
        }
        function refreshAdjustUOM(adjustment) {
            adjustment.note = "Item: " + adjustment.itemName;

            if (adjustment.sn != null) {
                adjustment.adjustmentContent.SN = adjustment.sn;
            }
            if (adjustment.qty != null) {
                adjustment.adjustmentContent.QTY = adjustment.qty;
            }
            if (adjustment.lpIds != null) {
                adjustment.adjustmentContent.LP = adjustment.lpIds;
            }
            if (adjustment.customerName != null) {
                adjustment.adjustmentContent.Customer = adjustment.customerName;
            }
            if (adjustment.titleName != null) {
                adjustment.adjustmentContent.Title = adjustment.titleName;
            }
            if (adjustment.diverseName != null) {
                adjustment.adjustmentContent.Diverse = adjustment.diverseName;
            }
            if (adjustment.itemStatus) {
                adjustment.adjustmentContent.Status = adjustment.itemStatus;
            }

            if (adjustment.fromUnit != null) {
                adjustment.adjustmentContent.From = "Unit( " + adjustment.fromUnit + " )";
            } else if (adjustment.adjustFrom != null) {
                adjustment.adjustmentContent.From = "Unit( " + adjustment.adjustFrom + " )";
            }

            if (adjustment.toUnit != null) {
                adjustment.adjustmentContent.To = "Unit( " + adjustment.toUnit + " )";
            } else {
                adjustment.adjustmentContent.To = "Unit( " + adjustment.adjustTo + " )";
            }

        }
        function refreshAdjustItem(adjustment) {
            adjustment.note = "Item: " + adjustment.itemName;

            if (adjustment.sn != null) {
                adjustment.adjustmentContent.SN = adjustment.sn;
            }
            if (adjustment.qty != null) {
                adjustment.adjustmentContent.QTY = adjustment.qty;
            }
            if (adjustment.lpIds != null) {
                adjustment.adjustmentContent.LP = adjustment.lpIds;
            }
            if (adjustment.customerName != null) {
                adjustment.adjustmentContent.Customer = adjustment.customerName;
            }
            if (adjustment.titleName != null) {
                adjustment.adjustmentContent.Title = adjustment.titleName;
            }

            if (adjustment.unitName != null) {
                adjustment.adjustmentContent.Unit = adjustment.unitName;
            }
            if (adjustment.adjustToUnitName != null) {
                adjustment.adjustmentContent.ToUnit = adjustment.adjustToUnitName;
            }

            if (adjustment.diverseName != null) {
                adjustment.adjustmentContent.Diverse = adjustment.diverseName;
            }
            if (adjustment.adjustToDiverseName != null) {
                adjustment.adjustmentContent.ToDiverse = adjustment.adjustToDiverseName;
            }

            if (adjustment.itemStatus) {
                adjustment.adjustmentContent.Status = adjustment.itemStatus;
            }

            if (adjustment.fromItem != null) {
                adjustment.adjustmentContent.From = "Item( " + adjustment.fromItem + " )";
            } else if (adjustment.adjustFrom != null) {
                adjustment.adjustmentContent.From = "Item( " + adjustment.adjustFrom + " )";
            }

            if (adjustment.toItem != null) {
                adjustment.adjustmentContent.To = "Item( " + adjustment.toItem + " )";
            } else {
                adjustment.adjustmentContent.To = "Item( " + adjustment.adjustTo + " )";
            }

        }
        function refreshAdjustment(adjustment) {
            adjustment.note = "Item: " + adjustment.itemName;

            if (adjustment.sn != null) {
                adjustment.adjustmentContent.SN = adjustment.sn;
            }
            if (adjustment.qty != null) {
                adjustment.adjustmentContent.QTY = adjustment.qty;
            }
            if (adjustment.lpIds != null) {
                adjustment.adjustmentContent.LP = adjustment.lpIds;
            }
            if (adjustment.customerName != null) {
                adjustment.adjustmentContent.Customer = adjustment.customerName;
            }
            if (adjustment.titleName != null) {
                adjustment.adjustmentContent.Title = adjustment.titleName;
            }
            if (adjustment.diverseName != null) {
                adjustment.adjustmentContent.Diverse = adjustment.diverseName;
            }
            if (adjustment.unitName != null) {
                adjustment.adjustmentContent.Unit = adjustment.unitName;
            }
            if (adjustment.itemStatus) {
                adjustment.adjustmentContent.Status = adjustment.itemStatus;
            }
            if (adjustment.type != "Add Inventory") {
                adjustment.adjustmentContent.From = adjustment.adjustFrom;
                adjustment.adjustmentContent.To = adjustment.adjustTo;
            }
        }

        function refreshData(adjustments) {
            _.forEach(adjustments, function (adjustment) {
                adjustment.adjustmentContent = {};
                adjustment.note = "";

                if (adjustment.type == "Adjust Location") {
                    refreshAdjustLocation(adjustment);
                    
                } else if (adjustment.type == "Adjust Customer") {
                    refreshAdjustCustomer(adjustment);
                    
                } else if (adjustment.type == "Adjust Title") {
                    refreshAdjustTitle(adjustment);

                } else if (adjustment.type == "Adjust UOM") {
                    refreshAdjustUOM(adjustment);

                } else if (adjustment.type == "Adjust Item") {
                    refreshAdjustItem(adjustment);

                } else {
                    refreshAdjustment(adjustment);
                }

            });
            return adjustments;
        }

        var checkIds = [];
        $scope.checkOrUnCheck = function (id) {
            if (_.findIndex(checkIds, function(checkId) { return checkId == id; }) > -1) {
                _.remove(checkIds, function(checkId) {
                    return checkId == id;
                });
            } else {
                checkIds.push(id);
            }
        }
        $scope.isChecked = function(id) {
            var sel = _.find(checkIds, function(checkId) {
                return checkId == id;
            });
            if (sel == null) return false;
            return true;
        }

        var isApprove = false;
        $scope.approve = function (id) {
            if (isApprove) return;
            
            lincUtil.confirmPopup("Approve Confirm", "Are you sure you want to approve this adjustment?", function()
            {
                isApprove = true;
                adjustmentService.approveAdjustment(id).then(function () {
                    isApprove = false;
                    $scope.search();
                },function(error) {
                    isApprove = false;
                    lincUtil.errorPopup(error);
                });
            });
        };

        var isDeleting = false;
        $scope.delete = function (id) {
            if (isDeleting) {
                return;
            }
            lincUtil.deleteConfirmPopup('Are you sure you want to remove this adjustment?', function()
            {
                isDeleting = true;
                adjustmentService.deleteAdjustment(id).then(function () {
                    isDeleting = false;
                    $scope.search();
                },function(error) {
                    isDeleting = false;
                    lincUtil.errorPopup(error);
                });
            });
        };

        $scope.addAdjustment = function () {
            $state.go('inventory.adjustment.createAdjustment');
        };
        //=======================================

        function init() {
            $scope.search();
        }
        init();
    };

    adjustmentController.$inject = ['$scope', '$state', '$resource', '$http', '$mdDialog', 'adjustmentService', 'lincUtil'];
    return adjustmentController;

});
