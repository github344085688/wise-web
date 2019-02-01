'use strict';

define(['angular', 'lodash', 'moment'], function (angular, _, moment) {
    var transloadReceivingController = function ($scope, transloadTaskService, $stateParams, $interval, lincUtil, firebaseService) {

        $scope.scheduledDocumentPager = { pageSize: 2, currentPage: 1, totalPage: 0 };

        $scope.taskId = $stateParams.taskId;
        $scope.receiptId = $stateParams.receiptId;
        $scope.dockId = $stateParams.dockId;
        $scope.dockIds = [];
        var loadFirst = true;

        function _init() {
            registerFirebase();
            getTransloadReceiving();
        }

        _init();

        function registerFirebase() {
            firebaseService.setupMessageToken(function (token) {
                if ($scope.dockIds.length > 0) {
                    _.forEach($scope.dockIds, function (dockId) {
                        transloadTaskService.registerFirebase({ registrationId: token, userId: $scope.taskId + "|" + dockId }).then(function () {
                        }, function (error) {
                            console.log(error.data.error);
                            if (error.data.error === 'Device already registered by user') {
                            } else {
                                //lincUtil.processErrorResponse(error);
                            }

                        })
                    });
                }
                else {
                    transloadTaskService.registerFirebase({ registrationId: token, userId: $scope.taskId + "|" + $scope.dockId }).then(function () {
                    }, function (error) {
                        if (error.data.error === 'Device already registered by user') {

                        } else {
                            // lincUtil.processErrorResponse(error);
                        }

                    })
                }

            });

        }

        firebaseService.getMessaging().onMessage(function (payload) {
            getTransloadReceiving();
            receivingMsgToChangeDockAndShowMsg(payload);
        });

        function receivingMsgToChangeDockAndShowMsg(payload) {
            var dataJson = JSON.parse(JSON.stringify(payload)).data.message;
            var dataObj = JSON.parse(dataJson);
            if (dataObj.scanType === "Receiving") {
                $scope.destinationDock = dataObj.targetDockName;
            }

        }

        function loadContentPage(pager, contents, contentView) {

            if (contents.length > 0) {
                pager.totalPage = Math.ceil(contents.length / pager.pageSize);

                if (pager.currentPage > pager.totalPage) {
                    pager.currentPage = 1;
                }
                $scope[contentView] = contents.slice((pager.currentPage - 1) * pager.pageSize,
                    pager.currentPage * pager.pageSize > contents.length ? contents.length : pager.currentPage * pager.pageSize);
            } else {
                pager.currentPage = 0;
            }


        }

        function getTransloadReceiving() {

            transloadTaskService.getTransloadReceivingMonitor($scope.taskId, $scope.receiptId).then(function (res) {

                $scope.baseInfo = res.baseInfo;
                if (res.baseInfo.duration) {
                    $scope.baseInfo.duration = lincUtil.formatTimestampDuration(res.baseInfo.duration);
                }

                $scope.receiptInfo = res.receiptInfo;
                $scope.receivingProgressInfo = res.receivingProgressInfo;
                $scope.receivingStepTimelines = res.receivingStepTimelines;
                $scope.receivingScannedCartonLines = res.receivingScannedCartonLines;
                if ($scope.receivingProgressInfo.shippingStepsProgresses.length > 0 && loadFirst) {
                    $scope.dockIds = _.map($scope.receivingProgressInfo.shippingStepsProgresses, 'dockId');
                    registerFirebase();
                    loadFirst = false;
                }
                loadContentPage($scope.scheduledDocumentPager, $scope.receivingProgressInfo.shippingStepsProgresses, "scheduledDocumentView");
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.aheadPage = function (aheadNum) {
            if (aheadNum - 1 > 0) {
                $scope.scheduledDocumentPager.currentPage = aheadNum - 1;
                loadContentPage($scope.scheduledDocumentPager, $scope.receivingProgressInfo.shippingStepsProgresses, "scheduledDocumentView");
            }
        };

        $scope.nextPage = function (nextNum) {
            if (nextNum + 1 <= $scope.scheduledDocumentPager.totalPage) {
                $scope.scheduledDocumentPager.currentPage = nextNum + 1;
                loadContentPage($scope.scheduledDocumentPager, $scope.receivingProgressInfo.shippingStepsProgresses, "scheduledDocumentView");
            }
        };

        $scope.widthPer = function (stepsProgress) {
            var per = Math.floor(stepsProgress * 100) + '%';
            return per;
        };


        $scope.widthPer25 = function (stepsProgress) {
            var per = stepsProgress * 100 >= 25 ? '100%' : Math.floor(((stepsProgress * 100) / 25) * 100) + '%';
            return per;
        };

        $scope.widthPer50 = function (stepsProgress) {
            var per = stepsProgress * 100 >= 50 ? '100%' : Math.floor(((stepsProgress * 100 - 25) / 25) * 100) + '%';
            return per;
        };

        $scope.widthPer75 = function (stepsProgress) {
            var per = stepsProgress * 100 >= 75 ? '100%' : Math.floor(((stepsProgress * 100 - 50) / 25) * 100) + '%';
            return per;
        };

        $scope.widthPer100 = function (stepsProgress) {
            var per = stepsProgress * 100 >= 100 ? '100%' : Math.floor(((stepsProgress * 100 - 75) / 25) * 100) + '%';
            return per;
        };




        $scope.formatFailMessage = function (scannedCarton) {
            var retMsg = "";
            var shipTo = scannedCarton.shipTo ? "(" + scannedCarton.shipTo + ")" : "";
            if (scannedCarton.message) {
                retMsg = '[ Error ] ' + scannedCarton.message;
            } else {
                retMsg = " [ " + scannedCarton.scanAction + " ] " + scannedCarton.cartonNo + " >>>> " + scannedCarton.targetDockName + shipTo + ' (duplicated carton#)';
            }
            return retMsg;
        }


        $scope.formatSucessMessage = function (scannedCarton) {
            var retMsg = "";
            var shipTo = scannedCarton.shipTo ? "(" + scannedCarton.shipTo + ")" : "";
            if (scannedCarton.scanAction === 'Disallow') {
                retMsg = " [ Unreceive ] " + scannedCarton.cartonNo + shipTo;
            } else {
                retMsg = " [ " + scannedCarton.scanAction + " ] " + scannedCarton.cartonNo + " >>>> " + (scannedCarton.targetDockName ? scannedCarton.targetDockName + shipTo : ' Unknown Dock');
            }

            return retMsg;
        }



        $scope.formatStander = function (time) {
            return moment(time).format(" MM / DD/ YYYY, h:mm:ss a");
        }
    };

    transloadReceivingController.$inject = ['$scope', 'transloadTaskService', '$stateParams', '$interval', 'lincUtil', 'firebaseService'];
    return transloadReceivingController;
});