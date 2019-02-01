'use strict';

define(['angular', 'lodash'], function (angular, _) {
  var controller = function ($scope, $state, facilityEquipmentService, lincUtil, $stateParams) {

    $scope.param = {};
    $scope.id = $stateParams.id;

    function getFacilityEquipment () {
      $scope.isReady = false;
      facilityEquipmentService.getFacilityEquipment($stateParams.id).then(function (response) {
        $scope.param = response;
        $scope.isReady = true;
      }, function (error) {
        lincUtil.processErrorResponse(error);
        $scope.isReady = true;
      });
    }

    function init () {
      if ($stateParams.id) {
        getFacilityEquipment();
        $scope.submitLabel = 'Update';
      }
      else {
        $scope.submitLabel = 'Save';
      }
    }
    init();


    $scope.addOrUpdateFacilityEquipment = function () {
      if ($stateParams.id) {
        updateFacilityEquipment($scope.param);
      } else {
        createFacilityEquipment($scope.param);
      }
    }

    function updateFacilityEquipment (param) {
      $scope.loading = true;
      facilityEquipmentService.updateFacilityEquipment(param).then(function (response) {
        lincUtil.messagePopup("Success", "Update Successful");
        $state.go("cf.facility.resource.equipment.list");
        $scope.loading = false;
      }, function (error) {
        lincUtil.processErrorResponse(error);
        $scope.loading = false;
      });
    }

    function createFacilityEquipment (param) {
      $scope.loading = true;
      facilityEquipmentService.createFacilityEquipment(param).then(function (response) {
        lincUtil.messagePopup("Success", "Create Successful");
        $state.go("cf.facility.resource.equipment.list");
        $scope.loading = false;
      }, function (error) {
        lincUtil.processErrorResponse(error);
        $scope.loading = false;
      });
    }

    $scope.cancel = function () {
      $state.go("cf.facility.resource.equipment.list");
    }

  };
  controller.$inject = ['$scope', '$state', 'facilityEquipmentService', 'lincUtil', '$stateParams'];
  return controller;
});
