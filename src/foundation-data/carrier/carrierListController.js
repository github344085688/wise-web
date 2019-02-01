'use strict';

define(['angular', 'lodash'], function(angular, _) {
    var $scope = function($scope, carrierService, lincUtil, $http) {
        $scope.pageObj = {pageSize: 10};
        $scope.searchInfo = {};

        $scope.search = function() {
            $scope.loadContent(1);
        };

        $scope.loadContent = function (currentPage) {
            var param = angular.copy($scope.searchInfo);
            param.paging = {pageNo: Number(currentPage), limit: Number($scope.pageObj.pageSize)};
            param.sortingOrder = -1;
            $scope.loading = true;
            carrierService.searchCarrierByPaging(param).then(function(response) {
                $scope.loading = false;
                $scope.carriers = response.carriers;
                $scope.paging = response.paging;
            },function () {
                $scope.loading = false;
            });
        };

        $scope.export = function() {
            if ($scope.exporting) return;
            $scope.exporting = true;
            $http.post("/report-center/carrier/export", $scope.searchInfo, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Export failed!");
                    $scope.exporting = false;
                    return;
                }
                lincUtil.exportFile(res, "carrier.xlsx");
                $scope.exporting = false;
            }, function (error) {
                lincUtil.bufferErrorPopup(error);
                $scope.exporting = false;
            });
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

        function _init() {
            $scope.loadContent(1);
        }

        _init();
    };
    $scope.$inject = ['$scope', 'carrierService', 'lincUtil', '$http'];
    return $scope;
});
