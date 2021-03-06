'use strict';

define([], function () {
    var printPageController = function ($scope, $cookies, $stateParams, printService, lincUtil) {
        $scope.print = function () {
            if (!$scope.printerName) {
                lincUtil.errorPopup("Please select a printer to print");
                return;
            }
            $scope.isLoading = true;
            printService.generateLoadPackingListPdf($scope.loadId, $scope.orderId).then(function (data) {
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
            $scope.loadId = $stateParams.loadId;
            $scope.orderId = $stateParams.orderId;

            printService.generateLoadPackingListPdf($scope.loadId,$scope.orderId).then(function(data){
                var fileId = data.fileId;
                if(fileId){
                    $scope.data = '/file-app/file-view/' + fileId;
                } else {
                    lincUtil.errorPopup('Preview failed, the pdf file was not generated.');
                }
            }, function(err){
                lincUtil.processErrorResponse(err);
            });
            $scope.printerType = ["PDF"];
        }

        init();
    };

    printPageController.$inject = ['$scope', '$cookies', '$stateParams', 'printService', 'lincUtil'];

    return printPageController;
});
