'use strict';

define(['lodash'], function (_) {
    var controller = function ($scope, $cookies, $stateParams, printService, lincUtil, $q) {
        var orderIds = [];
        var printSuccessNum;
        var printFailNum;

        $scope.print = function () {
            printSuccessNum = 0;
            $scope.printMessage = [];
            if (!$scope.printerName) {
                lincUtil.errorPopup("Please select a printer to print");
                return;
            }
            $scope.isLoading = true;
            _.forEach(orderIds, function (orderId) {
                printOrder(orderId);
            });
        };

        function printOrder(orderId) {
            printService.generateOrderPackingListPdf(orderId).then(function (data) {
                var fileId = data.fileId ? data.fileId : data;
                if (fileId) {
                    generatePdfSuccess(fileId, orderId);
                }
            },function () {
                generatePdfFail(orderId);
            });
        }

        function generatePdfFail(orderId) {
            $scope.printMessage.push(orderId + ": generate pdf fail!");
            printFailNum ++;
            if((printFailNum + printSuccessNum) == orderIds.length) {
                $scope.isLoading = false;
            }
        }
        
        function printFail(orderId) {
            $scope.printMessage.push(orderId + ": print pdf fail!");
            printFailNum ++;
            if((printFailNum + printSuccessNum) == orderIds.length) {
                $scope.isLoading = false;
            }
        }
         
        function generatePdfSuccess(fileId, orderId) {
            $scope.printMessage.push(orderId + ": generate pdf success!");
            var printer = $scope.printerName;
            printService.pdfPrint(fileId, printer).then(function (response) {
                printOrderSuccess(orderId);
            }, function () {
                printFail(orderId);
            });
        }
        function printOrderSuccess(orderId) {
            $scope.printMessage.push(orderId + ": print pdf success!");
            printSuccessNum ++;
            if(printSuccessNum == orderIds.length) {
                $scope.isLoading = false;
                lincUtil.messagePopup("Success", "All orders print successfully");
            }
        }

        $scope.iframeResize = function (obj) {
            obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
        };

        $scope.printerSelect = function (printer) {
            $scope.printerName = printer.printerName;
        };

        function init() {
            orderIds=_.split($stateParams.orderIds, ',');
            $scope.printItems = [];
            _.forEach(orderIds, function (orderId) {
                printService.generateOrderPackingListPdf(orderId).then(function(data){
                    var fileId = data.fileId;
                    $scope.printItems.push('/file-app/file-view/' + fileId);
                }, function(err){
                    lincUtil.processErrorResponse(err);
                });
            });
            $scope.printerType = ["PDF"];
        }

        init();
    };

    controller.$inject = ['$scope', '$cookies', '$stateParams', 'printService', 'lincUtil', '$q'];

    return controller;
});
