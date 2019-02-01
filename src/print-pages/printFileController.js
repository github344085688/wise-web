'use strict';

define([], function() {
    var printPageController = function($scope, $cookies, $stateParams, printService, lincUtil) {
        $scope.print = function() {
            if (!$scope.printerName) {
                lincUtil.errorPopup("Please select a printer to print");
                return;
            }
            $scope.isLoading = true;
            if ($stateParams.fileId) {
                var printer = $scope.printerName;
                printService.pdfPrint(fileId, printer).then(function () {
                    $scope.isLoading = false;
                    lincUtil.messagePopup("Success", "Data has been sent to printer successfully");
                }, function (error) {
                    $scope.isLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            }
        };

        $scope.iframeResize = function(obj) {
            obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
        };

        $scope.getClass = function (message) {
            if("Operation"===message.type){
                return "alert-warning";
            }
            if("Setting"===message.type){
                return "alert-danger";
            }
            return "alert-info";
        };

        $scope.printerSelect = function(printer) {
            $scope.printerName = printer.printerName;
        };

        function init() {
            $scope.data = '/file-app/file-download/' + $stateParams.fileId;
            $scope.printerType = "PDF";
        }
        init();
    };

    printPageController.$inject = ['$scope', '$cookies', '$stateParams', 'printService', 'lincUtil'];

    return printPageController;
});
