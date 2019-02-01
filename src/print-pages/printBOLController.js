'use strict';

define([ 
    'angular',
    'lodash'], function (angular, _) {
    var printPageController = function ($scope,$q, $stateParams, printService, lincUtil, transloadTaskService, loadsService) {
        $scope.print = function () {
            if (!$scope.printerName) {
                lincUtil.errorPopup("Please select a printer to print");
                return;
            }
            $scope.isLoading = true;
            printService.generateBolPdf($scope.loadId).then(function (data) {
                var fileIds = data.fileIds ? data.fileIds: data;
                if (fileIds && fileIds.length > 0) {
                    var printer = $scope.printerName;
                    var promises = [];
                    _.forEach(fileIds,function(fileId){
                        promises.push(printService.pdfPrint(fileId, printer));
                    });
                    $q.all(promises).then(function () {
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
            printService.getBolWarning($scope.loadId).then(function (messages) {
                if(messages && messages.length>0){
                    $scope.hasMessage = true;
                    $scope.messages = messages;
                }
            });
        };

        $scope.printerSelect = function (printer) {
                $scope.printerName = printer.printerName;
        };

        $scope.closeTransLoadShippingStep = function () {
             $scope.isCloseLoading = true;
            transloadTaskService.closeTransLoadShippingStep([$scope.loadId],$scope,'isCloseLoading');

        };

        $scope.areTransloadLoads = false;
        
        function checkIfLoadIsTransload() {
            loadsService.areAllTransload([$scope.loadId]).then(function(isTransload){
                 $scope.areTransloadLoads = isTransload;
            })
        }

        function init() {
            $scope.loadId = $stateParams.loadId;
            checkIfLoadIsTransload();
            printService.generateBolPdf($scope.loadId).then(function(data){
                var fileIds = data.fileIds ? data.fileIds: data;
                if(fileIds && fileIds.length > 0 ) {
                    $scope.data = '/file-app/file-view/' + fileIds[0];
                }
            }, function(error){
                lincUtil.processErrorResponse(error);
            });
            $scope.getMessages();
            $scope.printerType = ["PDF"];
        }
        init();
    };

     printPageController.$inject = ['$scope', '$q', '$stateParams', 'printService', 'lincUtil','transloadTaskService', 'loadsService'];

    return printPageController;
});
