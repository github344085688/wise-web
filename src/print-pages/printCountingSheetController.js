'use strict';

define([], function() {
    var printPageController = function($scope, $cookies, $stateParams, printService, lincUtil) {
        $scope.print = function() {
            if (!$scope.printerName) {
                lincUtil.errorPopup("Please select a printer to print");
                return;
            }
            $scope.isLoading = true;
            printService.generateCountingSheetPdf($scope.entryId, $scope.loadId).then(function(data) {
                var fileId = data.fileId ? data.fileId : data.fieldId;
                if (fileId) {
                    printService.pdfPrint(fileId, $scope.printerName).then(function () {
                        $scope.isLoading = false;
                        lincUtil.messagePopup("Success", "Data has been sent to printer successfully");
                    }, function (error) {
                        $scope.isLoading = false;
                        lincUtil.processErrorResponse(error);
                    });
                }
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.iframeResize = function(obj) {
            obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
        };

        $scope.printerSelect = function(printer) {
            $scope.printerName = printer.printerName;
        };

        function init() {
            $scope.entryId = $stateParams.entryId;
            $scope.loadId = $stateParams.loadId;
            $scope.data = '/wms-app/outbound/entry/' + $scope.entryId + '/load/' + $scope.loadId + '/counting-sheet/preview';
            $scope.printerType = ["PDF"];
        }

        init();
    };

    printPageController.$inject = ['$scope', '$cookies', '$stateParams', 'printService', 'lincUtil'];

    return printPageController;
});