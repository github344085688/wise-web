'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var controller = function($scope, $mdDialog, order, orderService, lincResourceFactory) {
        _init();
        function _init() {
            $scope.statuses = ["Open", "Committed"];
            $scope.disableArr = [false, false];

            $scope.data = {status:"Open" };
            lincResourceFactory.getOrderStatus().then(function (response) {
                var statusList = response;
                var committedIndex = statusList.indexOf("Committed");
                var index = statusList.indexOf(order.status);
                if(index >= 0 && index <= committedIndex){
                    $scope.disableArr[1]= true;
                }
            });
        }

        $scope.submit = function()
        {
            $scope.loading = true;
            $scope.errorMessage = "";
            orderService.rollBackOrder(order.id, {status:$scope.data.status}).then(function (){
                $scope.loading = false;
                $mdDialog.hide();
            }, function (error) {
                $scope.loading = false;
                $scope.errorMessage = error.data.error;
            });
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

    };
    controller.$inject = ['$scope', '$mdDialog', "order", "orderService", "lincResourceFactory"];
    return controller;
});