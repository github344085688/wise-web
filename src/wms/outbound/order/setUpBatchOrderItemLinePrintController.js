'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $window, $resource, $mdDialog, printService, lincUtil, orderIds, session, orderService,itemSpecId) {

        $scope.orderIds =orderIds.join(',');
        $scope.printShippingLabelSetUp = {
            itemQty: 1,
            isPrintPackingList: false,
            isShowPdfPrinter: false
        };
        $scope.printLogs = [];
        var pringLogIndex = 0;
        var originOrderItemLines=[];
        $scope.print = function ($event) {
            $event.stopPropagation();
            $scope.isLoading = true;
            var orderItemLines = _.sortBy($scope.orderItemLines, function(o) { return o.itemSpecId; });   
            initPrintLogWhenPrint();
            if (!isMatchPrintQtyAndCalculateAvailbleQty(orderItemLines)) {
                return;
            };

            mergeNeedToPrintItemLines = [];
     
            mergePrintItemLines(orderItemLines, function () {
                printItemIndex = 0;
                printShippingLabel(mergeNeedToPrintItemLines[printItemIndex]);
            });

        }

        $scope.judgeColor = function (pro, printLog) {
            if (printLog.printFail) {
                if (pro.indexOf('Success') > 0) {
                    return 'olivedrab';
                } else {
                    return 'red';
                }
            } else {
                if (pro.indexOf('Failed') > 0) {
                    return 'red';
                } else {
                    return 'olivedrab';
                }

            }
        }

        var mergeNeedToPrintItemLines = [];
        var printItemIndex = 0;

        function mergePrintItemLines(orderItemLines, callback) {

            _.forEach(orderItemLines, function (itemLine) {
                if (itemLine.qty === itemLine.beenPrintedTrackingNos.length) return;
                fetchTrackingNoItemToArray(itemLine);
                unFetchTrackingNoItemToArray(itemLine);
            });
            if (callback) {
                callback();
            }
        }

        function unFetchTrackingNoItemToArray(itemLine) {
            _.forEach(itemLine.unPrintedTrackingNos, function (unPrint) {
                if ($scope.printShippingLabelSetUp.itemQty === unPrint.qty) {
                    var trackingNos = [unPrint.trackingNo];
                    var printItemLogInfo = {
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        'itemSpecName': itemLine.itemSpecName,
                        "itemWeight": itemLine.itemWeight
                    };
                    $scope.toPrintCount += 1;
                    var printSingleItemLine = {
                        trackingNos: trackingNos,
                        printItemLogInfo: printItemLogInfo
                    }
                    mergeNeedToPrintItemLines.push(printSingleItemLine);
                }

            });
        }

        function fetchTrackingNoItemToArray(itemLine) {
            var unPrintQty = _.sum(_.map(itemLine.unPrintedTrackingNos, 'qty'));
            var beenPrintQty = _.sum(_.map(itemLine.beenPrintedTrackingNos, 'qty'));
            var theRestQty = itemLine.qty - beenPrintQty - unPrintQty;
            var printCount = _.floor((theRestQty) / $scope.printShippingLabelSetUp.itemQty);
            for (var i = 0; i < printCount; i++) {
                var itemList = [{
                    "orderId": itemLine.orderId,
                    "itemSpecId": itemLine.itemSpecId,
                    "unitId": itemLine.unitId,
                    "qty": $scope.printShippingLabelSetUp.itemQty,
                    "itemWeight": itemLine.itemWeight,
                    "totalInsuranceAmount": itemLine.insuranceAmountPerCurrentUnit * $scope.printShippingLabelSetUp.itemQty
                }];
                var printItemLogInfo = {
                    "orderId": itemLine.orderId,
                    "itemSpecId": itemLine.itemSpecId,
                    'itemSpecName': itemLine.itemSpecName
                };

                var printSingleItemLine = {
                    itemList: itemList,
                    printItemLogInfo: printItemLogInfo
                }
                mergeNeedToPrintItemLines.push(printSingleItemLine);
            };
        }

        function printShippingLabel(mergeitemLine) {
            if (mergeitemLine.trackingNos) {
                printWithDatasAccordingCustomerPrintType(mergeitemLine.trackingNos, mergeitemLine.printItemLogInfo);
            }
            if (mergeitemLine.itemList) {
                getPrintShippingmentTrackingNoAndPrint(mergeitemLine.itemList, mergeitemLine.printItemLogInfo)
            }

        }

        var id = 0;

        function initPrintLogWhenPrint() {
            pringLogIndex = 0;
            id += 1;
            $scope.printLog = {};
            $scope.printLog.id = id ;
            $scope.printLog.orderIds = orderIds;
            $scope.printLog.printHeader = {};
            $scope.printLog.printHeader.createTime = new Date();
            $scope.printLog.printHeader.itemQty = $scope.printShippingLabelSetUp.itemQty;
            $scope.printLog.printInprogress = [];
        }
        function isMatchPrintQtyAndCalculateAvailbleQty(printItemLines) {
            var result = true;
            $scope.toPrintCount = 0;
            $scope.unPrintedTrackingNoTotalQty = 0;
            $scope.beenPrintedTotalQty = 0;
            _.forEach(printItemLines, function (itemLine) {
                var unPrintQty = _.sum(_.map(itemLine.unPrintedTrackingNos, 'qty'));
                $scope.unPrintedTrackingNoTotalQty += unPrintQty;
                var beenPrintQty = _.sum(_.map(itemLine.beenPrintedTrackingNos, 'qty'));
                $scope.beenPrintedTotalQty += beenPrintQty;
                var theRestQty = itemLine.qty - beenPrintQty - unPrintQty;
                $scope.toPrintCount += _.floor(theRestQty / $scope.printShippingLabelSetUp.itemQty);
            });
            $scope.printLog.printHeader.totalQty = _.sum(_.map(printItemLines, 'qty'));
            $scope.printLog.printHeader.beenPrintedTotalQty = $scope.beenPrintedTotalQty;

            if ($scope.toPrintCount === 0) {
                if ($scope.unPrintedTrackingNoTotalQty === 0) {
                    $scope.printLog.printInprogress.push('All of item had been printed.');
                    $scope.printLogs.unshift($scope.printLog);
                    result = false;
                    $scope.isLoading =false;

                } else {


                    _.forEach(printItemLines, function (itemLine) {
                        _.forEach(itemLine.unPrintedTrackingNos, function (unPrint) {
                            if ($scope.printShippingLabelSetUp.itemQty != unPrint.qty) {
                                $scope.printLog.printFail = true
                                $scope.printLog.printInprogress.push('The tracking no ' + unPrint.trackingNo + ' related qty is not the same with Item qty per package');
                            }
                        });
                    });

                    if ($scope.printLog.printInprogress.length > 0) {
                        $scope.printLogs.unshift($scope.printLog);
                        result = false;
                    }



                }

            }
            return result;
        }

        function getPrintShippingmentTrackingNoAndPrint(itemList, printItemLogInfo) {
            var param = {};
            param.packageWeight = itemList[0].itemWeight;
            param.packageType = "CP";

            var customer = $scope.orderKeyById[printItemLogInfo.orderId].customer;
            if (!customer.shippingLabelPrintType || customer.shippingLabelPrintType === "Zebra") {
                param.labelType = "ZPL";
            } else {
                param.labelType = "PNG";
            }

            if ($scope.printShippingLabelSetUp.isPrintPackingList || param.labelType === "PNG") {
                param.labelType = "PNG";
                param.printer = $scope.printer.pdfPrinter.printerName;
            } else {
                param.printer = $scope.printer.zplPrinter.printerName;
            }


            param.itemList = itemList;
            printService.createSmallParcelShipment(param).then(function (response) {;
                var shipmentLabels = response.shipmentLabels;
                var trackingNos = _.map(shipmentLabels, 'trackingNo');
                printWithDatasAccordingCustomerPrintType(trackingNos, printItemLogInfo);

            }, function (error) {

                var systemErrorMsg = lincUtil.getProcessErrorResponseMessage(error);
                recordfailedPrintLog(printItemLogInfo, systemErrorMsg);

            });
        }

        function printWithDatasAccordingCustomerPrintType(trackingNos, printItemLogInfo) {

            if (trackingNos.length === 0) return;

            var param = {
                trackingNos: trackingNos
            };
            searchBeenPrintedSmallParcelShipment(param, printItemLogInfo, function (response) {
                if (response.length === 0) return;
                var shippment = response[0];
                var trackingNo = trackingNos[0];
                if ($scope.printShippingLabelSetUp.isPrintPackingList || shippment.labelType != "ZPL") {
                    printPackagingLabelWithShippingLabel(trackingNo, printItemLogInfo);
                } else {
                    var decodedShippingLabel = $window.atob(shippment.shipmentLabel);
                    printZplWithDatas(decodedShippingLabel, trackingNo, printItemLogInfo);
                }
            });

        }

        function printPackagingLabelWithShippingLabel(trackingNo, printItemLogInfo) {
            orderService.getPackingListShippingLabelTogetherByTrackingNo(trackingNo).then(function (data) {
                printPdfWithDatas(data.fileId, trackingNo, printItemLogInfo);
            }, function (error) {

                var systemErrorMsg = lincUtil.getProcessErrorResponseMessage(error);
                recordfailedPrintLog(printItemLogInfo, systemErrorMsg, trackingNo);
            });
        }

        function printZplWithDatas(orderPrintBuffers, trackingNo, printItemLogInfo) {
            printService.PrintZplWithDatas(orderPrintBuffers, $scope.printer.zplPrinter).then(function (response) {

                updateSmallParcelShipment(trackingNo, trackingNo, printItemLogInfo);
                recordPrintLog(trackingNo, printItemLogInfo);
            }, function (error) {

                var systemErrorMsg = lincUtil.getProcessErrorResponseMessage(error);
                recordfailedPrintLog(printItemLogInfo, systemErrorMsg, trackingNo);

            });
        }

        function printPdfWithDatas(fileId, trackingNo, printItemLogInfo) {
            if (fileId) {
                var printerName = $scope.printer.pdfPrinter.printerName;
                printService.pdfPrint(fileId, printerName).then(function () {
                    updateSmallParcelShipment(trackingNo, printItemLogInfo);
                    recordPrintLog(trackingNo, printItemLogInfo);
                }, function (error) {
                    var systemErrorMsg = lincUtil.getProcessErrorResponseMessage(error);
                    recordfailedPrintLog(printItemLogInfo, systemErrorMsg, trackingNo);
                })
            } else {
                recordfailedPrintLog(printItemLogInfo, '', trackingNo);
            }


        }

        function recordPrintLog(trackingNo, printItemLogInfo) {
            checkingNoSuccessRecordToTable(trackingNo, printItemLogInfo)
            pringLogIndex += 1;
            var trackingNoInfo = trackingNo ? " Tracking #:" + trackingNo : "";
            var progress = "[" + pringLogIndex + "/" + $scope.toPrintCount + "] " + "  Order ID:" + printItemLogInfo.orderId + "  Item:" + printItemLogInfo.itemSpecName + trackingNoInfo + " --  Printed Success";

            if (_.find($scope.printLogs, {
                    id: id
                })) {
                _.forEach($scope.printLogs, function (log) {
                    if (log.id === id) {
                        var finishQty = $scope.printShippingLabelSetUp.itemQty;
                        log.printHeader.beenPrintedTotalQty = $scope.printLog.printHeader.beenPrintedTotalQty + finishQty;
                        log.printInprogress.unshift(progress)
                    }
                })
            } else {
                var finishQty = $scope.printShippingLabelSetUp.itemQty;
                $scope.printLog.printHeader.beenPrintedTotalQty = $scope.printLog.printHeader.beenPrintedTotalQty + finishQty;
                $scope.printLog.printInprogress.unshift(progress)
                $scope.printLogs.unshift($scope.printLog);
            }

            if (pringLogIndex === $scope.toPrintCount) {
                $scope.isLoading =false;
            } else {
                printItemIndex += 1;
                if (printItemIndex < mergeNeedToPrintItemLines.length) {
                    printShippingLabel(mergeNeedToPrintItemLines[printItemIndex]);
                }
            }
        }

        function recordfailedPrintLog(printItemLogInfo, systemErrorInfo, trackingNo) {
            if (trackingNo) {
                checkingNoPrintFailedeRecordToTable(trackingNo, printItemLogInfo)
            }
            pringLogIndex += 1;
            var systemErrorInfo = systemErrorInfo ? " (" + systemErrorInfo + ") " : "";
            var trackingNoInfo = trackingNo ? " Tracking #:" + trackingNo : "";
            var progress = "[" + pringLogIndex + "/" + $scope.toPrintCount + "] " + "  Order ID:" + printItemLogInfo.orderId + "  Item:" + printItemLogInfo.itemSpecName + trackingNoInfo + " --  Printed Failed " + systemErrorInfo;

            if (_.find($scope.printLogs, {
                    id: id
                })) {
                _.forEach($scope.printLogs, function (log) {
                    if (log.id === id) {
                        log.printInprogress.unshift(progress)
                    }
                })
            } else {
                $scope.printLog.printFail = true;
                $scope.printLog.printInprogress.unshift(progress)
                $scope.printLogs.unshift($scope.printLog);
            }

            if (pringLogIndex === $scope.toPrintCount) {
                $scope.isLoading =false;
            } else {
                printItemIndex += 1;
                if (printItemIndex < mergeNeedToPrintItemLines.length) {
                    printShippingLabel(mergeNeedToPrintItemLines[printItemIndex]);
                }
            }
        }

        function checkingNoPrintFailedeRecordToTable(trackingNo, printItemLogInfo) {

            _.forEach($scope.pickStrategies, function (ItemLine) {
                if (ItemLine.orderId === printItemLogInfo.orderId && ItemLine.itemSpecId === printItemLogInfo.itemSpecId) {
                    if (!_.find(ItemLine.unPrintedTrackingNos, {
                            trackingNo: trackingNo
                        })) {
                        ItemLine.unPrintedTrackingNos.push({
                            trackingNo: trackingNo,
                            isPrinted: false,
                            qty: $scope.printShippingLabelSetUp.itemQty
                        });
                    }

                }
            });
        }

        function checkingNoSuccessRecordToTable(trackingNo, printItemLogInfo) {
            _.forEach($scope.pickStrategies, function (ItemLine) {
                if (ItemLine.orderId === printItemLogInfo.orderId && ItemLine.itemSpecId === printItemLogInfo.itemSpecId) {
                    ItemLine.beenPrintedTrackingNos.push({
                        trackingNo: trackingNo,
                        isPrinted: true,
                        qty: $scope.printShippingLabelSetUp.itemQty
                    });
                }
                if (_.find(ItemLine.unPrintedTrackingNos, {
                        trackingNo: trackingNo
                    })) {
                    if (ItemLine.unPrintedTrackingNos.length == 1) {
                        ItemLine.unPrintedTrackingNos = [];
                    } else {
                        _.remove(ItemLine.unPrintedTrackingNos, function (unPrint) {
                            return unPrint.trackingNo == trackingNo;
                        })
                    }
                }

            });
        }

        function updateSmallParcelShipment(trackingNo, printItemLogInfo) {
            printService.updateSmallParcelShipment(trackingNo).then(function (response) {

            }, function (error) {
                var systemErrorMsg = lincUtil.getProcessErrorResponseMessage(error);
                recordfailedPrintLog(printItemLogInfo, systemErrorMsg, trackingNo);
            });
        }

        function searchBeenPrintedSmallParcelShipment(param, printItemLogInfo, callback) {
            printService.searchSmallParcelShipment(param).then(function (response) {
                if (callback) {
                    callback(response);
                }

            }, function (error) {
                var systemErrorMsg = lincUtil.getProcessErrorResponseMessage(error);
                recordfailedPrintLog(printItemLogInfo, systemErrorMsg);
            });
        }
        
        $scope.printer = {}
        $scope.searchAvailablePrinters = function (callback) {
            var param = {};
            printService.searchAvailablePrinters(param).then(function (printers) {
                $scope.ZplPrinters = _.filter(printers, function (printer) {
                    return printer.type === 'ZPL'|| printer.type === 'RAW'; 
                });
                $scope.PdfPrinters = _.filter(printers, function (printer) {
                    return printer.type === 'PDF';
                });
                if (callback) {
                    callback();
                }
            });
        };

        $scope.ZplPrinterSelect = function (printer) {
            $scope.printer.zplPrinter = printer;
        };

        $scope.PdfPrinterSelect = function (printer) {
            $scope.printer.pdfPrinter = printer;
        };

        $scope.selectItemLine = function(itemSpecId){
            if(itemSpecId){
                $scope.orderItemLines= _.filter(originOrderItemLines,{"itemSpecId": itemSpecId});
            }
        }

        function _init() {
            $scope.searchAvailablePrinters(function () {
                var zplPrintersKeyById = _.keyBy($scope.ZplPrinters, 'id');
                var zdfPrintersKeyById = _.keyBy($scope.PdfPrinters, 'id');
                var cf = session.getCompanyFacility();
                if (cf.facility.defaultZPLPrinter) {
                    var defaultZPLPrinterId = cf.facility.defaultZPLPrinter;
                    $scope.printer.zplPrinter = zplPrintersKeyById[defaultZPLPrinterId];
                }
                if (cf.facility.defaultPDFPrinter) {
                    var defaultPdfPrinterId = cf.facility.defaultPDFPrinter;
                    $scope.printer.pdfPrinter = zdfPrintersKeyById[defaultPdfPrinterId];
                }
            })

            searchOrderItemLine();


        }

        function searchOrderItemLine() {
            var param = {
                orderIds: orderIds
            };
            orderService.searchOrderItemLine(param).then(function (response) {
                originOrderItemLines =angular.copy(response.orderItemLines);
                $scope.orderItemLines = response.orderItemLines;
                $scope.itemLines = _.uniqBy(response.orderItemLines,"itemSpecId"); 
                if(itemSpecId){
                    $scope.orderItemLines= _.filter(response.orderItemLines,{"itemSpecId":itemSpecId});
                    $scope.printShippingLabelSetUp.itemSpecId = itemSpecId;    
                }else{
                    if( $scope.itemLines.length>0 ){
                        $scope.printShippingLabelSetUp.itemSpecId  = $scope.itemLines[0].itemSpecId;
                        $scope.orderItemLines= _.filter(response.orderItemLines,{"itemSpecId":$scope.itemLines[0].itemSpecId});
                    }
                  
                }
         
                setUpPrintPackingList(response.orders);
                $scope.orderKeyById = _.keyBy(response.orders, 'id');
                $scope.loadingComplete = true;
            }, function (error) {

            });
        }

        function setUpPrintPackingList(orders) {
            var customers = _.map(orders, 'customer');
            if (_.find(customers, {
                    shippingLabelPrintType: "PDF"
                })) {
                $scope.printShippingLabelSetUp.isPrintPackingList = true;
                $scope.printShippingLabelSetUp.isShowPdfPrinter = true;
            } else {
                $scope.printShippingLabelSetUp.isPrintPackingList = false;
                $scope.printShippingLabelSetUp.isShowPdfPrinter = false;
            }
        }

        _init();
        $scope.loadingComplete = false;
        $scope.cancel = function () {
            $mdDialog.hide();
        };

        $scope.showPdfPrinter = function () {
            if ($scope.printShippingLabelSetUp.isPrintPackingList) {
                $scope.printShippingLabelSetUp.isShowPdfPrinter = true;
            } else {
                    $scope.printShippingLabelSetUp.isShowPdfPrinter = false; 
            }
        }

    };

    controller.$inject = ['$scope', '$window', '$resource', '$mdDialog', 'printService', 'lincUtil', 'orderIds', 'session', 'orderService','itemSpecId'];

    return controller;
});