'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function($scope, $resource, $mdDialog, $http, inventoryCommitmentService, lincUtil,$stateParams) {
        $scope.submitLabel = "Commitment RollBack";
        var originalOrderList = [];
        $scope.pageSize = 10;
        $scope.selectedStatus = 'All';
        $scope.orderList = originalOrderList;
        $scope.selectedOrders = [];
        $scope.orders = [];
        $scope.currentPage = 1;
        $scope.searchParam = {statuses:['Committed', 'Partial Committed', 'Commit Blocked', 'Commit Failed']};


        $scope.loadContent = function (currentPage, isSearch) {
            if(isSearch) {
                $scope.searchLoading = true;
            }
            $scope.isLoading = true;
            $scope.currentPage = currentPage;
            var param = angular.copy(searchInfo);
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageSize)};
            inventoryCommitmentService.commitmentReport(param).then(function (response) {
                $scope.isLoading = false;
                if(isSearch) {
                    $scope.searchLoading = false;
                }
                $scope.orders = originalOrderList = response.orders;
                $scope.selectedOrders = [];
                $scope.paging = response.paging;
            }, function () {
                $scope.isLoading = false;
                if(isSearch) {
                    $scope.searchLoading = false;
                }
            });
        };
        var searchInfo = {};
        $scope.searchOrders = function(searchParam) {
            if (searchParam.confirmedLH) {
                searchParam.longHaulIds = _.map(searchParam.longHaul, 'id');
            }else{
                searchParam.longHaulNos = _.map(searchParam.longHaul, 'longHaulNo');
            }
            searchInfo = searchParam;
            $scope.loadContent(1, true);
        };

        $scope.onSelectedStatusChange = function(selectedStatus) {
            if (selectedStatus !== 'All') {
                $scope.orderList = _.filter(originalOrderList, { status: selectedStatus });
            } else {
                $scope.orderList = originalOrderList;
            }
        };
        
        $scope.selectedOrderToggle = function(item, list) {
            var index = _.findIndex(list, function (order) {
                return order.id == item.id;
            });
            if (index > -1) {
                list.splice(index, 1);
            } else {
                list.push(item);
            }
        };
        
        $scope.onSelectAll = function(){
            if($scope.isOrderAllSelected()) {
                $scope.selectedOrders = [];
            } else {
                $scope.selectedOrders = angular.copy($scope.orders);
            }
        };

        $scope.isOrderAllSelected = function() {
            if($scope.orders.length === 0 ) {
                return false;
            }
            return $scope.selectedOrders.length === $scope.orders.length;
        };

        $scope.orderExists = function(item, list) {
            var index = _.findIndex(list, function (order) {
                return order.id == item.id;
            });
            return index > -1? true : false;
        };

        $scope.commitmentRollback = function(form) {
            if ($scope.selectedOrders.length == 0) {
                lincUtil.messagePopup("Tip", "Please choose at least one order!");
                return;
            }

            var confirm = $mdDialog.confirm()
                .title('Confirmation')
                .textContent('Would you like to rollback the selected orders?')
                .ok('Yes')
                .cancel('No');

            $mdDialog.show(confirm).then(function() {
                _.each($scope.selectedOrders, function(order) {
                    originalOrderList = _.reject(originalOrderList, ['orderId', order.orderId]);
                });

                $scope.orderList = originalOrderList;
                var orderIds = _.map($scope.selectedOrders, 'id');
                $scope.loading = true;
                inventoryCommitmentService.commitmentRollback({orderIds: orderIds}).then(function () {
                    $scope.loading = false;
                    lincUtil.messagePopup("Confirm", "Rollback Successful!", function () {
                        $scope.selectedOrders = [];
                        $scope.loadContent(1, false);

                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.exportPDF = function() {
            window.alert('Export as PDF!');
        };

        $scope.exportExcel = function() {
            window.alert('Export as Excel!');
        };

        $scope.export = function (searchParam) {
            if (searchParam.confirmedLH) {
                searchParam.longHaulIds = _.map(searchParam.longHaul, 'id');
            }else{
                searchParam.longHaulNos = _.map(searchParam.longHaul, 'longHaulNo');
            }
            if ($scope.exporting) return;


            $scope.exporting = true;

            $http.post("/wms-app/outbound/order/export", searchParam, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "order.xls");
                $scope.exporting = false;

            }, function (error) {
                lincUtil.errorPopup(error);
                $scope.exporting = false;
            });
        };
        
        function init() {

            if ($stateParams.batchCommitmentNo) {
                searchInfo.batchCommitmentNo = $stateParams.batchCommitmentNo;
            }
            $scope.loadContent(1, false);
        }

        init();
    };

    controller.$inject = ['$scope', '$resource', '$mdDialog', '$http', 'inventoryCommitmentService', 'lincUtil' , '$stateParams'];


    return controller;
});
