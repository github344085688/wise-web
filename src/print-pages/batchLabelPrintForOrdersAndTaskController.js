'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope,$q, $window, $resource, $mdDialog, printService, lincUtil, pickTasks, orderIds, session, pickService, orderService) {


        $scope.isPrinting = false;
        $scope.pickTasks = pickTasks;
        $scope.orderIds = orderIds;
        $scope.printLabelSelection = {
            palletLabel: true,
            uccLabel: true,
            packingList: true,
            pickTicket: true
        };

        var PICKTICKETLABLE = "Pick Ticket", UCCLABEL = "UCC Label", PALLETLABEL = "Pallet Label", PACKINGLISTLABEL="Packing List";

        (function init(){
             $scope.orderPickTaskIdMap = {};
             _.forEach($scope.pickTasks, function(pickTask){
                 _.forEach(pickTask.orderIds, function(orderId){
                     $scope.orderPickTaskIdMap[orderId] = pickTask.id;
                 });
             });
            $scope.pickTaskIds = _.map($scope.pickTasks, "id");
        })();

        $scope.logger = {};

        $scope.onPrintLabelChecked = function(labelOption){
            $scope.printLabelSelection[labelOption] = !$scope.printLabelSelection[labelOption];
        };

        $scope.ZplPrinterSelect = function (printer) {
            $scope.zplPrinter = printer;
        };

        $scope.PdfPrinterSelect = function (printer) {
            $scope.pdfPrinter = printer;
        };

        $scope.batchPrint = function() {

            if(!$scope.zplPrinter && ($scope.printLabelSelection.packingList )) {
                return;
            }
            if(!$scope.pdfPrinter && ($scope.printLabelSelection.palletLabel || $scope.printLabelSelection.uccLabel || $scope.printLabelSelection.pickTicket)) {
                return;
            }

            var printPromises = [];
            printPromises.push(printLabelOrderByOrder(orderIds, 0));

            $scope.isPrinting = true;
            $q.all(printPromises).finally(function(){
                $scope.isPrinting = false;
            })

        };

        function printLabelOrderByOrder(orderIds, index) {
            var orderId = orderIds[index];
            var promisese = [];
            if($scope.printLabelSelection.pickTicket) {
                promisese.push(getPickTicketLabel($scope.orderPickTaskIdMap[orderId], orderId));
            }
            if($scope.printLabelSelection.palletLabel) {
                promisese.push(getPalletLabel(orderId));

            }

            if($scope.printLabelSelection.uccLabel) {
                promisese.push(getUCCLabel(orderId));
            }

            if($scope.printLabelSelection.packingList) {
                promisese.push(getPackingList(orderId));
            }

            var defer = $q.defer();
            if(promisese.length > 0) {
                $q.all(promisese).then(function (responses) {
                    if (_.every(responses, 'success')) {
                        var groupedResponses = _.groupBy(responses , function(data){
                              return data.printer.type === "PDF"
                        });
                        var printPromises = [];
                        for (var key in groupedResponses) {
                            printPromises.push(sendDataToPrinterAndTriggerNextOrderPrint(groupedResponses[key]));
                        }
                        $q.all(printPromises).finally(function(){
                            index = index + 1;
                            if (orderIds.length > index) {
                                printLabelOrderByOrder(orderIds, index).finally(function () {
                                    defer.resolve("Complete");
                                });
                            } else {
                                defer.resolve("Complete");
                            }
                        });
                    } else {
                        index = index + 1;
                        if (orderIds.length > index) {
                            printLabelOrderByOrder(orderIds, index).finally(function () {
                                defer.resolve("Complete");
                            });
                        } else {
                            defer.resolve("Complete");
                        }
                    }
                });
            } else {
                defer.resolve("Complete");
            }
            return  defer.promise;
        }

        function getPrintPromise(printerAndData) {
            if(printerAndData.printer.type === "PDF") {
                return printService.pdfPrint(printerAndData.data.fileId, printerAndData.printer.printerName);
            } else {
                return printService.zplPrint(printerAndData.data.id, printerAndData.printer);
            }
        }

        function sendDataToPrinterAndTriggerNextOrderPrint(responses) {
            
           return getOneByOneExecutionPromise(responses, 0);
        }

        function getOneByOneExecutionPromise(printerAndDatas, index) {
            var defer = $q.defer();
            var printerAndData = printerAndDatas[index];
            getPrintPromise(printerAndData).then(function (res) {
                pushLog(printerAndData.orderId, printerAndData.labelType, null, printerAndData.pickTaskId);
            }, function (err) {
                pushLog(printerAndData.orderId, printerAndData.labelType, err, null, printerAndData.pickTaskId);
            }).finally(function () {
                index++;
                if (index < printerAndDatas.length) {
                    getOneByOneExecutionPromise(printerAndDatas, index).finally(function(){
                        defer.resolve("Complete");
                    });
                }else {
                    defer.resolve("Complete");
                }
            });
            return defer.promise;
        }

        function getPalletLabel(orderId) {

             return printService.ordersPalletLabelPrint([orderId]).then(function(data){
               return {printer: $scope.zplPrinter, data: data , orderId: orderId, labelType: PALLETLABEL, success: true};
            },function(err){
                 pushLog(orderId, PALLETLABEL, err, null);
                 return {success: false, err: err};
             });
        }

        function getUCCLabel(orderId) {
            return printService.getUCCLabelPrint(orderId).then(function(data){
               return {printer: $scope.zplPrinter, data: data , orderId: orderId, labelType: UCCLABEL, success: true};
            },function(err){
                pushLog(orderId, UCCLABEL, err, null);
                return {success: false, err: err};
            });
        }

        function getPickTicketLabel(pickTaskId, orderId) {
            return printService.getPickTicketLabelPrint(pickTaskId).then(function(data){
               return {printer: $scope.zplPrinter, data: data , orderId: orderId, pickTaskId: pickTaskId, labelType: PICKTICKETLABLE, success: true};
            },function(err){
                pushLog(orderId, PICKTICKETLABLE, err, pickTaskId);
                return {success: false, err: err};
            });
        }

        function getPackingList(orderId) {
            return printService.generateOrderPackingListPdf(orderId).then(function(data){
               return {printer: $scope.pdfPrinter, data: data , orderId: orderId, labelType: PACKINGLISTLABEL, success:true};
            },function(err){
                pushLog(orderId, PACKINGLISTLABEL, err, null);
                return {success: false, err: err};
            });
        }

        function pushLog(orderId, labelName, error , pickTaskId) {
                if(!$scope.logger[orderId]) {
                    $scope.logger[orderId] = [];
                }
                 $scope.logger[orderId].push({errorMessage: error ? lincUtil.getProcessErrorResponseMessage(error): null, labelName: labelName, pickTaskId: pickTaskId});
        }


        $scope.cancel = function () {
            $mdDialog.hide();
        };
    };

    controller.$inject = ['$scope', '$q' , '$window', '$resource', '$mdDialog', 'printService', 'lincUtil', 'pickTasks','orderIds', 'session', 'pickService', 'orderService'];

    return controller;
});