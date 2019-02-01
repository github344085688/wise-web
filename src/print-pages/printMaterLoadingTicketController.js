'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, printService, $cookies, $state, $mdDialog, $stateParams, lincUtil) {

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.print = function () {
            if (!$scope.printer) {
                lincUtil.errorPopup("Please select a printer to preview & print");
                return;
            }
            $scope.isLoading = true;
            printService.zplPrint($scope.jobId, $scope.printer).then(
                function (response) {
                    $scope.isLoading = false;
                    lincUtil.messagePopup("Success", "Data has been sent to printer successfully");
                }, function (error) {
                    $scope.isLoading = false;
                    lincUtil.processErrorResponse(error);
                });
        };

        $scope.printerSelect = function (printer) {
            $scope.printer = printer;
            getPreviewUrl($scope.jobId);
        };

        function getPreviewUrl(jobId) {
            if (!$scope.printer) {
                return;
            }
            printService.previewZPL(function (printServers) {
                if (printServers.length >= 1) {
                    $scope.data = printService.buildUrlFromPrintServer(printServers[0], 'zpl/preview?jobId=' + jobId + '&host=' + $scope.printer.ip);
                } else {
                    lincUtil.errorPopup("Please set up the print server first");
                }
            });
        }

        function init() {
            $scope.printerType = ["ZPL", "RAW"];
            $scope.isZPL = true;
            if ($stateParams.loadId) {
                printService.getMasterLoadingTicketPrint($stateParams.loadId).then(function (response) {
                    if (response.id) {
                        $scope.jobId = response.id;
                        getPreviewUrl($scope.jobId);
                    }
                }, function (response) {
                    lincUtil.errorPopup(response.data.error);
                });
            } else {
                $state.go('wms.outbound.load.list');
            }
        }

        init();

        $scope.iframeResize = function (obj) {
            obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
        };
    };

    controller.$inject = ['$scope', 'printService', '$cookies', '$state', '$mdDialog', '$stateParams', 'lincUtil'];
    return controller;
})
;