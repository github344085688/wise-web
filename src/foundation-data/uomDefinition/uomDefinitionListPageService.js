'use strict';

define(['angular', 'lodash', './editUomNameDefinitionController'], function (angular, _, editUomNameDefinitionController) {
    var controller = function ($scope, uomDefinitionService, $mdDialog, lincUtil) {
        $scope.pageSize = 10;
        $scope.isLoadingComplete = false;

        $scope.UomDefinitionParams = {};
        $scope.search = function () {
            $scope.isLoadingComplete = false;
            uomDefinitionService.searchUomDefinition($scope.UomDefinitionParams).then(function (response) {
                $scope.isLoadingComplete = true;
                $scope.uomDefinitions = response.uomDefinitions;
                $scope.organizationMap = response.organizationMap;
                $scope.loadContent(1);
            }, function (error) {
                $scope.isLoadingComplete = true;
                lincUtil.errorPopup(error.data.error);
            });
        };
        $scope.editUomDefinition = function (index) {
            $scope.uomDefinition = angular.copy($scope.uomDefinitionView[index]);
            popUpUomDefinition($scope.uomDefinition);
        };

        $scope.deleteUomDefinition = function (index) {
            lincUtil.deleteConfirmPopup('Are you sure to delete this record?', function () {
                uomDefinitionService.remove($scope.uomDefinitionView[index].id).then(function () {
                    // $scope.uomDefinitionView.splice(index, 1);
                    initUom();
                }, function (error) {
                    lincUtil.errorPopup(error.data.error);
                });
            });
        };

        $scope.saveOrUpdateUomDefinition = function () {
            if ($scope.uomDefinition.id) {
                uomDefinitionService.updateUomDefinition($scope.uomDefinition).then(function (response) {
                    lincUtil.saveSuccessfulPopup(uomDefinitionAkaSaveCbFun);
                }, function (error) {
                    lincUtil.errorPopup(error.data.error);
                });
            } else {
                uomDefinitionService.addUomDefinition($scope.uomDefinition).then(function (response) {
                    lincUtil.saveSuccessfulPopup(uomDefinitionAkaSaveCbFun);
                }, function (error) {
                    lincUtil.errorPopup(error.data.error);
                });
            }
        };

        function uomDefinitionAkaSaveCbFun() {
            initUom();
        }

        $scope.loadContent = function (currentPage) {
            $scope.uomDefinitionView = $scope.uomDefinitions.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.uomDefinitions.length ? $scope.uomDefinitions.length : currentPage * $scope.pageSize);
        };

        $scope.addUomDefinition = function () {
            popUpUomDefinition();
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.search();
            }
            $event.preventDefault();
        };


        function popUpUomDefinition(uomDefinition) {
            var form = {
                templateUrl: 'foundation-data/uomDefinition/template/editUomNameDefinition.html',
                locals: {
                    uomDefinition: uomDefinition ? uomDefinition : ""

                },
                autoWrap: true,
                controller: editUomNameDefinitionController
            };
            $mdDialog.show(form).then(function (response) {
                $scope.uomDefinition = response;
                $scope.saveOrUpdateUomDefinition();
            });
        }
        function initUom() {
            $scope.uomDefinitionView = {};
            $scope.search();
        }
        initUom();
    };
    controller.$inject = ['$scope', 'uomDefinitionService', '$mdDialog', 'lincUtil'];
    return controller;
});
