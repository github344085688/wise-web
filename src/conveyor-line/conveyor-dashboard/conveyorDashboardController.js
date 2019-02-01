'use strict';

define(['angular', 'lodash', '../packing-station/forceReleaseController'], function (angular, _, forceReleaseController) {
    var controller = function ($scope, $stateParams, $resource, session, conveyorService, $mdDialog, lincUtil) {

        $scope.param = {};
        $scope.lineId = $stateParams.lineId;
        $scope.releaseLoading = {};
        $scope.bindLoading = {};
        $scope.exceptionLoading = {};
        $scope.store = null;
        function init () {
            getConveyorPickingDashboard();
        }

        init();

        function getConveyorPickingDashboard () {
            conveyorService.getConveyorPickingDashboard($scope.lineId).then(function (response) {
                $scope.PickingDashboard = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.releaseBranch = function (branch) {
            $scope.releaseLoading[branch.branchId] = true;
            conveyorService.getBranchStoreDetail(branch.storeNo).then(function (response) {
                $scope.storeDetail = response;
                $scope.releaseLoading[branch.branchId] = false;
                if ($scope.storeDetail.packedCLPNum == $scope.storeDetail.pickedCLPNum && $scope.storeDetail.unfinishedPickTaskIds.length == 0) {
                    releaseBranch1(branch.branchId);
                } else {
                    var form = {
                        templateUrl: 'conveyor-line/packing-station/template/forceRelease.html',
                        locals: {
                            storeDetail: $scope.storeDetail,
                            storeNo: branch.storeNo
                        },
                        autoWrap: true,
                        controller: forceReleaseController
                    };
                    $mdDialog.show(form).then(function () {
                        releaseBranch1(branch.branchId);
                    });
                }
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        
        function releaseBranch1(branchId){
            $scope.releaseLoading[branchId] = true;
            conveyorService.converyBranchRelease(branchId).then(function (response) {
                lincUtil.messagePopup('Message', 'Release Successful.');
                init();
                $scope.releaseLoading[branchId] = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.releaseLoading[branchId] = false;
            });
        }


        $scope.bindBranch = function (branch) {
            if (!branch.store) return;
            $scope.bindLoading[branch.branchId] = true;
            conveyorService.converyBranchOccupy(branch.branchId, branch.store).then(function (response) {
                lincUtil.messagePopup('Message', 'Bind Successful.');
                init();
                $scope.bindLoading[branch.branchId] = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.bindLoading[branch.branchId] = false;
            })
        }

        $scope.exceptionBranch = function (branch) {
            $scope.exceptionLoading[branch.branchId] = true;
            conveyorService.converyBranchUpdate(branch.branchId, {type:"EXCEPTION"}).then(function (response) {
                lincUtil.messagePopup('Message', 'Exception Successful.');
                init();
                $scope.exceptionLoading[branch.branchId] = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.exceptionLoading[branch.branchId] = false;
            })
        }
        




    }

    controller.$inject = ['$scope', '$stateParams', '$resource', 'session', 'conveyorService', '$mdDialog', 'lincUtil'];
    return controller;
});