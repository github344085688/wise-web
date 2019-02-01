'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, printService, $cookies, $state, $mdDialog, $stateParams, lincUtil) {
        $scope.print = function () {
            if (!$scope.printerName) {
                lincUtil.errorPopup("Please select a printer to print");
                return;
            }
            $scope.isLoading = true;
            printService.generateReceiptWithDetailPdf($stateParams.receiptId).then(function (data) {
                var fileId = data.fileId ? data.fileId : data.fieldId;
                if (fileId) {
                    printService.pdfPrint(fileId, $scope.printerName).then(function () {
                        $scope.isLoading = false;
                        lincUtil.messagePopup("Success", "Data has been sent to printer successfully");
                    }, function (error) {
                        $scope.isLoading = false;
                        lincUtil.processErrorResponse(error);
                    })
                }
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.iframeResize = function (obj) {
            obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
        };

        $scope.printerSelect = function (printer) {
            $scope.printerName = printer.printerName;
        };

        function init() {
            printService.generateReceiptWithDetailPdf($stateParams.receiptId).then(function (data) {
                var fileId = data.fileId ? data.fileId : data;
                $scope.data = '/file-app/file-view/' + fileId;
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
            $scope.printerType = ["PDF"];
        }

        init();
    };
    controller.$inject = ['$scope', 'printService', '$cookies', '$state', '$mdDialog', '$stateParams', 'lincUtil'];
    return controller;
});