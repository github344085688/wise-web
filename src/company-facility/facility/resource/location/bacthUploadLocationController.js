'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog,checkAllLocationIds,locationService,lincUtil) {

        $scope.location={};

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function () {
            $scope.saving=true;
            var param={
                locationIds:checkAllLocationIds,
                tenantIds:$scope.location.tenantIds  
                      }
            locationService.updateLocationTenant(param).then(function(response){
                $scope.saving=false;
                lincUtil.saveSuccessfulPopup();
                $mdDialog.hide();
            },function(error){
                $scope.saving=false;
                $scope.errorMsg="Error:" + error.data.error;
            })
        };


    };
    controller.$inject = ['$scope', '$mdDialog', 'checkAllLocationIds','locationService','lincUtil'];
    return controller;
});