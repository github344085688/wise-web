'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var exceptionalHandlingController = function ($scope, $stateParams, $resource, session, conveyorService, $interval, lincUtil) {

        $scope.param = {};
        $scope.lineId = $stateParams.lineId;

        $scope.enterEvent = function (e) {
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                getLpDetail($scope.param.searchClp);
            }
        };

        function init () {
            getConveryLine();
        }

        init();

        function getLpDetail (clp) {
            $scope.isLoading = true;
            $scope.qtySum = 0;
            conveyorService.getLpDetail(clp).then(function (response) {
                $scope.lpList = response;
                $scope.isLoading = false;
                _.forEach($scope.lpList.inventories, function (lp) {
                    $scope.qtySum = (lp.qty * lp.unit.baseQty) + $scope.qtySum;
                });
                conveyorService.getLpBranch($scope.lineId, $scope.lpList.id).then(function (response) {
                    $scope.branchName = response.branchName;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isLoading = false;
            }
            );
        }

        $scope.isShow = false;
        $scope.click = function () {
            if ($scope.isShow == true) {
                $scope.isShow = false;
            } else {
                $scope.isShow = true;

            }
        }

        function getConveryLine () {
            conveyorService.getConveryLine($scope.lineId).then(function (response) {
                $scope.converyLine = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.reAssignBranches = function (branchName) {
            if (!$scope.lpList) { lincUtil.messagePopup('Message', 'clp is empty'); return; }
            conveyorService.reAssignBranches($scope.lineId, $scope.lpList.id, branchName).then(function (response) {
                lincUtil.saveSuccessfulPopup();
                getLpDetail($scope.lpList.id);
                $scope.isShow = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

    }

    exceptionalHandlingController.$inject = ['$scope', '$stateParams', '$resource', 'session', 'conveyorService', '$interval', 'lincUtil'];
    return exceptionalHandlingController;
});