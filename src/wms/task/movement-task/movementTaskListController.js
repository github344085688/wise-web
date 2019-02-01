'use strict';

define([
    'angular',
    'lodash'
], function(angular, _) {
    var controller = function ($scope, lincUtil,
                               movementTaskService, itemService) {
        $scope.search = {};
        $scope.pageObj = {pageSize: 10};

        $scope.searchTasks = function () {
            $scope.loadContent(1);
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.loadContent(1);
            }
            $event.preventDefault();
        };

        $scope.loadContent = function (currentPage) {
            var param = angular.copy($scope.search);
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize)};
            param.sortingOrder = -1;
            param.sortingFields = ["createdWhen"];
            $scope.searching = true;
            movementTaskService.searchTasksByPaging(param).then(function(response) {
                $scope.searching = false;
                $scope.tasks = response.tasks;
                $scope.paging = response.paging;
            },function () {
                $scope.searching = false;

            });
        };


        $scope.itemSpecIdOnSelect = function (itemSpec) {
            $scope.search.productId = null;
            if(itemSpec)
            {
                itemService.getDiverseByItemSpec(itemSpec.id).then(function(response) {
                    $scope.itemProducts = response.diverseItemSpecs;
                    $scope.itemPropertyMap = response.itemPropertyMap;
                });
            }else
            {
                $scope.itemProducts = null;
            }
        };

        function init() {
            $scope.loadContent(1);
        }

        init();
    }

    controller.$inject = ['$scope', 'lincUtil', 'movementTaskService', 'itemService'];
    return controller;
})