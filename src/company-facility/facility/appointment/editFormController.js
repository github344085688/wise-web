'use strict';

define(['lodash', 'moment'], function (_, moment) {
    var controller = function ($scope, $state, $stateParams, appointmentService, loadsService, receiptService, $mdDialog, lincUtil) {
        function init() {
            if (!$stateParams.type || !$stateParams.dateTime) {
                $state.go('cf.facility.appointment');
            }
            var appointmentId = $stateParams.appointmentId;
            var dateTime = moment($stateParams.dateTime).format('YYYY-MM-DDTHH:mm:ss');

            $scope.paging = { "pageSize": 10 };
            $scope.pageSize = 10;
            $scope.isNew = appointmentId === 'new';
            $scope.appointmentType = $stateParams.type;
            $scope.selectedLoads = [];
            $scope.selectedReceipts = [];

            if ($scope.isNew) {
                $scope.submitLabel = "Save";
                $scope.currentItem = { appointmentTime: dateTime, type: $stateParams.type };
            } else {
                $scope.submitLabel = "Update";
                appointmentService.getAppointmentById(appointmentId).then(function (appointment) {
                    $scope.currentItem = appointment;
                    if (appointment.documentNos && appointment.documentNos.length > 0) {
                        initLoadReceiptList(appointment.documentNos);
                    }
                    if ($stateParams.type === 'Outbound') {
                        $scope.currentItem.entryType = 'Load';
                    } else if ($stateParams.type === 'Inbound') {
                        $scope.currentItem.entryType = 'Receipt';
                    }
                });
            }
        }

        function initLoadReceiptList(ids) {
            var param = {};
            if ($stateParams.type === 'Outbound') {
                param.loadIds = ids;
                loadsService.searchLoad(param).then(function (response) {
                    if (response.error) {
                        lincUtil.errorPopup("Error Found:" + response.error);
                        return;
                    }
                    $scope.selectedLoads = response;
                    $scope.loadRelevanceLoads(1);
                }, function (error) {
                    lincUtil.errorPopup("Error:" + error.data.error);
                });

            } else if ($stateParams.type === 'Inbound') {
                param.receiptIds = ids;
                receiptService.searchReceipt(param).then(function (response) {
                    if (response.error) {
                        lincUtil.errorPopup("Error Found:" + response.error);
                        return;
                    }
                    $scope.selectedReceipts = response;
                    $scope.loadRelevanceReceipts(1);
                }, function (error) {
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
            }
        }
        init();

        $scope.addLoad = function () {
            $mdDialog.show({
                templateUrl: 'company-facility/facility/appointment/template/loadList.html',
                controller: 'linc.cf.facility.appointment.loadReceiptListController',
                controllerAs: 'ctrl',
                locals: {
                    entryType: 'Load',
                    selectedRecordIds: _.map($scope.selectedLoads, 'id')
                },
                bindToController: true
            }).then(function (selectedLoads) {
                var list = _.map(selectedLoads, 'customerId');
                var list1 = _.union(list);
                if (list1.length > 1){
                    lincUtil.errorPopup("Error: Customer is diff");
                    return;
                }
                if (selectedLoads && selectedLoads.length > 0) {
                    $scope.selectedLoads = _.sortBy($scope.selectedLoads.concat(selectedLoads), 'id');
                    $scope.selectedLoads = _.uniqBy($scope.selectedLoads, 'id');
                    $scope.loadRelevanceLoads(1);
                    $scope.currentItem.documentNos = _.map($scope.selectedLoads, 'id');
                    $scope.currentItem.entryType = "Load";
                }
            });
        };

        $scope.removeLoad = function (id) {
            _.remove($scope.selectedLoads, function (load) {
                return load.id === id;
            });
            _.remove($scope.selectedLoadView, function (load) {
                return load.id === id;
            });
            $scope.currentItem.documentNos = _.map($scope.selectedLoads, 'id');
            $scope.currentItem.entryType = "Load";
        };

        $scope.addReceipt = function () {
            $mdDialog.show({
                templateUrl: 'company-facility/facility/appointment/template/receiptList.html',
                controller: 'linc.cf.facility.appointment.loadReceiptListController',
                controllerAs: 'ctrl',
                locals: {
                    entryType: 'Receipt',
                    selectedRecordIds: _.map($scope.selectedReceipts, 'id')
                },
                bindToController: true
            }).then(function (selectedReceipts) {
                var list = _.map(selectedReceipts, 'customerId');
                var list1 = _.union(list);
                if (list1.length > 1){
                    lincUtil.errorPopup("Error: Customer is diff");
                    return;
                }
                if (selectedReceipts && selectedReceipts.length > 0) {
                    $scope.selectedReceipts = _.sortBy($scope.selectedReceipts.concat(selectedReceipts), 'id');
                    $scope.selectedReceipts = _.uniqBy($scope.selectedReceipts, 'id');
                    $scope.loadRelevanceReceipts(1);
                    $scope.currentItem.documentNos = _.map($scope.selectedReceipts, 'id');
                    $scope.currentItem.entryType = "Receipt";
                }
            });
        };

        $scope.removeReceipt = function (id) {
            _.remove($scope.selectedReceipts, function (receipt) {
                return receipt.id === id;
            });
            _.remove($scope.selectedReceiptView, function (receipt) {
                return receipt.id === id;
            });
            $scope.currentItem.documentNos = _.map($scope.selectedReceipts, 'id');
            $scope.currentItem.entryType = "Receipt";
        };

        var discardConfirm = function (callback, param) {
            var dialog = $mdDialog.confirm()
                .title('Confirm')
                .textContent('Do you want to discard the changes of current appointment?')
                .ok('Yes')
                .cancel('No');

            if ($scope.editForm.$dirty) {
                $mdDialog.show(dialog).then(function () {
                    callback(param);
                });
            } else {
                callback(param);
            }
        };


        $scope.loadRelevanceReceipts = function (currentPage) {
            $scope.selectedReceiptView = $scope.selectedReceipts.slice((currentPage - 1) * $scope.paging.pageSize, currentPage * $scope.paging.pageSize);
        };

        $scope.loadRelevanceLoads = function (currentPage) {
            $scope.selectedLoadView = $scope.selectedLoads.slice((currentPage - 1) * $scope.paging.pageSize, currentPage * $scope.paging.pageSize);
        };


        $scope.submit = function () {
            if(!validateAppointTime()) return;
            $scope.loading = true;
            if($scope.selectedLoads.length > 0)
            $scope.currentItem.customerId = $scope.selectedLoads[0].customerId;
            if($scope.selectedReceipts.length > 0)
            $scope.currentItem.customerId = $scope.selectedReceipts[0].customerId;
            if ($scope.isNew) {
    
                appointmentService.addAppointment($scope.currentItem).then(function (response) {
                    $scope.loading = false;
                    if (response.error) {
                        lincUtil.errorPopup("Error Found:" + response.error);
                        return;
                    }
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.transitionTo('cf.facility.appointment.makeAppointment', {}, { reload: true });
                    });

                }, function (error) {
                    $scope.loading = false;
                    lincUtil.errorPopup("Error:" + error.data.error);
                });
            } else {
                //edit
                appointmentService.updateAppointment($stateParams.appointmentId, $scope.currentItem).then(function (response) {
                    $scope.loading = false;
                    if (response.error) {
                        lincUtil.errorPopup("Error Found:" + response.error);
                        return;
                    }
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.transitionTo('cf.facility.appointment.makeAppointment', {}, { reload: true });
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.errorPopup("Error:" + error.data.error);
                });

            }
        };

       function validateAppointTime(){
             var isValidate = true;
            if( !$scope.currentItem.documentNos || $scope.currentItem.documentNos.length === 0 ){
                if( $stateParams.type === 'Inbound'){
                    isValidate = false;
                    lincUtil.errorPopup('Select at least one receipt!');
                }else{
                    isValidate = false;
                    lincUtil.errorPopup('Select at least one load!');
                }
            }
            return isValidate;
        }

        $scope.cancel = function () {
            discardConfirm(function () {
                $state.transitionTo('cf.facility.appointment.makeAppointment', {}, { reload: true });
            });
        };
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'appointmentService', 'loadsService', 'receiptService', '$mdDialog', 'lincUtil'];

    return controller;
});
