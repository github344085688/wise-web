'use strict';

define([
  'angular',
  'lodash'
], function (angular, _) {
  var controller = function ($scope, $http, $mdDialog, lincUtil) {

    $scope.changeSelectFile = function (element) {

      $scope.selectFile = element.files[0];
    };

    $scope.submit = function () {
      var data = new FormData();
      data.append("file", $scope.selectFile);

      $scope.isUploading = true;
      $http.post("/bam/outbound/load/import", data, {
        withCredentials: true,
        headers: { 'Content-Type': undefined },
        transformRequest: angular.identity
      }).then(function (res) {
        $scope.isUploading = false;
        var msg = res.data.message.replace(/<\/br>/g,"");
        msg = msg.replace("<br>","");
        lincUtil.popUpWithHtml(msg,function(){});
      }, function (error) {
        $scope.isUploading = false;
        lincUtil.processErrorResponse(error)
      });
    };
  };

  controller.$inject = ['$scope', '$http', '$mdDialog', 'lincUtil'];
  return controller;
});