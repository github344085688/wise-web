'use strict';

define(["lodash"], function(_) {
    var controller = function($scope, $http, ediService, lincUtil, $stateParams) {

      $scope.ediId = $stateParams.ediId;

        function getEdiView(ediId) {
            ediService.getEdiView(ediId).then(function(data) {
                $scope.ediView = data;
            }, function(error) {
                lincUtil.errorPopup(error);
            });
        }

        function _init() {
            getEdiView($scope.ediId);
        }

        _init();
    };
    controller.$inject = ['$scope', '$http', 'ediService', 'lincUtil', '$stateParams'];
    return controller;
});
