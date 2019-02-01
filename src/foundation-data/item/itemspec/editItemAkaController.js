'use strict';

define([
    'angular'
], function (angular, $) {
    var controller = function ($scope, $state, $stateParams, lincUtil, itemService) {
        var ctrl = this;
        $scope.submitLabel = "Create";
        var customerId;

        initItemAka();

        function initItemAka() {
            $scope.itemAka = {};
            if ($stateParams.itemSpecId) {
                getItem($stateParams.itemSpecId);
                itemService.itemAkaSearch({ itemSpecId: $stateParams.itemSpecId }).then(function (response) {
                    $scope.itemAkas = response.akas;
                    $scope.akaOrganizationMap = response.organizationMap;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }
        }

        ctrl.deleteItemAka = function (index) {
            lincUtil.deleteConfirmPopup('Are you sure to delete this record?', function () {
                itemService.removeItemAka($scope.itemAkas[index].id).then(function () {
                    //$scope.itemAkas.splice(index, 1);
                    itemAkaSaveCbFun();
                });
            });
        };

        ctrl.selectTags = function (name) {
            if (name == "Customer") {
                $scope.itemAka.organizationId = customerId;
            }
            else {
                $scope.itemAka.organizationId = null;
            }

        };

        ctrl.saveOrUpdateItemAka = function () {
            if ($scope.itemAka.id) {
                $scope.loading = true;
                itemService.updateItemAkaById($scope.itemAka.id, $scope.itemAka).then(function (response) {
                    $scope.loading = false;
                    lincUtil.saveSuccessfulPopup(itemAkaSaveCbFun);
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            } else {
                $scope.itemAka.itemSpecId = $scope.item.id;
                $scope.loading = true;
                itemService.addItemAka($scope.itemAka).then(function (response) {
                    $scope.loading = false;
                    lincUtil.saveSuccessfulPopup(itemAkaSaveCbFun);
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        };

        ctrl.editItemAka = function (index) {
            resetHighLight();
            $scope.hightLights[index] = true;

            $scope.itemAka = angular.copy($scope.itemAkas[index]);
            $scope.submitLabel = "Update";
        };

        ctrl.resetItemAka = function (form) {
            $scope.itemAka = {};
            resetForm(form);
        };

        function resetHighLight() {
            $scope.hightLights = [];
        }

        function itemAkaSaveCbFun() {
            resetForm();
            initItemAka();
        }

        function getItem(id) {
            itemService.getItemById(id).then(function (data) {

                customerId = data.customerId;

            });
        }

        function resetForm() {
            resetHighLight();
            $scope.submitLabel = "Create";
            $scope.forms.itemAkaForm.$setPristine();
            $scope.forms.itemAkaForm.$setUntouched();
        }
    };

    controller.$inject = ['$scope', '$state', '$stateParams', 'lincUtil', 'itemService'];

    return controller;
});
