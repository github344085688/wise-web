'use strict';

define([
    'angular',
    'lodash'], function (angular, _) {
        var controller = function ($scope, materialTemplateService, lincUtil) {

            $scope.pageSize = 10;
            $scope.searchInfo = {};
            materialTemplateService.searchMaterialTemplate({}).then(function (data) {
                $scope.searchCompleted = true;
                $scope.materialTemplate = data.materialTemplates;
                $scope.loadContent(1);
            }, function () { });


            $scope.search = function () {
                $scope.searchCompleted = false;
                var param = {};
                if ($scope.searchInfo.name && $scope.searchInfo.name !== "") {
                    param.name = $scope.searchInfo.name;
                }
                materialTemplateService.searchMaterialTemplate(param).then(function (data) {
                    $scope.materialTemplate = data.materialTemplates;

                    if (data)
                        $scope.loadContent(1);
                    $scope.searchCompleted = true;
                }, function () { });
            };

            $scope.loadContent = function (currentPage) {
                $scope.materialTemplateView = $scope.materialTemplate.slice((currentPage - 1) * $scope.pageSize, currentPage * $scope.pageSize > $scope.materialTemplate.length ? $scope.materialTemplate.length : currentPage * $scope.pageSize);
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
        };
        controller.$inject = ['$scope', 'materialTemplateService', 'lincUtil'];
        return controller;
    });
