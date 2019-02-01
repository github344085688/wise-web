'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $resource, $mdDialog, receiptService, loadsService, lincUtil, appointmentService) {
        var ctrl = this;
        var entryType = ctrl.entryType;
        var totalRecordCount = 0;
        function init() {
            $scope.recordList = [];
            if (entryType === 'Load') {
                getLoads({});
            } else if (entryType === 'Receipt') {
                getReceipts({});
            }
        }
        init();

        $scope.toggleSelection = function (recordId) {
            if (recordId) {
                if (ctrl.selectedRecordIds.indexOf(recordId) > -1) {
                    _.remove(ctrl.selectedRecordIds, function (n) {
                        return n === recordId;
                    });

                    if (ctrl.selectedRecordIds.length !== totalRecordCount) {
                        $scope.selectAll = false;
                    }
                } else {
                    ctrl.selectedRecordIds.push(recordId);

                    if (ctrl.selectedRecordIds.length === totalRecordCount) {
                        $scope.selectAll = true;
                    }
                }
            } else {
                if ($scope.selectAll) {
                    ctrl.selectedRecordIds = [];
                    $scope.selectAll = false;
                } else {
                    ctrl.selectedRecordIds = _.map($scope.recordList, 'id');
                    $scope.selectAll = true;
                }
            }
        };

        $scope.searchLoads = function (searchParam) {
            getLoads(searchParam);
        };
        
        function getLoads(searchParam) {
            searchParam.statuses = ["New"];
            searchParam.scenario = 'Appointment';
            loadsService.searchLoad(searchParam).then(function (response) {
                if (response.error) {
                    lincUtil.errorPopup("Error Found:" + response.error);
                    return;
                }
                $scope.recordList = response;
                totalRecordCount = response.length;
            }, function (error) {
                lincUtil.errorPopup("Error:" + error.data.error);
            });
        }

        $scope.searchReceipts = function (searchParam) {
            getReceipts(searchParam);
        };

        function getReceipts(searchParam) {
            searchParam.scenario = 'Appointment';
            searchParam.excludeStatuses = ["Closed","Force Closed","Cancelled"]
            receiptService.searchReceipt(searchParam).then(function (response) {
                if (response.error) {
                    lincUtil.errorPopup("Error Found:" + response.error);
                    return;
                }
                $scope.recordList = response;
                totalRecordCount = response.length;
            }, function (error) {
                lincUtil.errorPopup("Error:" + error.data.error);
            });
        }

        $scope.confirm = function () {
            if (ctrl.selectedRecordIds.length === 0) {
                window.alert("Please select an record at lease!");
            } else {
                var param = {};
                if (entryType === 'Load') {
                    param.loadIds = ctrl.selectedRecordIds;
                    loadsService.searchLoad(param).then(function (response) {
                        if (response.error) {
                            lincUtil.errorPopup("Error Found:" + response.error);
                            return;
                        }
                        var selectedRecords = _.filter(response, function (record) {
                            return ctrl.selectedRecordIds.indexOf(record.id) > -1;
                        });
                        $mdDialog.hide(selectedRecords);
                    }, function (error) {
                        lincUtil.errorPopup("Error:" + error.data.error);
                    });

                } else if (entryType === 'Receipt') {
                    param.receiptIds = ctrl.selectedRecordIds;
                    receiptService.searchReceipt(param).then(function (response) {
                        if (response.error) {
                            lincUtil.errorPopup("Error Found:" + response.error);
                            return;
                        }
                        var selectedRecords = _.filter(response, function (record) {
                            return ctrl.selectedRecordIds.indexOf(record.id) > -1;
                        });
                        $mdDialog.hide(selectedRecords);
                    }, function (error) {
                        lincUtil.errorPopup("Error:" + error.data.error);
                    });
                }
            }
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    };

    controller.$inject = ['$scope', '$resource', '$mdDialog', 'receiptService', 'loadsService', 'lincUtil', 'appointmentService'];

    return controller;
});
