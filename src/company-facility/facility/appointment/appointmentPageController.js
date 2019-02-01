'use strict';

define([
    'lodash',
    'moment',
    './chooseTypeController'
], function(_, moment,chooseTypeController) {
    var controller = function($scope, $state, appointmentService, session, $mdDialog, lincUtil) {
        var ctrl = this;
        $scope.datepickerOptions = {
            // minDate: new Date(),
            showWeeks: false
        };
        $scope.paging = { "pageSize": 10 }
     
        var setAppointmentHours = function() {
            var appointmentHours = [];
            var param = {};
            param.type = ctrl.activeTab === 'total' ? '' : ctrl.activeTab;
            param.facilityId = session.getCompanyFacility().facility.id;
            param.appointmentDate = moment(ctrl.appointmentDate).format('YYYY-MM-DD');
            $scope.appointmentDateFrom =moment(ctrl.appointmentDate).format('YYYY-MM-DDT00:00:00');
            $scope.loadAppointmentList(1);
            appointmentService.getAppointmentData(param).then(function(response) {
                /*             
                    response{
                        0:{appointmentNo:50,
                            total:60},
                            1:{appointmentNo:50,
                            total:60},
                            2:{appointmentNo:50,
                            total:60},
                            ...
                            23:{appointmentNo:50,
                            total:60}
                    }
                */
                for (var i = 0; i < 24; i++) {
                    var item = {};
                    if (i < 10) {
                        item.hour = '0' + i;
                    } else {
                        item.hour = '' + i;
                    }

                    item.available = response[i].appointmentNo;
                    item.total = response[i].total;

                    appointmentHours.push(item);
                }
                $scope.appointmentHours = appointmentHours;
            });
        };

        $scope.$watchGroup([function() {
            return ctrl.activeTab;
        }, function() {
            return ctrl.appointmentDate;
        }], setAppointmentHours);

        this.isTimeAvailable = function(index, obj) {
            return moment().isBefore(ctrl.appointmentDate.setHours(index)) && obj.available < obj.total;
        };

        $scope.loadAppointmentList = function(currentPage) {
            appointmentService.loadAppointmentList({
                loadStatuses:["Shipped"],
                 receiptStatuses:["Closed", "Force Closed"],
                 appointmentTimeFrom: $scope.appointmentDateFrom,
                 appointmentTimeTo: $scope.appointmentDateTo
            }).then(function(appointmentList) {
                $scope.appointmentList = appointmentList;
                $scope.appointmentView = $scope.appointmentList.slice((currentPage - 1) * $scope.paging.pageSize, currentPage * $scope.paging.pageSize);
            });
        };

        $scope.editAppointment = function(appointment) {
            var params = {
                appointmentId: appointment.id,
                type: appointment.type,
                dateTime: appointment.appointmentTime
            };
            $state.go('cf.facility.appointment.edit', params);
        };

        $scope.addAppointment = function(hour) {
            var type = ctrl.activeTab;
            var params = {
                appointmentId: 'new',
                type: type,
                dateTime: ctrl.appointmentDate.setHours(hour)
            };

            if (type === 'total') {
                $mdDialog.show({
                    templateUrl: 'company-facility/facility/appointment/template/chooseType.html',
                    locals: {
                        params: params,
                    },
                    controller: chooseTypeController
                });
            } else {
                $state.go('cf.facility.appointment.edit', params);
            }
        };

        $scope.removeAppointment = function(index) {
            lincUtil.deleteConfirmPopup('Would you like to cancel the this appointment?', function() {
                var appointment = $scope.appointmentView[index];
                appointmentService.removeAppointment(appointment.id).then(function(response) {
                    $scope.appointmentView.splice(index, 1);
                    var indexInList = _.findIndex($scope.appointmentList, function(item) {
                        return item.id == appointment.id;
                    });
                    $scope.appointmentList.splice(indexInList, 1);
                }, function(error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.clickTimeBlock =function(index,item){
            ctrl.selectedHour = index;
            $scope.appointmentDateFrom =moment(ctrl.appointmentDate).format('YYYY-MM-DDT'+item.hour +':00:00');
            $scope.appointmentDateTo =moment(ctrl.appointmentDate).format('YYYY-MM-DDT'+item.hour +':59:59');
            $scope.loadAppointmentList(1);
        };

        function init() {
            var today = new Date();
            ctrl.appointmentDate = today;
            ctrl.appointmentDate.setMinutes(0);
            ctrl.appointmentDate.setSeconds(0);
            $scope.appointmentDateFrom = moment(new Date()).format('YYYY-MM-DDT00:00:00') ;
            $scope.appointmentDateTo =  null;// 
            ctrl.activeTab = 'total';
            $scope.loadAppointmentList(1);
        }

        init();
    };

    controller.$inject = ['$scope', '$state', 'appointmentService','session', '$mdDialog', 'lincUtil'];

    return controller;
});
