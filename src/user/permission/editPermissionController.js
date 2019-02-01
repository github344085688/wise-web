'use strict';

define(['lodash'], function(_) {
    var ctrl = function($scope, $state,$mdDialog,  lincUtil, permissionService, permissionId) {
        var ctrl = this;

        $scope.isAddAction = permissionId ? false:true;

        $scope.saveOrUpdate = function () {

            if ($scope.isAddAction) {
                permissionService.save($scope.permission).then(function(res){
                    $scope.permission.id = res.id;
                    $mdDialog.hide({"permission":$scope.permission});
                }, function(err){
                    lincUtil.processErrorResponse(err);
                });
            } else {
                permissionService.update($scope.permission).then(function(){
                    lincUtil.updateSuccessfulPopup();
                }, function(err){
                    lincUtil.processErrorResponse(err);
                });
            }

        };


        $scope.cancel = function(){
            $mdDialog.hide();
        };


        function _init_(){
            $scope.permission = {category:"WEB", groupName: "Other"};
            if(permissionId) {
                permissionService.get(permissionId).then(function(res){
                    $scope.permission = res[0];
                    _.forEach(res, function(rp){
                        if (permissionId === rp.permissionId) {
                            $scope.permission = rp;
                        }
                    })
                }, function(err){
                    lincUtil.processErrorResponse(err);
                });
            }
        }

        _init_();

        $scope.availablePermissions = ["RECEIPT_EDIT","RECEIPT_REOPEN","ORDER_REOPEN","ORDER_EDIT","USER_MANAGEMENT"];


    };
    ctrl.$inject = ['$scope', '$state','$mdDialog', 'lincUtil', 'permissionService', 'permissionId'];
    return ctrl;
});
