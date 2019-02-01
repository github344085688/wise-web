'use strict';

define([
  'angular',
  'lodash',
  './equipmentEditController'
], function (angular, _, equipmentEditController) {
  var controller = function ($scope, $state, lincUtil, facilityEquipmentService, $mdDialog) {

    $scope.searchParam = {};


    $scope.search = function () {
      var searchParam = angular.copy($scope.searchParam);
      searchFacilityEquipment(searchParam);
    };


    function searchFacilityEquipment (param) {
      $scope.loading = true;
      facilityEquipmentService.searchFacilityEquipment(param).then(function (response) {
        $scope.facilityEquipments = response;
        $scope.loading = false;
      }, function (error) {
        $scope.loading = false;
        lincUtil.processErrorResponse(error);
      });
    }

    function _init () {
      searchFacilityEquipment({});
    }

    _init();

    $scope.delete = function (id) {
      lincUtil.deleteConfirmPopup('Would you like to remove this equipment', function () {
        facilityEquipmentService.deleteFacilityEquipment(id).then(function () {
          lincUtil.messagePopup("Message", "Delete Successful.");
          searchFacilityEquipment({});
        }, function (error) {
          lincUtil.processErrorResponse(error);
        });
      });
    };

  };

  controller.$inject = ['$scope', '$state', 'lincUtil', 'facilityEquipmentService', '$mdDialog'];
  return controller;
});