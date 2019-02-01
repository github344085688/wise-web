'use strict';

define(['angular', 'lodash', './batchPackController', './unFinishedPickTasksController', './forceReleaseController'], function (angular, _, batchPackController, unFinishedPickTasksController, forceReleaseController) {
    var packingStationController = function ($scope, $stateParams, $resource, session, monitorService, $interval, lincUtil, conveyorService, $mdDialog) {

        $scope.param = {};
        $scope.branchId = $stateParams.branchId;
        var timeInterval;

        $scope.enterEvent = function (e) {
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                getLpDetail($scope.param.searchClp);
            }
        };
        $scope.lpList = {};
        function getLpDetail (clp) {
            $scope.isLoading = true;
            $scope.qtySum = 0;
            conveyorService.getLpDetail(clp).then(function (response) {
                $scope.lpList = response;
                $scope.isLoading = false;
                _.forEach($scope.lpList.inventories, function (lp) {
                    $scope.qtySum = (lp.qty * lp.unit.baseQty) + $scope.qtySum;
                })

                conveyorService.getLpBranch($scope.conveyorBranch.conveyorLineId, $scope.lpList.id).then(function (response) {
                    $scope.branchName = response.branchName;
                    if ($scope.conveyorBranch.name != $scope.branchName) {
                        lincUtil.messagePopup('Message', 'CLP branch does not match with current conveyor branch!');
                    }
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
                if ($scope.lpList.inventories.length > 0) {
                    var list = [];
                    _.forEach($scope.lpList.inventories, function (lp) {
                        list.push(lp.itemSpecId);
                    })
                    conveyorService.getLpTemplate({ itemSpecIds: list }).then(function (response) {
                        $scope.lpTemplateList = response;
                        if ($scope.lpTemplateList) {
                            $scope.lpTemplateListSearch = _.groupBy($scope.lpTemplateList, function (lp) {
                                return lp.itemSpecId;
                            });
                        }
                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });
                }
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isLoading = false;
            }
            );

        }


        function init () {
            getConveryBranch();
            session.getUserInfo().then(function (userInfo) {
                $scope.user = angular.copy(userInfo);
            });
            timeInterval = $interval(function () {
                getBranchStoreDetail();
            }, 5000);
        };

        init();


        function getConveryBranch () {
            conveyorService.getConveryBranch($stateParams.branchId).then(function (response) {
                $scope.conveyorBranch = response;
                if ($scope.conveyorBranch.occupiedBy) {
                    getBranchStoreDetail();
                }
                if ($scope.conveyorBranch.occupiedBy) $scope.isOccupy = true;
                else $scope.isOccupy = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function getBranchStoreDetail () {
            if (!$scope.conveyorBranch.occupiedBy) {
                $scope.storeDetail = null;
                return;
            }
            conveyorService.getBranchStoreDetail($scope.conveyorBranch.occupiedBy).then(function (response) {
                $scope.storeDetail = response;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.bindBranch = function () {
            if (!$scope.occupiedNumber) return;
            $scope.loading = true;
            conveyorService.converyBranchOccupy($scope.branchId, $scope.occupiedNumber).then(function (response) {
                lincUtil.messagePopup('Message', 'Bind Successful.');
                getConveryBranch();
                $scope.isOccupy = true;
                $scope.loading = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            })
        }

        $scope.releaseBranch = function () {
            if ($scope.storeDetail.packedCLPNum == $scope.storeDetail.pickedCLPNum && $scope.storeDetail.unfinishedPickTaskIds.length == 0) {
                releaseBranch1();
            } else {
                var form = {
                    templateUrl: 'conveyor-line/packing-station/template/forceRelease.html',
                    locals: {
                        storeDetail: $scope.storeDetail,
                        storeNo: $scope.conveyorBranch.occupiedBy
                    },
                    autoWrap: true,
                    controller: forceReleaseController
                };
                $mdDialog.show(form).then(function () {
                    releaseBranch1();
                });
            }

        }


        function releaseBranch1 () {
            $scope.loading = true;
            conveyorService.converyBranchRelease($scope.branchId).then(function (response) {
                lincUtil.messagePopup('Message', 'Release Successful.');
                getConveryBranch();
                $scope.storeDetail = null;
                $scope.isOccupy = false;
                $scope.loading = false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.loading = false;
            });
        }

        $scope.Batch = function () {
            if ($scope.conveyorBranch.name != $scope.branchName) {
                lincUtil.messagePopup('Message', 'CLP branch does not match with current conveyor branch!');
                return;
            }
            if ($scope.lpList.inventories.length == 0) {
                lincUtil.messagePopup('Message', 'no lp can pack!');
                return;
            }
            var form = {
                templateUrl: 'conveyor-line/packing-station/template/batchPack.html',
                locals: {
                    lpTemplateList: $scope.lpTemplateList,
                    clp: $scope.lpList.id,
                    packTaskId: $scope.lpList.packTaskId
                },
                autoWrap: true,
                controller: batchPackController
            };

            $mdDialog.show(form).then(function (response) {
                $scope.lpList = {};
                $scope.branchName = null;
                $scope.qtySum = 0;
                $scope.param.searchClp = null;
            });
        }


        $scope.packItem = function (lp) {
            if ($scope.conveyorBranch.name != $scope.branchName) {
                lincUtil.messagePopup('Message', 'CLP branch does not match with current conveyor branch!');
                return;
            }
            if (!lp.toSlp) {
                lincUtil.messagePopup('Message', 'To SLP is empty');
                return;
            }
            if (!lp.lpTemplateId) {
                lincUtil.messagePopup('Message', 'LP Template is empty');
                return;
            }
            var PackItemParam = {};
            PackItemParam.itemSpecId = lp.itemSpecId;
            PackItemParam.unitId = lp.unitId;
            PackItemParam.qty = lp.qty;
            PackItemParam.fromLPId = $scope.lpList.id;
            var packTaskId = $scope.lpList.packTaskId;
            conveyorService.getPackTask(packTaskId).then(function (response) {
                var packTask = response;
                if (packTask.steps) {
                    $scope.param.stepId = packTask.steps[0].id;
                    conveyorService.bindingItemToLp($scope.param.stepId, lp.toSlp, PackItemParam).then(function (response) {
                        conveyorService.updateLp(lp.toSlp, { confId: lp.lpTemplateId }).then(function (response) {
                            lincUtil.messagePopup('Message', 'Pack Successful.');
                            if ($scope.lpList.inventories.length == 1) {
                                $scope.lpList = {};
                                $scope.branchName = null;
                                $scope.qtySum = 0;
                                $scope.param.searchClp = null;
                            } else {
                                getLpDetail($scope.lpList.id);
                            }
                        }, function (error) {
                            lincUtil.processErrorResponse(error);
                        });
                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });
                }
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.getUnFinishedPickTaskIds = function () {
            var form = {
                templateUrl: 'conveyor-line/packing-station/template/unFinishedPickTasks.html',
                locals: {
                    storeDetail: $scope.storeDetail
                },
                autoWrap: true,
                controller: unFinishedPickTasksController
            };

            $mdDialog.show(form);
        }

        $scope.$on(
            "$destroy",
            function (event) {
                $interval.cancel(timeInterval);
            }
        );

    };

    packingStationController.$inject = ['$scope', '$stateParams', '$resource', 'session', 'monitorService', '$interval', 'lincUtil', 'conveyorService', '$mdDialog'];
    return packingStationController;
});