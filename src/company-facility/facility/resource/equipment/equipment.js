'use strict';

define([
  'angular',
  'src/company-facility/facility/resource/equipment/equipmentListController',
  'src/company-facility/facility/resource/equipment/equipmentEditController'
], function (angular, equipmentListController, equipmentEditController) {
  angular.module('linc.cf.facility.resource.equipment', [])
    .config(['$stateProvider', function ($stateProvider) {
      $stateProvider.state('cf.facility.resource.equipment.list', {
        url: '/list',
        views: {
          "unis-main@cf.facility.resource.equipment.list": {
            templateUrl: 'company-facility/facility/resource/equipment/template/equipmentList.html',
            controller: 'EquipmentListController',
            controllerAs: "ctrl"
          },
          "@": {
            template: ""
          },
          "unis@": {
            templateUrl: 'common/template/unis-main.html',
            controller: 'DefaultMainPageController'
          }
        },
        data: {
          permissions: "facility::equipment_read"
        }
      }).state('cf.facility.resource.equipment.add', {
        url: '/add',
        views: {
          "unis-main@cf.facility.resource.equipment.add": {
            templateUrl: 'company-facility/facility/resource/equipment/template/equipmentEdit.html',
            controller: 'EquipmentEditController',
            controllerAs: "ctrl"
          },
          "@": {
            template: ""
          },
          "unis@": {
            templateUrl: 'common/template/unis-main.html',
            controller: 'DefaultMainPageController'
          }
        },
        data: {
          permissions: "facility::equipment_read"
        }
      }).state('cf.facility.resource.equipment.edit', {
        url: '/edit/:id',

        views: {
          "unis-main@cf.facility.resource.equipment.edit": {
            templateUrl: 'company-facility/facility/resource/equipment/template/equipmentEdit.html',
            controller: 'EquipmentEditController',
            controllerAs: "ctrl"
          },
          "@": {
            template: ""
          },
          "unis@": {
            templateUrl: 'common/template/unis-main.html',
            controller: 'DefaultMainPageController'
          }
        },
        data: {
          permissions: "facility::equipment_read"
        }
      });
    }])
    .controller("EquipmentListController", equipmentListController)
    .controller("EquipmentEditController", equipmentEditController);
});
