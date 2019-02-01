'use strict';

define([
    'angular'
], function (angular) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemService) {
        var ctrl = this;
        var itemSpecId;
        var pickRuleId;
        $scope.isShowRemoveBtn = false;
        initPickRule();
        function initPickRule() {
            $scope.pickRule = {};
            itemSpecId = $stateParams.itemSpecId;
            itemService.searchPickRules({ itemSpecIds: [itemSpecId] }).then(function (response) {
                if (response && response.length > 0) {
                    $scope.submitLabel = "Update";
                    $scope.pickRule = response[0];
                    pickRuleId = response[0].id;
                    $scope.isShowRemoveBtn = true;
                } else
                    $scope.submitLabel = "Save";

            });
        }

        ctrl.saveOrUpdatePickRule = function () {
            $scope.loading = true;
            if ($scope.pickRule.id) {
                itemService.updatePickRule($scope.pickRule).then(function (response) {
                    $scope.loading = false;
                    $scope.isShowRemoveBtn = true;
                    lincUtil.updateSuccessfulPopup();

                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            } else {
                $scope.pickRule.itemSpecId = itemSpecId;
                itemService.addPickRule($scope.pickRule).then(function (response) {
                    $scope.loading = false;
                    $scope.submitLabel = "Update";
                    $scope.isShowRemoveBtn = true;
                    $scope.pickRule.id = pickRuleId = response.id;
                    lincUtil.saveSuccessfulPopup();

                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        };

        ctrl.searchAvailableItemUnits = function () {
            itemService.searchItemUnits({ itemSpecId: itemSpecId }).then(function (response) {
                $scope.units = response.units;
                $scope.unitIdMap = response.unitsMap;
            });
        };

        ctrl.removeItemPickRule = function () {
            lincUtil.deleteConfirmPopup('Are you sure to delete this record?', function () {
                itemService.removePickRule(pickRuleId).then(function () {
                    $scope.isShowRemoveBtn = false;
                    $scope.submitLabel = "Save";
                    $scope.pickRule = {};
                    resetForm();
                });
            });

        };


        function resetForm() {
            $scope.forms.pickRuleForm.$setPristine();
            $scope.forms.pickRuleForm.$setUntouched();
        }
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemService'];

    return controller;
});
