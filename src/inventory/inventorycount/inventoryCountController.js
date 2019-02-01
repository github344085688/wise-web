'use strict';

define(['lodash', 'moment'], function (_, moment) {
    var basicCountController = function($scope, $http, cycleCountTaskService, locationService, lincUtil) {
        $scope.adjustedResults = ["LOCATION MOVE", "ON HOLD", "NEW INVENTORY", "ADJUST QTY", "ADJUSTED", "MATCH", "ERROR"];

        $scope.search = {};
        $scope.search.isEffective = true;

        $scope.page = {pageSize: 10};
        $scope.isSearching = false;
        $scope.currentPage = 1;

        function getParam() {
            if (!$scope.search.userId) {
                $scope.search.createdBy = null;
            }

            $scope.search.isAdjusted = null;
            if ($scope.search.adjusted === "Adjusted") {
                $scope.search.isAdjusted = true;
            } else if ($scope.search.adjusted === "UnAdjusted") {
                $scope.search.isAdjusted = false;
            }

            if (!$scope.search.lpId) {
                $scope.search.lpId = null;
            }

            $scope.search.isEffective = null;
            if ($scope.search.effective === "Effective") {
                $scope.search.isEffective = true;
            } else if ($scope.search.effective === "UnEffective") {
                $scope.search.isEffective = false;
            }

            $scope.search.isEmptyLocation = null;
            if ($scope.search.emptyLocation === "EmptyLocation") {
                $scope.search.isEmptyLocation = true;
            } else if ($scope.search.emptyLocation === "UnEmptyLocation") {
                $scope.search.isEmptyLocation = false;
            }

            $scope.search.adjustedResult = null;
            switch ($scope.search.adjustedResults) {
                case "LOCATION MOVE":
                    $scope.search.adjustedResult = "%LOCATION_MOVE%";
                    break;
                case "ON HOLD":
                    $scope.search.adjustedResult = "%ON_HOLD%";
                    break;
                case "NEW INVENTORY":
                    $scope.search.adjustedResult = "%NEW_INVENTORY%";
                    break;
                case "ADJUST STATUS":
                    $scope.search.adjustedResult = "%ADJUST_STATUS%";
                    break;
                case "ADJUST QTY":
                    $scope.search.adjustedResult = "%ADJUST_QTY%";
                    break;
                case "ADJUSTED":
                    $scope.search.adjustedResult = "%ADJUSTED%";
                    break;
                case "MATCH":
                    $scope.search.adjustedResult = "%MATCH%";
                    break;
                case "ERROR":
                    $scope.search.adjustedResult = "%ERROR%";
                    break;
            }

            return angular.copy($scope.search);
        }

        $scope.searchCount = function (currentPage) {
            if ($scope.isSearching) {
                return;
            }
            $scope.currentPage = currentPage;
            $scope.isSearching = true;

            var param = getParam();
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.page.pageSize) };

            cycleCountTaskService.searchBasicCountByPaging(param).then(function (data) {

                $scope.isSearching = false;
                $scope.paging = data.paging;
                $scope.countDatas = data.inventoryCounts;

            },function(error) {
                $scope.isSearching = false;
                lincUtil.errorPopup(error);
            });
        };
        $scope.searchCount(1);

        $scope.getuser = function (user) {
            $scope.search.createdBy = user.username;
        };

        $scope.getLocations = function (searchName) {
            locationService.locationSearchByPaging({regexName: searchName, paging:{pageNo: 1, limit: 10}}).then(function (response) {
                $scope.locationList = response.locations;
            });
        };

        function adjustCountData(param) {
            lincUtil.confirmPopup('Adjust Confirm', 'Are you sure you want to adjust?', function() {
                $scope.isAdjusting = true;
                cycleCountTaskService.adjustCountData(param).then(function () {
                    $scope.isAdjusting = false;
                    $scope.searchCount($scope.currentPage);
                },function(error) {
                    $scope.isAdjusting = false;
                    lincUtil.errorPopup(error);
                });
            });
        }

        
        $scope.effect= function(id) {
            lincUtil.confirmPopup('Effective Confirm', 'Are you sure you want to make it effective?', function() {
                var param = {isEffective:true}
                cycleCountTaskService.updateBasicCount(id,param).then(function () {
                    lincUtil.updateSuccessfulPopup($scope.searchCount($scope.currentPage));
                  
                },function(error) {
                    lincUtil.errorPopup(error);
                });
            });
        }

        $scope.batchAdjust = function () {
            if ($scope.isAdjusting) {
                lincUtil.errorPopup("Adjusting! Please wait!");
                return;
            }

            var param = getParam();
            adjustCountData(param);
        };

        $scope.adjust = function (id) {
            if ($scope.isAdjusting) {
                return;
            }
            var param = {};
            param.ids = [id];
            adjustCountData(param);
        };

        $scope.delete = function (id) {
            lincUtil.deleteConfirmPopup('Are you sure you want to remove this record?', function() {
                cycleCountTaskService.deleteBasicCount(id).then(function () {
                    $scope.searchCount($scope.currentPage);
                },function(error) {
                    lincUtil.errorPopup(error);
                });
            });
        };

        $scope.exporting = false;
        $scope.export = function () {
            if ($scope.exporting) return;
            $scope.exporting = true;
            var param = getParam();

            cycleCountTaskService.getAllBasicCountData(param).then(function (data) {
                if (!data || data.length === 0) {
                    $scope.exporting = false;
                    lincUtil.errorPopup("No data export!");
                    return;
                }
                downLoad(data);

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        function downLoad(data) {
            var param = {
                data:[],
                head: ["id", "lpId", "locationName", "itemSpecName", "itemSpecDesc", "uom", "qty", "diffCsQty", "diffEaQty", "createdBy", "createdWhen", "isEffective", "isEmptyLocation"]
            };
            _.forEach(data, function (item) {
                var obj = {};
                obj.id = item.id
                obj.lpId = item.lpId;
                obj.locationName = item.locationName;
                obj.itemSpecName = item.itemSpecName;
                obj.itemSpecDesc = item.itemSpecDesc;
                obj.uom = item.uom;
                obj.qty = item.qty;
                obj.diffCsQty = item.diffCsQty;
                obj.diffEaQty = item.diffEaQty;
                obj.createdBy = item.createdBy;
                obj.createdWhen = item.createdWhen ? moment(item.createdWhen).format("YYYY-MM-DD HH:mm:ss") : "";
                obj.isEffective = item.isEffective;
                obj.isEmptyLocation = item.isEmptyLocation;

                param.data.push(obj);
            });

            $http.post("/wms-app/report/export", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if(res.data.byteLength == 0){
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "countData.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        }
    };
    basicCountController.$inject = ['$scope', '$http', 'cycleCountTaskService', 'locationService', 'lincUtil'];
    return basicCountController;
});