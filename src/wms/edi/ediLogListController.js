'use strict';

define(["lodash"], function(_) {
    var controller = function($scope, $http, ediService, lincUtil) {
        $scope.pageSize = 10;
        $scope.searchInfo = {};

        function searchEdiList(searchParam, currentPage) {
            $scope.loading = true;

            var param = angular.copy(searchParam);
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pageSize) };

            ediService.searchEdiListByPaging(param).then(function(data) {
                $scope.loading = false;
                $scope.paging = data.paging;
                $scope.ediLogList = data.edis;
            }, function(error) {
                $scope.loading = false;
                lincUtil.errorPopup(error);
            });
        }

        $scope.search = function() {
            searchEdiList($scope.searchInfo, 1);
        };

        $scope.loadContent = function(currentPage) {
            searchEdiList($scope.searchInfo, currentPage);
        };

        function _init() {
            searchEdiList({},1);
        }

        _init();
    };
    controller.$inject = ['$scope', '$http', 'ediService', 'lincUtil'];
    return controller;
});
