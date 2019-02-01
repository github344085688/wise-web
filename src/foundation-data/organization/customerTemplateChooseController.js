'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, customerId, customerTemplateService, lincUtil) {

        $scope.params = {};
        $scope.params.customerId = customerId;
        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.clone = function () {
            $scope.loading = true;
            customerTemplateService.getCustomerTemplate($scope.params.id).then(function(res){
               var CustomerTemplateView = res;
               $scope.loading = false;
               $mdDialog.hide(CustomerTemplateView.templateView);
            },function(error){
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        function init () {
            customerTemplateService.searchCustomerTemplate({}).then(function (res) {
                $scope.customerTemplateList = res;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }
        init();

    };
    controller.$inject = ['$scope', '$mdDialog', 'customerId', 'customerTemplateService', 'lincUtil'];
    return controller;
});
