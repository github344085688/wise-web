'use strict';

define(['angular', 'lodash' , './combineEAReplenishTasksController'], function(angular, _ ,combineEAReplenishTasksController) {
    var ctrl = function($scope, $stateParams, replenishmentTaskService, itemService, lincUtil,$mdDialog) {

        $scope.pageObj = {pageSize: 10};
        $scope.search = {};

        $scope.searchTask = function() {
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
            $scope.loading = true;
            replenishmentTaskService.searchTasksByPaging(param).then(function(response) {
                $scope.loading = false;
                $scope.tasks = response.tasks;
                $scope.paging = response.paging;
            }, function(error) {
                lincUtil.processErrorResponse(error);
                ctrl.searchTaskCompleted = true;
            });
        };

        $scope.mergeReplenish = function () {
            if (!$scope.search.customerId) {
                lincUtil.errorPopup("Please Select Customer !");
                return;
            }
            replenishmentTaskService.mergeReplenish($scope.search.customerId).then(function (res) {
                lincUtil.saveSuccessfulPopup();
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

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

        $scope.changeTab = function (tab, stepId) {
            $scope.activeTabs[stepId] = tab;
        };
        $scope.combineEAReplenishTasks = function () {
            var form = {
                templateUrl: 'wms/task/replenishment-task/template/combineEAReplenishTasks.html',
                locals: {

                },
                autoWrap: true,
                controller: combineEAReplenishTasksController
            };
            $mdDialog.show(form).then(function (response) {
            });
        };



        function _init() {
            $scope.loadContent(1);
        }

        _init();
    };
    ctrl.$inject = ['$scope','$stateParams', 'replenishmentTaskService', 'itemService', 'lincUtil', '$mdDialog'];
    return ctrl;
});
