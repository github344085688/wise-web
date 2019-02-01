'use strict';

define(['angular','lodash'], function(angular, _) {
    var ctrl = function($scope, $stateParams, itemPropertyService, lincUtil, isAddAction, $mdDialog, $state) {
        var ctrl = this;
        ctrl.isAddAction = isAddAction;
        var originalItemProperty;

        ctrl.propertyTypes = ["Text", "Number", "Select", "Date"];
        ctrl.itemProperty = { "type": "Text" };

        if (ctrl.isAddAction) {
            $scope.submitLabel = "Save";
            ctrl.itemProperty = { "type": "Text" };
        } else {
            $scope.submitLabel = "Update";
            itemPropertyService.getPropertyById($stateParams.itemPropertyId).then(function(data) {
                ctrl.itemProperty = data;
                originalItemProperty = angular.copy(data);
            });
        }

        ctrl.addOrUpdateItemProperty = function() {
            $scope.loading = true;
            if (ctrl.isAddAction) {
                itemPropertyService.addItemProperty(ctrl.itemProperty).then(function(res) {
                    $scope.loading = false;
                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go('fd.item.itemProperty.list');
                    });
                },function(error) {
                    $scope.loading = false;
                    lincUtil.errorPopup('Update Error! ' + error.data.error);
                });
            } else {
                itemPropertyService.updateItemProperty(ctrl.itemProperty).then(function(res) {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go('fd.item.itemProperty.list');
                    });
                },function(error) {
                    $scope.loading = false;
                    lincUtil.errorPopup('Update Error! ' + error.data.error);
                });
            }
        };

        ctrl.changeType = function(){
            ctrl.itemProperty.unitType="";
            ctrl.itemProperty.options=[];
        };

        ctrl.cancelEditItemProperty = function(){
            $state.go('fd.item.itemProperty.list');
        };

        function afterSuccess() {
            var alertWindow = $mdDialog.alert()
                .title('success')
                .textContent('success!!!')
                .ok('OK');
            $mdDialog.show(alertWindow);
        }
    };
    ctrl.$inject = ['$scope', '$stateParams', 'itemPropertyService', 'lincUtil', 'isAddAction', '$mdDialog', '$state'];
    return ctrl;
});
