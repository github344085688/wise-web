'use strict';

define(['angular', 'lodash', 'moment'], function (angular, _, moment) {
    var transloadShippingController = function ($scope, transloadTaskService, $stateParams, $interval, lincUtil, firebaseService) {

        $scope.scheduledDocumentPager = { pageSize: 2, currentPage: 0, totalPage: 0 };


        var taskId = $stateParams.taskId;
        var loadId = $stateParams.loadId;
        var dockId = $stateParams.dockId;


        function _init() {
            registerFirebase();
            getTransloadShipping();
        }
        _init();

        function loadContentPage(pager, contents, contentView) {
            if (contents.length > 0) {
                pager.totalPage = Math.ceil(contents.length / pager.pageSize);
                pager.currentPage = pager.currentPage + 1;
                if (pager.currentPage > pager.totalPage) {
                    pager.currentPage = 1;
                }
                $scope[contentView] = contents.slice((pager.currentPage - 1) * pager.pageSize,
                    pager.currentPage * pager.pageSize > contents.length ? contents.length : pager.currentPage * pager.pageSize);
            } else {
                pager.currentPage = 0;
            }
        }

        function getTransloadShipping() {


            transloadTaskService.getTransloadShippingMonitor(taskId, loadId).then(function (res) {

                $scope.baseInfo = res.baseInfo;
                if (res.baseInfo.duration) {
                    $scope.baseInfo.duration = lincUtil.formatTimestampDuration(res.baseInfo.duration);
                }
                $scope.shippedInfo = res.shippedInfo;
                $scope.shippingProgressInfo = res.shippingProgressInfo;
                $scope.shippingTimelines = res.shippingTimelines;
                $scope.shippingScannedCartonLines = res.shippingScannedCartonLines;
                loadContentPage($scope.scheduledDocumentPager, $scope.shippingProgressInfo.stepProgress, "scheduledDocumentView");
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.widthPer = function (stepsProgress) {
            var per = Math.floor(stepsProgress * 100) + '%';
            return per;
        }

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

        function registerFirebase() {

            firebaseService.setupMessageToken(function (token) {
                transloadTaskService.registerFirebase({ registrationId: token, userId: taskId + "|" + dockId }).then(function () {
                }, function (error) {

                })
            });

        }

        firebaseService.getMessaging().onMessage(function (payload) {
            getTransloadShipping();
        });

        $scope.formatFailMessage = function (scannedCarton) {
            var retMsg = "";
            if (scannedCarton.message) {
                retMsg = '[ Error ] ' + scannedCarton.message;
            } else {
                retMsg = " [ " + scannedCarton.scanAction + " ] " + scannedCarton.cartonNo + ' (duplicated carton#)';
            }
            return retMsg;
        }


        $scope.formatSucessMessage = function (scannedCarton) {
            var retMsg = "";
            if (scannedCarton.scanAction === 'Unload') {
                retMsg = " [ " + scannedCarton.scanAction + " ] " + scannedCarton.cartonNo;
            }
            else {
                retMsg = " [ " + scannedCarton.scanAction + " ] " + scannedCarton.cartonNo;
            }
            return retMsg;
        }


        $scope.formatStander = function (time) {
            return moment(time).format(" MM / DD/ YYYY, h:mm:ss a");
        }



    };

    transloadShippingController.$inject = ['$scope', 'transloadTaskService', '$stateParams', '$interval', 'lincUtil', 'firebaseService'];
    return transloadShippingController;
});