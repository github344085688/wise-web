'use strict';

define(['angular', 'lodash'], function (angular, _) {
  var controller = function ($scope, $state, $resource, session, monitorService, $interval, lincUtil, conveyorService) {


    $scope.click = function (id) {
      $state.go('cl.conveyorDashboard.line', { lineId: id });
    }


    function searchpackingStation (param) {
      conveyorService.converyLineSearch(param).then(function (response) {
        $scope.lineList = response;
      }, function (error) {
        lincUtil.processErrorResponse(error);
      });
    }

    function getUserInfo () {
      session.getUserInfo().then(function (userInfo) {
        $scope.user = angular.copy(userInfo);
      });
    }

    function _init () {
      searchpackingStation({});
      getUserInfo();
    }

    _init();





  };

  controller.$inject = ['$scope', '$state', '$resource', 'session', 'monitorService', '$interval', 'lincUtil', 'conveyorService'];
  return controller;
});