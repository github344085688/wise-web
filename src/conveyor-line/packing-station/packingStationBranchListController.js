'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var packingStationBranchListController = function ($scope, $state, $resource, session, monitorService, $interval, lincUtil, conveyorService) {


        $scope.export = function (branchId) {
            $state.go('cl.packingStation.branch', { branchId: branchId });
        }

        $scope.click = function (line) {
            if (line.isShow == true) {
                line.isShow = false;
                return;
            }

            _.forEach($scope.lineList, function (line) {
                line.isShow = false;
            }
            )
            line.isShow = true;
        }


        function searchpackingStation (param) {
            conveyorService.converyLineSearch(param).then(function (response) {
                $scope.lineList = response;
                _.forEach($scope.lineList, function (line) {
                    line.isShow = false;
                })
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }
        function getUserInfo () {
            session.getUserInfo().then(function (userInfo) {
                $scope.user = angular.copy(userInfo);
            });
        }
        function _init () {
            searchpackingStation({});
            getUserInfo();
        }

        _init();





    };

    packingStationBranchListController.$inject = ['$scope', '$state', '$resource', 'session', 'monitorService', '$interval', 'lincUtil', 'conveyorService'];
    return packingStationBranchListController;
});