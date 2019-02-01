'use strict';

define(['angular', 'lodash', 'moment'], function (angular, _, moment) {
    var orderItemlineStatisticsController = function ($scope, $http, lincUtil, inventoryService) {
       
        $scope.searchInfo = {
            status: 'Shipped'
        };

        // $scope.inventoryStatus = ['Available', 'Receiving', 'Damage', 'Loaded', 'Packed', 'Picked', 'Shipped', 'UnShipped', 'OnHold'];


        function fetchItemVelocity(searchInfo) {
            var param = angular.copy(searchInfo);
            param.shippedTimeTo = moment(param.shippedTimeTo).endOf('day').format('YYYY-MM-DDTHH:mm:ss');
            if (!validateTimeDuringThreeMouth(param)) {
                lincUtil.errorPopup("Shipped time window can not be more than three months.");
                return;
            };
            $scope.isLoading = true;
            $scope.itemVelocity = [];
            inventoryService.fetchItemVelocity(param).then(function (response) {
                $scope.itemVelocity = response;
                $scope.sortClick("shippedQtyByBaseQty");
                $scope.isLoading = false;
            }, function (err) {
                $scope.isLoading = false;
                lincUtil.errorPopup(err);
            });
        }

        function validateTimeDuringThreeMouth(param) {
            var shippedTimeFrom = moment(param.shippedTimeFrom);
            var shippedTimeTo = moment(param.shippedTimeTo);
            if (shippedTimeTo.diff(shippedTimeFrom,'days') <= 90) {
                return true;
            }
            return false;
        }

        var sortMap = {};
        $scope.sortClick = function (key) {
            var sort = "asc";
            if (sortMap[key]) sort = sortMap[key];

            if (sort === "asc") sort = "desc";
            else sort = "asc";
            sortMap[key] = sort;

            $scope.itemVelocity.baseUnitShippedQtyItemlines = _.orderBy($scope.itemVelocity.baseUnitShippedQtyItemlines, function (itemLine) {
                return _.toNumber(_.trimEnd(itemLine[key], ' EA'));
            }, [sort]);
        };

        $scope.searchAndAnalysis = function (searchInfo) {
            fetchItemVelocity(searchInfo);
        };

        $scope.export = function () {
            if (!$scope.itemVelocity || !$scope.itemVelocity.baseUnitShippedQtyItemlines || $scope.itemVelocity.baseUnitShippedQtyItemlines.length === 0) {
                lincUtil.errorPopup("Not data, please search first");
                return;
            }
            if ($scope.exporting) return;
            $scope.exporting = true;

            var param = {};
            param.data = $scope.itemVelocity.baseUnitShippedQtyItemlines;
            param.head = ["itemSpecName", "itemSpecDesc", "itemGroupName", "shippedQtyDetail", "shippedQtyByBaseQty"];

            $http.post("/wms-app/report/export", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "itemVelocity.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

    };

    orderItemlineStatisticsController.$inject = ['$scope', '$http', 'lincUtil', 'inventoryService'];
    return orderItemlineStatisticsController;

});