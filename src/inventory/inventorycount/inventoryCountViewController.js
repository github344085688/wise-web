'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, $mdDialog, inventoryCountService, itemSpecId, type, locationId,lincUtil) {

        $scope.summaryType = type;
        $scope.pageSize = 10;
        $scope.cancel = function () {
            $mdDialog.hide();
        };

        $scope.loadContent = function (currentPage) {
            $scope.inventoryCountLists = {};
            
            $scope.loading = true;
            var param = {};
            if (type === 'SKU') {
                param.itemSpecId = itemSpecId;
            } else {
                param.locationId = locationId;
                param.itemSpecId = itemSpecId;
            }
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };
            inventoryCountService.inventoryViewSearchByPaging(param).then(function (response) {
                $scope.loading = false;
                $scope.paging = response.paging;
                $scope.inventoryCountLists = response.inventoryCounts;
            }, function (err) {
                $scope.loading = false;
                lincUtil.processErrorResponse(error);
            });

        };


        function init() {
            
            $scope.loadContent(1);
        }
        init();

    };
    controller.$inject = ['$scope', '$state', '$mdDialog', 'inventoryCountService', 'itemSpecId', 'type', 'locationId','lincUtil'];
    return controller;
});
