'use strict';

define([], function() {
    var printPageController = function($scope, $cookies, $stateParams, printService, lincUtil, loadsService, transloadTaskService) {
        $scope.print = function() {
            if (!$scope.printerName) {
                lincUtil.errorPopup("Please select a printer to print");
                return;
            }
            $scope.isLoading = true;
            printService.generateMasterBolPdf($scope.loadIds).then(function(data) {
                var fileId = data.fileId ? data.fileId : data.fieldId;
                if (fileId) {
                    var printer = $scope.printerName;
                    printService.pdfPrint(fileId, printer).then(function () {
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

        $scope.getMessages = function () {
            $scope.hasMessage = false;
            printService.getMasterBolWarning($scope.loadIds).then(function (messages) {
                if(messages && messages.length>0) {
                    $scope.hasMessage = true;
                    $scope.messages = messages;
                }
            },function (error) {
                lincUtil.processErrorResponse(error);
            });
        };

        $scope.printerSelect = function(printer) {
            $scope.printerName = printer.printerName;
        };

        $scope.areTransloadLoads = false;
        function checkIfLoadIsTransload() {
            loadsService.areAllTransload($scope.loadIds ? $scope.loadIds.split(",") : []).then(function(isTransload){
                $scope.areTransloadLoads = isTransload;
            })
        }

        $scope.closeTransLoadShippingStep = function () {
          $scope.isCloseLoading = true;
          transloadTaskService.closeTransLoadShippingStep($scope.loadIds.split(","),$scope,'isCloseLoading');
        };

        function init() {
            $scope.loadIds = $stateParams.loadIds;
            checkIfLoadIsTransload();
            printService.generateMasterBolPdf($scope.loadIds).then(function(data){
                var fileId = data.fileId ? data.fileId : data;
                $scope.data = '/file-app/file-view/' + fileId;
            }, function(err){
                lincUtil.processErrorResponse(err)
            });

            $scope.getMessages();
            $scope.printerType = ["PDF"];
        }
        init();
    };

    printPageController.$inject = ['$scope', '$cookies', '$stateParams', 'printService', 'lincUtil', 'loadsService', 'transloadTaskService'];

    return printPageController;
});
