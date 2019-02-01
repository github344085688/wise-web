'use strict';

define([
	'angular',
	'src/company-facility/facility/appointment/appointmentPageController',
	'src/company-facility/facility/appointment/editFormController',
	'src/company-facility/facility/appointment/loadReceiptListController',
	'src/company-facility/facility/appointment/editAppointmentSettingController',
    './appointmentScheduleController'
], function(angular, appointmentPageController, editFormController,
			loadReceiptListController, editAppointmentSettingController, appointmentScheduleController) {
	angular.module('linc.cf.facility.appointment',[])
	.config(['$stateProvider', function($stateProvider) {
		$stateProvider.state('cf.facility.appointment.edit', {
			url: '/edit/:appointmentId',
			params: {
				type: null,
				dateTime: null
			},
			templateUrl: 'company-facility/facility/appointment/template/editForm.html',
			controller: editFormController,
			data: {
				permissions: "facility::appointmentMake_write"
			}
		}).state('cf.facility.appointment.setting', {
			url: '/setting',
			templateUrl: 'company-facility/facility/appointment/template/editAppointmentSetting.html',
			controller: editAppointmentSettingController,
			data: {
				title: "Appointment Setting",
				permissions: "facility::appointmentSet_read"
			}
		}).state('cf.facility.appointment.makeAppointment', {
			url: '/makeAppointment',
			templateUrl: 'company-facility/facility/appointment/template/appointment.html',
			controller: 'linc.cf.facility.appointment.appointmentPageController',
			controllerAs: 'ctrl',
			data: {
                title: "Make Appointment",
				permissions: "facility::appointmentMake_read"
			}
		}).state('cf.facility.appointment.schedule', {
            url: '/schedule',
            views: {
                "unis-main@cf.facility.appointment.schedule": {
                    templateUrl: 'company-facility/facility/appointment/template/appointmentSchedule.html',
                    controller: 'linc.cf.facility.appointment.appointmentScheduleController'
                },
                "@":{
                    template:""
                },
                "unis@": {
                    templateUrl: 'common/template/unis-main.html',
                    controller: 'DefaultMainPageController'
                }
            },
            data: {
                title: "Appointment schedule",
                permissions: "facility::appointmentMake_read"
            }
        });
	}])
	.controller('linc.cf.facility.appointment.appointmentPageController', appointmentPageController)
	.controller('linc.cf.facility.appointment.loadReceiptListController', loadReceiptListController)
	.controller('linc.cf.facility.appointment.editAppointmentSettingController', editAppointmentSettingController)
     .controller('linc.cf.facility.appointment.appointmentScheduleController', appointmentScheduleController);
});