'use strict';

define(['angular', 'lodash', './addItemPreferedPickVLGController'], function (angular, _, addItemPreferedPickVLGCtrl) {
    var orderSelectPageController = function ($scope, $http, lincUtil, orderService) {
        $scope.statusList = ["Imported", "Open", "Committed", "Partial Committed"];
        $scope.search = {};
        $scope.activetab = "create";
        $scope.changeTab = function (tab) {
            $scope.activetab = tab;
            if (tab === 'relation') {
                getItemPreferedPickVLG();
            }
        };

        $scope.searchOrders = function () {
            if (!$scope.search.customerId) {
                lincUtil.errorPopup("Please select Customer first!");
                return;
            }
            $scope.isLoading = true;
            if (!$scope.search.statuses) {
                $scope.search.statuses = $scope.statusList;
            }

            if ($scope.search.longHauls && $scope.search.longHauls.length > 0) {
                $scope.search.longHaulNos = _.map($scope.search.longHauls, 'longHaulNo');
            }

            isCheckAll = false;
            $scope.orders = [];
            $scope.search.limit = -1;

            orderService.simpleSearchOrder($scope.search).then(function (response) {
                $scope.isLoading = false;
                $scope.orders = response;
            }, function (err) {
                $scope.isLoading = false;
                lincUtil.errorPopup(err);
            });
        };

        function getCheckOrderIds() {
            var ids = [];
            _.forEach($scope.orders, function (order) {
                if (order.isChecked) ids.push(order.id);
            });
            return ids;
        }

        var isCheckAll = false;
        $scope.toggleAll = function () {
            _.forEach($scope.orders, function (order) {
                order.isChecked = false;
            });
            if (!isCheckAll) {
                _.forEach($scope.orders, function (order) {
                    order.isChecked = true;
                });
            }
            isCheckAll = !isCheckAll;
        };

        $scope.selectAllIsChecked = function () {
            return isCheckAll;
        };

        $scope.toggle = function ($event, order) {
            if (order.isChecked) order.isChecked = false;
            else order.isChecked = true;
        };

        $scope.add = function () {
            var ids = getCheckOrderIds();
            if (ids.length === 0) {
                lincUtil.errorPopup("Please select order first!");
                return;
            }
            $scope.creating = true;
            var param = {
                orderIds: ids,
                topNumber: $scope.search.topNumber
            }
            orderService.createOrderItemTop(param).then(function (res) {
                $scope.creating = false;
                lincUtil.saveSuccessfulPopup();
                getItemTop();

            }, function (error) {
                $scope.creating = false;
                lincUtil.errorPopup(error);
            })
        };

        //========================================

        $scope.showTop = "csTop";
        $scope.topShowChange = function (tag) {
            $scope.showTop = tag;
            filtItemTop();
        };

        function getItemTop() {
            orderService.getOrderItemTop().then(function (data) {
                $scope.itemTopData = data;
                filtItemTop();
            });
        }
        function filtItemTop() {
            $scope.itemTops = [];
            _.forEach($scope.itemTopData, function (item) {
                if ($scope.showTop === "csTop" && item.csTopNum > 0) {
                    $scope.itemTops.push(item);
                } else if ($scope.showTop === "eaTop" && item.eaTopNum > 0) {
                    $scope.itemTops.push(item);
                }
            })
        }
        getItemTop();

        $scope.export = function () {
            if (!$scope.itemTops || $scope.itemTops.length === 0) {
                lincUtil.errorPopup("Not data, please create first");
                return;
            }
            if ($scope.exporting) return;
            $scope.exporting = true;

            var param = {};
            param.data = [];
            _.forEach($scope.itemTops, function (item) {
                if ($scope.showTop === "csTop" && !item.csTopNum) return;
                if ($scope.showTop === "eaTop" && !item.eaTopNum) return;

                var data = {};
                data.itemSpecName = item.itemSpecName;
                data.itemSpecDesc = item.itemSpecDesc;
                if ($scope.showTop === "csTop") {
                    data.csQty = item.csQty;
                    data.csTopNum = item.csTopNum;
                    data.palletQty = item.palletQty;
                    data.remainCSQty = item.remainCSQty;
                    data.fromLocations = item.fromLocations;

                } else if ($scope.showTop === "eaTop") {
                    data.eaQty = item.eaQty;
                    data.eaTopNum = item.eaTopNum;
                }

                param.data.push(data);
            })
            if ($scope.showTop === "csTop") {
                param.head = ["itemSpecName", "itemSpecDesc", "csQty", "palletQty", "remainCSQty", "csTopNum", "fromLocations"];
            } else if ($scope.showTop === "eaTop") {
                param.head = ["itemSpecName", "itemSpecDesc", "eaQty", "eaTopNum"];
            }

            $http.post("/wms-app/report/export", param, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "itemTop.xlsx");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        var sortMap = {};
        $scope.sortClick = function (key) {
            var sort = "asc";
            if (sortMap[key]) sort = sortMap[key];

            if (sort === "asc") sort = "desc";
            else sort = "asc";
            sortMap[key] = sort;

            $scope.itemTops = _.orderBy($scope.itemTops, [key], [sort]);
        };

        var isCheckAllTop = false;
        $scope.toggleAllTop = function () {
            _.forEach($scope.itemTops, function (item) {
                item.isChecked = false;
            });
            if (!isCheckAllTop) {
                _.forEach($scope.itemTops, function (item) {
                    item.isChecked = true;
                });
            }
            isCheckAllTop = !isCheckAllTop;
        };

        $scope.selectAllTopIsChecked = function () {
            return isCheckAllTop;
        };

        $scope.toggleTop = function ($event, item) {
            if (item.isChecked) item.isChecked = false;
            else item.isChecked = true;
        };


        function getCheckItemIds() {
            var ids = [];
            _.forEach($scope.itemTops, function (item) {
                if (item.isChecked) ids.push(item.id);
            });
            return ids;
        }

        $scope.removeTop = function () {
            var ids = getCheckItemIds();
            if (ids.length === 0) {
                lincUtil.errorPopup("Please select item first!");
                return;
            }
            $scope.deleting = true;
            orderService.deleteOrderItemTop(ids).then(function (res) {
                $scope.deleting = false;
                lincUtil.messagePopup("Success!");
                getItemTop();

            }, function (error) {
                $scope.deleting = false;
                lincUtil.errorPopup(error);
            })
        };


        $scope.addItemPreferedPickVLG = function () {
            var templateUrl = 'wms/outbound/order-plan/template/addItemPreferedPickVLG.html';
            lincUtil.popupBodyPage(addItemPreferedPickVLGCtrl
                , templateUrl, null, {
                }).then(function () {
                   
                    getItemPreferedPickVLG();
                });
        }

        $scope.VLGparam = { flag: false };
        $scope.VLGChange = function () {

            orderService.setUseVLG($scope.VLGparam.flag).then(function (response) {
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        };


        function getItemPreferedPickVLG() {

            orderService.getItemPreferedPickVLG().then(function (response) {
                $scope.itemVirtualLocationGroups = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

    }

    orderSelectPageController.$inject = ['$scope', '$http', 'lincUtil', 'orderService'];

    return orderSelectPageController;
});
