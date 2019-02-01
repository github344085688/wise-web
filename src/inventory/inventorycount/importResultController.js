'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, inventoryCountService, importLists, lincUtil) {


        $scope.pageSize = 10;
        $scope.cancel = function () {
            $mdDialog.hide();
        };
        $scope.importLists = importLists;
        $scope.loadContent = function (currentPage) {
            $scope.importListsViews = $scope.importLists.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.importLists.length ? $scope.importLists.length : currentPage * $scope.pageSize);
        };

        function init() {

            $scope.loadContent(1);
        }
        init();

    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'inventoryCountService', 'importLists', 'lincUtil'];
    return controller;
});
