/**
 * Created by Giroux on 2017/7/5.
 */

'use strict';

define([
    'angular',
    'lodash',
    './popUpdateFailedTrackingNoController'
], function (angular, _ ) {
    var trackingNoImportController = function ($scope, $http, $mdDialog, lincUtil, orderService) {

        $scope.changeSelectFile = function (element){
            
            $scope.selectFile  = element.files[0];
        };

        $scope.submit = function () {
            var data = new FormData();
            data.append("excelDataFile", $scope.selectFile);

            $scope.isUploading = true;
            $http.post("/wms-app/trackingNo-import", data, {
                withCredentials: true,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            }).then(function (res) {
                $scope.isUploading = false;
                lincUtil.messagePopup("Tracking No Import", "Import successful.")

            }, function (error) {
                $scope.isUploading = false;
                lincUtil.processErrorResponse(error)
            });
        };
    };

    trackingNoImportController.$inject = ['$scope', '$http', '$mdDialog', 'lincUtil', 'orderService'];
    return trackingNoImportController;
});