'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $resource, $state, lincResourceFactory,
        loadsService, organizationService, lincUtil) {
        var searchInfo = {};
        $scope.pager = { pageSize: 10 };
        $scope.searchLoads = function (searchParam) {
            searchInfo = searchParam;
            $scope.loadContent(1);
        };

        $scope.editLoad = function (loadId) {
            $state.go('wms.outbound.load.edit', { 'loadId': loadId });
        };

        $scope.deleteLoad = function (loadId) {
            lincUtil.deleteConfirmPopup('Would you like to remove the this load?', function () {
                loadsService.deleteLoad(loadId).then(function () {
                    _init();
                }, function (error) {
                        lincUtil.errorPopup('Delete Error! ' + error.data.error);
                    });
            });
        };

        $scope.loadContent = function (currentPage) {
            $scope.searchCompleted = false;
            var param = angular.copy(searchInfo);
            param.paging = { pageNo: Number(currentPage), limit: Number($scope.pager.pageSize) };
            loadsService.searchLoadByPaging(param).then(function (response) {
                $scope.searchCompleted = true;
                $scope.loads = response.loads;
                $scope.masterBolGroup=response.masterBolGroup;
                $scope.paging = response.paging;
            }, function (error) {
                $scope.searchCompleted = true;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.selectAll = false;
        $scope.checkLoadIds = [];
        $scope.checkAllILoads = function () {
            var currentPageItemIds = _.map($scope.loads, 'id');
            if ($scope.selectAll) {
                $scope.checkLoadIds = [];
                $scope.selectAll = false;
            }
            else {
                $scope.checkLoadIds = currentPageItemIds;
                $scope.selectAll = true;
            }
        };

        $scope.checkLoad = function (load) {
            if (_.indexOf($scope.checkLoadIds, load.id) > -1) {
                _.remove($scope.checkLoadIds, function (loadId) {
                    return load.id == loadId;
                })
            } else {
                $scope.checkLoadIds.push(load.id);
            }
        };

        $scope.isChecked = function (load) {
            return _.indexOf($scope.checkLoadIds, load.id) > -1;
        };

        $scope.printMasterBOL = function () {
            if ($scope.checkLoadIds.length <= 0) {
                lincUtil.errorPopup("Please select load first");
            }
            else {
                var selectLoads = _.filter($scope.loads, function(load){
                    return _.indexOf($scope.checkLoadIds, load.id) > -1;
                });
                if(isAllowToPrintMasterBol(selectLoads)) {
                    var url = $state.href('loadMasterBolPrint', { loadIds: $scope.checkLoadIds });
                    window.open(url);
                } else {
                    lincUtil.errorPopup("Error: Trailer# is required for printing MBOL, please double check.");
                }

            }
        };

        $scope.printMasterBOLNo=function(load){
            var loadIds=$scope.masterBolGroup[load.masterBolNo];
            var url = $state.href('loadMasterBolPrint', { loadIds: loadIds });
            window.open(url);
        };


        function isAllowToPrintMasterBol(loads) {
            if(_.every(loads, 'isTransload')) {
                return _.every(loads, function(load) {
                    if(_.isEmpty(load.trailers)){
                        return false;
                    } else {
                        return _.every(load.trailers, function(trailer){
                              return !trailer.toLowerCase().startsWith("load")
                        })
                    }
                });
            }
            return true;
        }




        function _init() {
            $scope.loadContent(1);
        }
        _init();


    };
    controller.$inject = ['$scope', '$resource', '$state', 'lincResourceFactory',
        'loadsService', 'organizationService', 'lincUtil'];
    return controller;
});
