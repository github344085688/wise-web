'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $stateParams, lincUtil, itemService, materialTemplateService,
        lincResourceFactory, organizationService) {
        var itemSpecId;
        $scope.submitLabel = "Create";
        $scope.itemMateriaTemplate = {};
        $scope.pageSize = 10;
        init();
        function init() {
            itemSpecId = $stateParams.itemSpecId;
            itemService.searchItemMateriaTemplate({ itemSpecId: itemSpecId }).then(function (response) {
                $scope.itemMateriaTemplates = response.itemMaterialTemplates;
                $scope.loadContent(1);
            });
            getDiverseByItemSpec(itemSpecId);
            searchMaterialTemplate({ scenario: 'Auto Complete' });
        }

        function getDiverseByItemSpec(itemSpecId) {
            itemService.getDiverseByItemSpec(itemSpecId).then(function (response) {
                $scope.itemProducts = response.diverseItemSpecs;
            });

        }

        $scope.loadContent = function (currentPage) {
            $scope.materialTemplatesView = $scope.itemMateriaTemplates.slice((currentPage - 1) * $scope.pageSize, currentPage * $scope.pageSize > $scope.itemMateriaTemplates.length ? $scope.itemMateriaTemplates.length : currentPage * $scope.pageSize);
        };
        $scope.saveOrUpdateMateriaTemplate = function () {
            $scope.loading = true;
            if (!$scope.itemMateriaTemplate.id)
                saveItemMaterialTemplate();
            else {
                $scope.materialTemplateId = $scope.itemMateriaTemplate.id;
                updateItemMaterialTemplate();
            }

        };

        function saveItemMaterialTemplate() {
            $scope.itemMateriaTemplate.itemSpecId = $stateParams.itemSpecId;
            itemService.addItemMateriaTemplate($scope.itemMateriaTemplate).then(function (response) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(materialTemplateSaveCbFun);
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);

            });
        }

        function updateItemMaterialTemplate() {
            $scope.itemMateriaTemplate.id = $scope.materialTemplateId;
            itemService.updateItemMateriaTemplate($scope.itemMateriaTemplate).then(function (response) {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(materialTemplateSaveCbFun);
            }, function (error) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });
        }


        $scope.editItemMateriaTemplate = function (index) {
            resetHighLight();
            $scope.hightLights[index] = true;
            $scope.submitLabel = "Update";
            itemService.getItemMateriaTemplate($scope.itemMateriaTemplates[index].id).then(function (response) {
                $scope.itemMateriaTemplate = response;
            });
        };


        function materialTemplateSaveCbFun() {
            resetForm();
            init();
        }

        $scope.deleteItemMateriaTemplate = function (index) {
            lincUtil.deleteConfirmPopup('Are you sure to delete this record?', function () {
                itemService.removeItemMateriaTemplate($scope.itemMateriaTemplates[index].id).then(function () {
                    // $scope.itemMateriaTemplates.splice(index, 1);
                    // $scope.submitLabel = "Create";
                    materialTemplateSaveCbFun();
                });
            });
        };



        function resetForm() {
            resetHighLight();
            $scope.submitLabel = "Create";
            $scope.itemMateriaTemplate = {};
            $scope.forms.materiaForm.$setPristine();
            $scope.forms.materiaForm.$setUntouched();
        }
        $scope.resetMaterialTemplate = function () {
            resetForm();
        }
        $scope.getMaterialTemplates = function (param) {

            searchMaterialTemplate({ name: param, scenario: 'Auto Complete' });

        }
        function searchMaterialTemplate(params) {
            materialTemplateService.searchMaterialTemplate(params).then(function (response) {
                $scope.materiaTemplates = response.materialTemplates;

            });
        }
        function resetHighLight() {
            $scope.hightLights = [];
        }
    };

    controller.$inject = ['$scope', '$stateParams', 'lincUtil', 'itemService', 'materialTemplateService',
        'lincResourceFactory', 'organizationService'];

    return controller;
});
