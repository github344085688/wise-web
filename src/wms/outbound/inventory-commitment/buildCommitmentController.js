'use strict';

define([
    'angular',
    'lodash',
    './batchCommitmentNoController'
], function (angular, _, batchCommitmentNoController) {
    var controller = function ($scope, $state, $mdDialog, $http, orderService, organizationService, lincUtil,
        inventoryCommitmentService, addressService) {
        $scope.order = {};
        $scope.pageObj = {pageSize:10, currentPage:1};
        $scope.submitLabel = "Commit";
        var searchInfo = {};
        $scope.commit = function () {
            var orderIds = _.map($scope.checkedOrders, 'id');
            var customerIds = _.uniq(_.map($scope.checkedOrders, 'customerId'));
            var longHaul = $scope.searchParam.longHaul ? $scope.searchParam.longHaul : [];
            if (!validateCheckOrders(orderIds)) return;
            var dialog = {
                templateUrl: 'wms/outbound/inventory-commitment/template/batchCommitmentNo.html',
                autoWrap: true,
                locals: {
                    selectedOrdersCount: orderIds.length,
                    longHaul: longHaul,
                    customerIds: customerIds
                },
                controller: batchCommitmentNoController
            };

            $mdDialog.show(dialog).then(function (response) {
                var data = {
                    orderIds: orderIds,
                    batchCommitmentNo: response.batchCommitmentNo,
                    longHaulId: response.longHaulId,
                    scheduleDate: response.scheduleDate
                };

                buildCommitment(data);
            });
        };
        function buildCommitment(data) {
            $scope.loading = true;
            inventoryCommitmentService.buildCommitment(data).then(function () {
                inventoryCommitmentService.commitmentCheckExpirationdate(data.orderIds).then(function(response){
                    lincUtil.popUpWithHtml("<span style='display: block;font-size: 16px;'>Commit Successful! (batchCommitmentNo: " + data.batchCommitmentNo + " )</span>", function () {
                        $state.go("wms.outbound.inventoryCommitment.commitmentReport", {batchCommitmentNo: data.batchCommitmentNo});
                    });
                },function(error){
                    $scope.loading = false;
                    lincUtil.popUpWithHtml("<span style='display: block;font-size: 16px;'>Commit Successful! (batchCommitmentNo: " + data.batchCommitmentNo + " )</span>"+"<span style='color:red';font-size: 16px;>Warning:"+error.data.error+"</span>", function () {
                        $state.go("wms.outbound.inventoryCommitment.commitmentReport", {batchCommitmentNo: data.batchCommitmentNo});
                    });
                });
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        function validateCheckOrders(orderIds) {
            if (orderIds.length === 0) {
                lincUtil.messagePopup("Tip", "Please choose at least one order!");
                return false;
            } else
                return true;
        }

        $scope.searchOrders = function (searchParam) {
            if (searchParam.confirmedLH) {
                searchParam.longHaulIds = _.map(searchParam.longHaul, 'id');
            }else{
                searchParam.longHaulNos = _.map(searchParam.longHaul, 'longHaulNo');
            }
            searchInfo = searchParam;
            $scope.loadContent(1);

        };

        $scope.loadContent = function (currentPage) {
            var param = angular.copy(searchInfo);
            if (!param.statuses || param.statuses.length === 0) {
                param.statuses = ["Imported", "Open", "Partial Committed", "Commit Blocked", "Commit Failed"];
            }

            $scope.isLoading = true;
            $scope.pageObj.currentPage = currentPage;
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize) };
            clearSelected();
            orderService.searchOrderForCommitment(param).then(function (response) {
                $scope.isLoading = false;
                $scope.orders = response.orders;
                $scope.orderItemLineMap = response.orderItemLineMap;
                $scope.itemMap = response.itemMap;
                $scope.organizations = response.organizations;
                $scope.customerMap = response.customerMap;
                $scope.paging = response.paging;

            }, function (err) {
                $scope.isLoading = false;
                lincUtil.errorPopup("Error:" + err.data.error);
            });
        };

        function clearSelected() {
            $scope.totalSelectWeight = 0;
            $scope.checkedOrders = [];
        }

        $scope.selectAll = function () {
            if ($scope.checkedAll) {
                $scope.checkedOrders = [];
                $scope.checkedAll = false;
            } else {
                $scope.checkedOrders = _.uniqBy($scope.orders, 'id');
                $scope.checkedAll = true;
            }
            $scope.totalSelectWeight = orderService.calcOrderWeights($scope.checkedOrders);
        };

        $scope.isChecked = function (order) {
            return _.find($scope.checkedOrders, order);
        };

        $scope.checkOrUncheck = function (order) {
            var index = _.findIndex($scope.checkedOrders, function (o) {
                return o.id === order.id;
            });
            if (index > -1) {
                _.remove($scope.checkedOrders, function (checkedOrder) {
                    return checkedOrder.id === order.id;
                });
                $scope.checkedAll = false;
            } else {
                $scope.checkedOrders.push(order);
            }
            $scope.totalSelectWeight = orderService.calcOrderWeights($scope.checkedOrders);
        };


        $scope.viewOrCloseDetail = function (viewOrClose) {
            if (viewOrClose === 'View') {
                for (var i = 0; i < $scope.orders.length; i++)
                    $scope['in' + i] = 'in';
                $scope.viewOrClose = 'Close';
            } else {
                for (var j = 0; j < $scope.orders.length; j++)
                    $scope['in' + j] = '';
                $scope.viewOrClose = 'View';
            }
        };

        $scope.getIn = function (index) {
            return $scope['in' + index];
        };

        $scope.showIn = function (index) {
            if (typeof ($scope['in' + index]) === 'undefined' || $scope['in' + index] === '') {
                $scope['in' + index] = 'in';
            } else {
                $scope['in' + index] = '';
            }
        };

        function _init() {
            $scope.loadContent(1);
            $scope.checkedOrders = [];
            $scope.viewOrClose = 'View';
        }
        _init();

        $scope.getData = function () {
            return $scope.dataList;
        };

        $scope.getAddressInfo = function (addressObject) {
            return addressService.generageAddressData(addressObject, null);
        };

        $scope.downLoadLongHaulData = function () {
            var searchParam = {};
            if ($scope.searchParam) {
                searchParam = angular.copy($scope.searchParam);
            }
            if (searchParam.confirmedLH) {
                searchParam.longHaulIds = _.map(searchParam.longHaul, 'id');
            }else{
                searchParam.longHaulNos = _.map(searchParam.longHaul, 'longHaulNo');
            }
            if (!searchParam.statuses || searchParam.statuses.length === 0) {
                searchParam.statuses = ["Imported", "Open", "Partial Committed", "Commit Blocked", "Commit Failed"];
            }

            if ($scope.exporting) return;
            $scope.exporting = true;

            $http.post("/wms-app/outbound/order/export-with-longhaul", searchParam, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }

                lincUtil.exportFile(res, "longhaulData.xls");

                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };

        $scope.judgeHasEmptyLPTemplateWithCustomerSetting = function(order){
          var forceUseLPTemplate =  $scope.customerMap[order.customerId].forceUseLPTemplate;
          if(forceUseLPTemplate){
             var ret =  _.find($scope.orderItemLineMap[order.id],function(orderItemLine){
                return  !orderItemLine.lpConfigurationId;
             })
            if(ret){
                return true;
            }else{
                return false;
            }
          }
          return false;
        }

    };

    controller.$inject = ['$scope', '$state', '$mdDialog', '$http', 'orderService', 'organizationService', 'lincUtil',
        'inventoryCommitmentService', 'addressService'];

    return controller;
});
