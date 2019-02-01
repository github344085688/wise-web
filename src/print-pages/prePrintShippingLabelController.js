'use strict';

define(["lodash",
    './voidLabelController'
], function (_, voidLabelController) {
    var $scope = function ($scope, $window, $http, $mdDialog, orderService, addressService, $stateParams, pickService, lincUtil, session, itemService, printService, $q, smallParcelShipmentService) {


        $scope.printShippingLabelParam = {
            itemQty: 1
        };
        $scope.commonSet = {
            isPrintPackingList: false
        }

        $scope.multiplePrintShippingLabelParam = {
            multiplePrintItemLines: [{
                itemQty: 0
            }],
            packingListTogetherWithLabel: false,
            packingListByOrder: false,
            shippingLabel: false,
            pickTicket_PDF: true,
            pickTicket_ZPL: false
        };

        $scope.printLogs = [];

        $scope.calculateItemWeight = function () {
            var itemList = [];
            _.forEach($scope.multiplePrintShippingLabelParam.multiplePrintItemLines, function (mulItemLine) {

                if (mulItemLine.itemQty) {
                    var itemLine = mulItemLine.selectItemLine;
                    var item = {
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": itemLine.unitId,
                        "qty": mulItemLine.itemQty,

                    };
                    itemList.push(item);
                }

            });
            if (itemList.length > 0) {
                smallParcelShipmentService.calculateItemWeight({
                    itemList: itemList
                }).then(function (response) {
                    $scope.multiplePrintShippingLabelParam.itemWeight = response.packageWeight;
                }, function (error) {

                });
            }

        }

        $scope.scanText = 'Scan Picket Ticket';
        $scope.getOrderItemLineFromPickTask = function (taskIdOrPickTicketId) {
            $scope.isLoadingTable = true;

            if (taskIdOrPickTicketId.indexOf('DN-') > -1) {
                $scope.scanText = 'Scan Order';
                searchOrderItemLine(taskIdOrPickTicketId);
                $scope.multiplePrintShippingLabelParam.pickTicket_PDF = false;

            } else {

                $scope.scanText = 'Scan Picket Ticket';
                searchOrderItemLineFromPickTask(taskIdOrPickTicketId);

            }


        };

        function searchOrderItemLine(taskIdOrPickTicketId) {
            var param = {
                orderIds: [taskIdOrPickTicketId]
            };

            $scope.isLoadingTable = true;
            orderService.searchOrderItemLine(param).then(function (response) {
                $scope.isLoadingTable = false;
                response.ordersItemLines = response.orderItemLines;
                $scope.task = response;
                $scope.orderKeyById = _.keyBy(response.orders, 'id');
                $scope.task.ordersItemLines = _.sortBy(response.ordersItemLines, function (item) {
                    return Number(item.orderId.split('-')[1]);
                });

                if (response.orderItemLines.length > 0) {
                    $scope.UnitKeyByUnitId = _.keyBy(_.flattenDeep(_.map(response.orderItemLines, 'itemUnits')), 'id');
                }
                transforPrintAndUnPrintQtyToItemQtyWithSameUnit(response.ordersItemLines);
                if ($scope.activetab != 'multiple') {
                    if ($scope.printShippingLabelParam.upc) {
                        markScanUpcItem();
                    } else {
                        setUpPrintPackingList(response.orders);
                    }
                }


            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function searchOrderItemLineFromPickTask(taskIdOrPickTicketId) {
            var param = {
                taskIdOrPickTicketId: taskIdOrPickTicketId
            };
            pickService.searchOrderItemLineFromPickTask(param).then(function (orderFrompickTask) {
                $scope.isLoadingTable = false;
                $scope.task = orderFrompickTask;
                $scope.orderKeyById = _.keyBy(orderFrompickTask.orders, 'id');
                $scope.task.ordersItemLines = _.sortBy(orderFrompickTask.ordersItemLines, function (item) {
                    return Number(item.orderId.split('-')[1]);
                });
                if (orderFrompickTask.ordersItemLines.length > 0) {
                    $scope.UnitKeyByUnitId = _.keyBy(_.flattenDeep(_.map(orderFrompickTask.ordersItemLines, 'itemUnits')), 'id');
                }
                transforPrintAndUnPrintQtyToItemQtyWithSameUnit(orderFrompickTask.ordersItemLines);
                if ($scope.activetab != 'multiple') {
                    if ($scope.printShippingLabelParam.upc) {
                        markScanUpcItem();
                    } else {
                        setUpPrintPackingList(orderFrompickTask.orders);
                    }

                }

            }, function (error) {

                lincUtil.processErrorResponse(error);
            });
        }


        $scope.judgeColor = function (pro, printLog) {

            if (pro.indexOf('Success') > 0) {
                return 'olivedrab';
            } else {
                return 'red';
            }


        };

        $scope.batchPrintShippingLabel = function () {
            $scope.printBatchStatus = true;
            $scope.readyToPrintItemLine = $scope.task.ordersItemLines;
            if (!$scope.commonSet.isPrintPackingList && !$scope.printer.zplPrinter) {
                lincUtil.errorPopup('Please Select ZPL Printer');
                return;
            }
            if (!$scope.printer.pdfPrinter) {
                lincUtil.errorPopup('Please Select Pdf Printer');
                return;
            }
            $scope.batchPrinting = true;
            print();
        };

        $scope.printShippingLabels = function () {
            $scope.printBatchStatus = false;
            $scope.isLoading = true;
            print();
        };


        function print() {
            if (!$scope.readyToPrintItemLine || $scope.readyToPrintItemLine.length === 0) {
                lincUtil.errorPopup('Please Scan correct upc.');
                judgeIsBatchOrSinglePrintLoadingToClose();
                return;
            }
            if (!$scope.commonSet.isPrintPackingList && $scope.printer.zplPrinter.printerName.indexOf(" ") > -1) {
                lincUtil.errorPopup('Selected Zpl printer name can not contain space.');
                judgeIsBatchOrSinglePrintLoadingToClose();
                return;
            }

            if ($scope.printer.pdfPrinter.printerName.indexOf(" ") > -1) {
                lincUtil.errorPopup('Selected Pdf printer name can not contain space.');
                judgeIsBatchOrSinglePrintLoadingToClose();
                return;
            }


            initPrintLogWhenPrint();
            if (!isMatchPrintQtyAndCalculateAvailbleQty()) {
                return;
            };

            mergeNeedToPrintItemLines = [];
            printItemIndex = 0;
            mergePrintItemLines(function () {
                printShippingLabel(mergeNeedToPrintItemLines[printItemIndex]);
            });
        }

        function taskTicketPrint(taskId, callback) {

            printService.taskTicketPrint(taskId).then(function (response) {
                var fileId = response.fileId;
                var printerName = $scope.printer.pdfPrinter.printerName;
                printService.pdfPrint(fileId, printerName).then(function () {
                    fillMsgTaskPrintSuccess();
                    if (callback) {
                        callback();
                    }
                }, function (error) {
                    fillErrorMsgWhenTaskPrintFail(error);
                    if (callback) {
                        callback();
                    }
                })

            }, function (error) {
                if (callback) {
                    callback();
                }
                fillErrorMsgWhenTaskPrintFail(error);
            });




        }

        function fillErrorMsgWhenTaskPrintFail(error) {
            var systemErrorMsg = "Pick ticket print failed (" + lincUtil.getProcessErrorResponseMessage(error) + ")";
            $scope.printLog.printFail = true;
            $scope.printLog.printInprogress.push(systemErrorMsg);
            if ($scope.activetab === 'multiple') {
                judgeIsBatchOrSinglePrintLoadingToClose();
            }
        }

        function fillMsgTaskPrintSuccess() {
            var msg = "Pick ticket print Success";
            $scope.printLog.printInprogress.push(msg);
        }


        var printLogIndex = 0;
        var id = 0;

        function initPrintLogWhenPrint() {
            printLogIndex = 0;
            $scope.printLog = {};
            id += 1;
            $scope.printLog.id = id;
            if ($scope.activetab === 'multiple') {
                $scope.printLog.printHeader = $scope.header;
            } else {
                $scope.printLog.printHeader = $scope.printShippingLabelParam;
            }

            $scope.printLog.printInprogress = [];
        }

        function isMatchPrintQtyAndCalculateAvailbleQty() {
            var result = true;
            $scope.toPrintCount = 0;
            $scope.unPrintedTrackingNoTotalQty = 0;
            $scope.beenPrintedTotalQty = 0;
            _.forEach($scope.readyToPrintItemLine, function (itemLine) {
                var beenPrintedTrackingNosWithSameUnit =  _.filter(itemLine.beenPrintedTrackingNos,function(beenPrinted){
                    return beenPrinted.itemLineDetail.unitId ===  itemLine.unitId;
                 });
                 var unPrintedTrackingNosWithSameUnit =  _.filter(itemLine.unPrintedTrackingNos,function(unPrinted){
                    return unPrinted.itemLineDetail.unitId ===  itemLine.unitId;
                });
                var unPrintQty = _.sum(_.map(unPrintedTrackingNosWithSameUnit, 'qty'));
                $scope.unPrintedTrackingNoTotalQty += unPrintQty;
                var beenPrintQty = _.sum(_.map(beenPrintedTrackingNosWithSameUnit, 'qty'));
                $scope.beenPrintedTotalQty += beenPrintQty;
                var theRestQty = itemLine.qty - beenPrintQty - unPrintQty;
                $scope.toPrintCount += _.floor(theRestQty / $scope.printShippingLabelParam.itemQty);
            });
            if ($scope.toPrintCount === 0) {
                if ($scope.unPrintedTrackingNoTotalQty === 0) {
                    $scope.printLog.printInprogress.push('All of item had been printed.');
                    $scope.printLogs.unshift($scope.printLog);
                    result = false;
                    judgeIsBatchOrSinglePrintLoadingToClose();

                } else {


                    _.forEach($scope.readyToPrintItemLine, function (itemLine) {
                        var unPrintedTrackingNosWithSameUnit =  _.filter(itemLine.unPrintedTrackingNos,function(unPrinted){
                            return unPrinted.itemLineDetail.unitId ===  itemLine.unitId;
                        });
                        _.forEach(unPrintedTrackingNosWithSameUnit, function (unPrint) {
                            if ($scope.printShippingLabelParam.itemQty != unPrint.qty) {
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

        function printShippingLabel(mergeitemLine) {
            if (mergeitemLine.trackingNos) {
                printWithDatasAccordingCustomerPrintType(mergeitemLine.trackingNos, mergeitemLine.printItemLogInfo);
            }
            if (mergeitemLine.itemList) {
                getPrintShippingmentTrackingNoAndPrint(mergeitemLine.itemList, mergeitemLine.printItemLogInfo)
            }

        }

        function unFetchTrackingNoItemToArray(itemLine) {
            var unPrintedTrackingNosWithSameUnit =  _.filter(itemLine.unPrintedTrackingNos,function(unPrinted){
                return unPrinted.itemLineDetail.unitId ===  itemLine.unitId;
            });
            _.forEach(unPrintedTrackingNosWithSameUnit, function (unPrint) {
                if ($scope.printShippingLabelParam.itemQty === unPrint.qty) {
                    var trackingNos = [unPrint.trackingNo];
                    var printItemLogInfo = {
                        "itemLineDetail": unPrint.itemLineDetail,
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        'itemSpecName': itemLine.itemSpecName,
                        "itemWeight": itemLine.itemWeight,
                        "totalInsuranceAmount": itemLine.insuranceAmountPerCurrentUnit * $scope.printShippingLabelParam.itemQty
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
            var beenPrintedTrackingNosWithSameUnit =  _.filter(itemLine.beenPrintedTrackingNos,function(beenPrinted){
                return beenPrinted.itemLineDetail.unitId ===  itemLine.unitId;
             });
             var unPrintedTrackingNosWithSameUnit =  _.filter(itemLine.unPrintedTrackingNos,function(unPrinted){
                return unPrinted.itemLineDetail.unitId ===  itemLine.unitId;
            });
            var unPrintQty = _.sum(_.map(unPrintedTrackingNosWithSameUnit, 'qty'));
            var beenPrintQty = _.sum(_.map(beenPrintedTrackingNosWithSameUnit, 'qty'));
            var theRestQty = itemLine.qty - beenPrintQty - unPrintQty;
            var printCount = _.floor((theRestQty) / $scope.printShippingLabelParam.itemQty);
            for (var i = 0; i < printCount; i++) {

                var itemList = [{
                    "orderId": itemLine.orderId,
                    "itemSpecId": itemLine.itemSpecId,
                    "unitId": itemLine.unitId,
                    "qty": $scope.printShippingLabelParam.itemQty,
                    "itemWeight": itemLine.itemWeight,
                    "totalInsuranceAmount": itemLine.insuranceAmountPerCurrentUnit * $scope.printShippingLabelParam.itemQty
                }];
                var printItemLogInfo = {
                    "itemLineDetail": {
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": itemLine.unitId,
                        "qty": $scope.printShippingLabelParam.itemQty,
                        "itemWeight": itemLine.itemWeight,
                        "totalInsuranceAmount": itemLine.insuranceAmountPerCurrentUnit * $scope.printShippingLabelParam.itemQty
                    },
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

        var mergeNeedToPrintItemLines = [];
        var printItemIndex = 0;

        function mergePrintItemLines(callback) {

            _.forEach($scope.readyToPrintItemLine, function (itemLine) {
                if (itemLine.qty === itemLine.beenPrintedTrackingNos.length) return;
                fetchTrackingNoItemToArray(itemLine);
                unFetchTrackingNoItemToArray(itemLine);

            });
            if (callback) {
                callback();
            }
        }


        function setUpPrintPackingList(orders) {
            var customers = _.map(orders, 'customer');
            if (_.find(customers, {
                    shippingLabelPrintType: "PDF"
                })) {
                $scope.commonSet.isPrintPackingList = true;
            } else {
                $scope.commonSet.isPrintPackingList = false;
            }
        }

        function getPrintShippingmentTrackingNoAndPrint(itemList, printItemLogInfo) {

            var param = {};

            if ($scope.activetab === 'multiple') {

                param.packageWeight = $scope.multiplePrintShippingLabelParam.itemWeight;
                param.packageId = $scope.multiplePrintShippingLabelParam.packageId;

                var customer = $scope.orderKeyById[itemList[0].orderId].customer;
                if (!customer.shippingLabelPrintType || customer.shippingLabelPrintType === "Zebra") {
                    param.labelType = "ZPL";
                } else {
                    param.labelType = "PNG";
                }



            } else {
                if ($scope.printBatchStatus) {
                    param.packageWeight = itemList[0].itemWeight;
                } else {
                    param.packageWeight = $scope.printShippingLabelParam.itemWeight;
                    param.packageId = $scope.printShippingLabelParam.packageId;
                }

                var customer = $scope.orderKeyById[printItemLogInfo.orderId].customer;
                if (!customer.shippingLabelPrintType || customer.shippingLabelPrintType === "Zebra") {
                    param.labelType = "ZPL";
                } else {
                    param.labelType = "PNG";
                }
            }

            param.packageType = "CP";

            if ($scope.commonSet.isPrintPackingList || $scope.multiplePrintShippingLabelParam.packingListTogetherWithLabel || param.labelType === "PNG") {
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

        function judgeSelectOrderSameLabelPrintTypeAndSameShipto(itemList) {
            var ret;
            var orderIds = _.uniq(_.map(itemList, 'orderId'));
            if (orderIds.length === 1) {
                ret = true
            } else {
                $scope.printLog.printStatus = "Fail";
                $scope.printLog.error = "select package item not same Order ";
                $scope.printLogs.unshift($scope.printLog);
                // var shippingLabelPrintTypes = [];
                // var shipToLists = [];
                // _.forEach(orderIds, function (orderId) {
                //     var customer = $scope.orderKeyById[orderId].customer;
                //     shipToLists.push($scope.orderKeyById[orderId].shipToAddress);
                //     if (!customer.shippingLabelPrintType || customer.shippingLabelPrintType === "Zebra") {
                //         shippingLabelPrintTypes.push("Zebra");
                //     } else {
                //         shippingLabelPrintTypes.push("PDF");
                //     }
                // });
                // if (_.uniq(shippingLabelPrintTypes).length === 1 && _.uniq(shipToLists).length === 1) {
                //     ret = true;
                // } else if (_.uniq(shippingLabelPrintTypes).length != 1) {
                //     $scope.printLog.printStatus = "Fail";
                //     $scope.printLog.error = {
                //         error: "select package item not same shipping Label Print Types "
                //     };
                // } else if (_.uniq(shipToLists).length != 1) {
                //     $scope.printLog.printStatus = "Fail";
                //     $scope.printLog.error = {
                //         error: "select package item not same Ship to "
                //     };
                // }
            }
            return ret;
        }

        function taskTicketPdfOrZplPrint(taskId, callback) {
            if ($scope.multiplePrintShippingLabelParam.pickTicket_PDF) {
                pickTicketPdfPrint(taskId, callback);
            } else if ($scope.multiplePrintShippingLabelParam.pickTicket_ZPL) {
                pickTicketZplPrint(taskId, callback);
            } else {
                if (callback) {
                    callback();
                }
            }

        }

        function pickTicketPdfPrint(taskId, callback) {
            printService.taskTicketPrint(taskId).then(function (response) {
                var fileId = response.fileId;
                var printerName = $scope.printer.pdfPrinter.printerName;
                printService.pdfPrint(fileId, printerName).then(function () {
                    fillMsgTaskPrintSuccess();
                    if (callback) {
                        callback();
                    }
                }, function (error) {

                    fillErrorMsgWhenTaskPrintFail(error)
                });

            }, function (error) {
                fillErrorMsgWhenTaskPrintFail(error)
            });
        }

        function pickTicketZplPrint(taskId, callback) {
            printService.print(printService.getPickTicketLabelPrint(taskId), $scope.printer.zplPrinter).then(
                function () {
                    fillMsgTaskPrintSuccess();
                    if (callback) {
                        callback();
                    }
                },
                function (error) {
                    fillErrorMsgWhenTaskPrintFail(error)
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

                if ($scope.multiplePrintShippingLabelParam.shippingLabel) {
                    var decodedShippingLabel = $window.atob(shippment.shipmentLabel);
                    printZplWithDatas(decodedShippingLabel, trackingNo, printItemLogInfo);
                }
                if ($scope.multiplePrintShippingLabelParam.packingListByOrder) {

                    getPackingListOnlyFileIDByTrackingNo(trackingNo, printItemLogInfo);

                } else if ($scope.commonSet.isPrintPackingList || $scope.multiplePrintShippingLabelParam.packingListTogetherWithLabel) {
                    printPackagingLabelWithShippingLabel(trackingNo, printItemLogInfo);
                } else if (!$scope.multiplePrintShippingLabelParam.shippingLabel) {
                    if ($scope.activetab === 'single') {
                        var decodedShippingLabel = $window.atob(shippment.shipmentLabel);
                        printZplWithDatas(decodedShippingLabel, trackingNo, printItemLogInfo);
                    }

                }


            });

        }

        function getPackingListOnlyFileIDByTrackingNo(trackingNo, printItemLogInfo) {
            printItemLogInfo = printItemLogInfo ? printItemLogInfo : {};
            var infor = angular.copy(printItemLogInfo);
            infor.isPackingListOnly = true;
            orderService.getPackingListOnlyFileIDByTrackingNo(trackingNo).then(function (data) {
                printPdfWithDatas(data.fileId, trackingNo, infor);
            }, function (error) {
                var systemErrorMsg = lincUtil.getProcessErrorResponseMessage(error);
                recordfailedPrintLog(infor, systemErrorMsg, trackingNo);
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
                if (!($scope.multiplePrintShippingLabelParam.shippingLabel && $scope.multiplePrintShippingLabelParam.packingListByOrder)){
                    updateSmallParcelShipment(trackingNo, printItemLogInfo);
                }

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
            if ($scope.activetab === "multiple") {
                $scope.printLog.trackingNo = trackingNo;
                if ($scope.multiplePrintShippingLabelParam.packingListByOrder || $scope.multiplePrintShippingLabelParam.shippingLabel) {


                    if ($scope.multiplePrintShippingLabelParam.packingListByOrder && $scope.multiplePrintShippingLabelParam.shippingLabel) {
                        if (printItemLogInfo.isPackingListOnly) {
                            $scope.printLog.pcInfor = ">>>>[Packing List] Print Success";
                        } else {
                            $scope.printLog.slInfor = ">>>>[Shipping Label] Print Success";
                            $scope.printLogs.unshift($scope.printLog);
                            $scope.printLog.printStatus = "Success";
                        }

                    } else if ($scope.multiplePrintShippingLabelParam.shippingLabel) {
                        $scope.printLog.slInfor = ">>>>[Shipping Label] Print Success";
                        $scope.printLogs.unshift($scope.printLog);
                        $scope.printLog.printStatus = "Success";
                    } else {
                        $scope.printLog.pcInfor = ">>>>[Packing List] Print Success";
                        $scope.printLogs.unshift($scope.printLog);
                        $scope.printLog.printStatus = "Success";
                    }

                } else if ($scope.multiplePrintShippingLabelParam.packingListTogetherWithLabel) {
                    $scope.printLog.pcInfor = "[Packing List | Shipping Label] Success";
                    $scope.printLogs.unshift($scope.printLog);
                } else {
                    $scope.printLog.pcInfor = "Print  Success";
                    $scope.printLogs.unshift($scope.printLog);
                }
                judgeIsBatchOrSinglePrintLoadingToClose();
            } else {

                printLogIndex += 1;
                var progress = "[" + printLogIndex + "/" + $scope.toPrintCount + "] " + "  Order ID:" + printItemLogInfo.orderId + "  Item:" + printItemLogInfo.itemSpecName + " --  Printed Success";

                if (_.find($scope.printLogs, {
                        id: id
                    })) {
                    _.forEach($scope.printLogs, function (log) {
                        if (log.id === id) {
                            log.printInprogress.unshift(progress)
                        }
                    })
                } else {
                    $scope.printLog.printInprogress.unshift(progress)
                    $scope.printLogs.unshift($scope.printLog);
                }

                if (printLogIndex === $scope.toPrintCount) {
                    judgeIsBatchOrSinglePrintLoadingToClose();
                }
                printItemIndex += 1;
                if (printItemIndex < mergeNeedToPrintItemLines.length) {
                    printShippingLabel(mergeNeedToPrintItemLines[printItemIndex]);
                } else {
                    taskTicketPrint($stateParams.taskId);
                }
            }
        }


        function recordfailedPrintLog(printItemLogInfo, systemErrorInfo, trackingNo) {
            if (trackingNo) {
                checkingNoPrintFailedeRecordToTable(trackingNo, printItemLogInfo)
            }
            if ($scope.activetab === "multiple") {

                $scope.printLog.trackingNo = trackingNo;
                if ($scope.multiplePrintShippingLabelParam.packingListByOrder || $scope.multiplePrintShippingLabelParam.shippingLabel) {

                    if ($scope.multiplePrintShippingLabelParam.packingListByOrder && $scope.multiplePrintShippingLabelParam.shippingLabel) {
                        if (printItemLogInfo.isPackingListOnly) {
                            $scope.printLog.pcInfor = ">>>>[Packing List] Print Failed (" + systemErrorInfo + ")";
                        } else {
                            $scope.printLog.slInfor = ">>>>[Shipping Label] Print Failed (" + systemErrorInfo + ")";
                            $scope.printLogs.unshift($scope.printLog);
                            $scope.printLog.printStatus = "Fail";
                        }

                    } else if ($scope.multiplePrintShippingLabelParam.shippingLabel) {
                        $scope.printLog.slInfor = ">>>>[Shipping Label] Print Failed (" + systemErrorInfo + ")";
                        $scope.printLogs.unshift($scope.printLog);
                        $scope.printLog.printStatus = "Fail";
                    } else {
                        $scope.printLog.pcInfor = ">>>>[Packing List] Print Failed (" + systemErrorInfo + ")";
                        $scope.printLogs.unshift($scope.printLog);
                        $scope.printLog.printStatus = "Fail";
                    }

                } else if ($scope.multiplePrintShippingLabelParam.packingListTogetherWithLabel) {
                    $scope.printLog.error = "[Packing List | Shipping Label] Print Failed " + systemErrorInfo;
                    $scope.printLogs.unshift($scope.printLog);
                } else {
                    $scope.printLog.error = "Print Failed " + systemErrorInfo;
                    $scope.printLogs.unshift($scope.printLog);
                }


                judgeIsBatchOrSinglePrintLoadingToClose();
            } else {

                printLogIndex += 1;
                var systemErrorInfo = systemErrorInfo ? " (" + systemErrorInfo + ") " : "";
                var trackingNoInfo = trackingNo ? " Tracking #:" + trackingNo : "";
                var progress = "[" + printLogIndex + "/" + $scope.toPrintCount + "] " + "  Order ID:" + printItemLogInfo.orderId + "  Item:" + printItemLogInfo.itemSpecName + trackingNoInfo + " --  Printed Failed " + systemErrorInfo;

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

                if (printLogIndex === $scope.toPrintCount) {
                    judgeIsBatchOrSinglePrintLoadingToClose();
                }

                printItemIndex += 1;
                if (printItemIndex < mergeNeedToPrintItemLines.length) {
                    printShippingLabel(mergeNeedToPrintItemLines[printItemIndex]);
                } else {
                    taskTicketPrint($stateParams.taskId);
                }

            }

        }

        function checkingNoPrintFailedeRecordToTable(trackingNo, printItemLogInfo) {

            if ($scope.activetab === "multiple") {
                _.forEach(mulItemLinesReadyToPrint, function (mulItemLine) {
                    _.forEach($scope.task.ordersItemLines, function (orderItemLine) {
                        if (orderItemLine.orderId === mulItemLine.orderId && orderItemLine.itemSpecId === mulItemLine.itemSpecId) {
                            if (!_.find(orderItemLine.unPrintedTrackingNos, {
                                    trackingNo: trackingNo
                                })) {
                                orderItemLine.unPrintedTrackingNos.push({
                                    itemLineDetail: mulItemLine,
                                    trackingNo: trackingNo,
                                    isPrinted: false,
                                    qty: mulItemLine.qty
                                });
                            }
                        }
                    })
                })

            } else {
                _.forEach($scope.task.ordersItemLines, function (ItemLine) {
                    if (ItemLine.orderId === printItemLogInfo.orderId && ItemLine.itemSpecId === printItemLogInfo.itemSpecId) {
                        if (!_.find(ItemLine.unPrintedTrackingNos, {
                                trackingNo: trackingNo
                            })) {
                            ItemLine.unPrintedTrackingNos.push({
                                itemLineDetail: printItemLogInfo.itemLineDetail,
                                trackingNo: trackingNo,
                                isPrinted: false,
                                qty: $scope.printShippingLabelParam.itemQty
                            });
                        }

                    }
                });

            }
            transforPrintAndUnPrintQtyToItemQtyWithSameUnit($scope.task.ordersItemLines);
        }

        function checkingNoSuccessRecordToTable(trackingNo, printItemLogInfo) {

            if ($scope.activetab === "multiple") {

                _.forEach(mulItemLinesReadyToPrint, function (mulItemLine) {
                    _.forEach($scope.task.ordersItemLines, function (orderItemLine) {
                        if (orderItemLine.orderId === mulItemLine.orderId && orderItemLine.itemSpecId === mulItemLine.itemSpecId && !(_.find(orderItemLine.beenPrintedTrackingNos, {
                                trackingNo: trackingNo
                            }))) {
                            orderItemLine.beenPrintedTrackingNos.push({
                                itemLineDetail: mulItemLine,
                                trackingNo: trackingNo,
                                isPrinted: true,
                                qty: mulItemLine.qty
                            });
                        }
                        if (_.find(orderItemLine.unPrintedTrackingNos, {
                                trackingNo: trackingNo
                            })) {
                            if (orderItemLine.unPrintedTrackingNos.length <= 1) {
                                orderItemLine.unPrintedTrackingNos = [];
                            } else {
                                _.remove(orderItemLine.unPrintedTrackingNos, function (unPrint) {
                                    return unPrint.trackingNo == trackingNo;
                                })
                            }
                        }
                    })
                })

            } else {
                _.forEach($scope.task.ordersItemLines, function (ItemLine) {
                    if (ItemLine.orderId === printItemLogInfo.orderId && ItemLine.itemSpecId === printItemLogInfo.itemSpecId) {
                        ItemLine.beenPrintedTrackingNos.push({
                            itemLineDetail: printItemLogInfo.itemLineDetail,
                            trackingNo: trackingNo,
                            isPrinted: true,
                            qty: $scope.printShippingLabelParam.itemQty
                        });
                    }
                    if (_.find(ItemLine.unPrintedTrackingNos, {
                            trackingNo: trackingNo
                        })) {
                        if (ItemLine.unPrintedTrackingNos.length <= 1) {
                            ItemLine.unPrintedTrackingNos = [];
                        } else {
                            _.remove(ItemLine.unPrintedTrackingNos, function (unPrint) {
                                return unPrint.trackingNo == trackingNo;
                            })
                        }
                    }

                });

            }
            transforPrintAndUnPrintQtyToItemQtyWithSameUnit($scope.task.ordersItemLines);
        }

        function updateSmallParcelShipment(trackingNo, printItemLogInfo) {
            printService.updateSmallParcelShipment(trackingNo).then(function (response) {
                if ($scope.activetab === 'multiple') {
                    taskTicketPdfOrZplPrint($stateParams.taskId);
                }
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

        $scope.getAddressInfo = function (addressObject) {
            return addressService.generageAddressData(addressObject, null);
        };

        $scope.voidLabel = function () {
            var beenPrintedTrackingNos = _.map($scope.task.ordersItemLines, 'beenPrintedTrackingNos');
            var unPrintedTrackingNos = _.map($scope.task.ordersItemLines, 'unPrintedTrackingNos');
            var trackingNos = _.union(_.map(_.flattenDeep(beenPrintedTrackingNos), 'trackingNo'), _.map(_.flattenDeep(unPrintedTrackingNos), 'trackingNo'));
            $mdDialog.show({
                templateUrl: 'print-pages/template/voidLabel.html',
                controller: voidLabelController,
                controllerAs: 'ctrl',
                locals: {
                    trackingNos: trackingNos
                },
                bindToController: true
            }).then(function (obj) {
                if (!obj) return;
                var trackingNos = obj.trackingNos;
                if (!trackingNos || trackingNos.length == 0) return;
                $scope.isVoidLabelLoading = true;
                trackingNos = _.uniq(trackingNos);
                pickService.voidTrackingNo({
                    trackingNos: trackingNos
                }).then(function () {
                    lincUtil.updateSuccessfulPopup();
                    var taskId;
                    if ($scope.printShippingLabelParam.taskIdOrPickTicketId) {
                        taskId = $scope.printShippingLabelParam.taskIdOrPickTicketId;
                    } else {
                        taskId = $stateParams.taskId;
                    }

                    $scope.multiplePrintShippingLabelParam = {
                        multiplePrintItemLines: [{
                            itemQty: 0
                        }],
                        packingListTogetherWithLabel: false,
                        packingListByOrder: false,
                        shippingLabel: false,
                        pickTicket_PDF: true,
                        pickTicket_ZPL: false
                    };

                    $scope.getOrderItemLineFromPickTask(taskId);
                    $scope.isVoidLabelLoading = false;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                    $scope.isVoidLabelLoading = false;
                });

            });

        };

        $scope.itemSpecIdOnSelect = function (item) {
            itemService.searchItemUnits({
                itemSpecId: item.id
            }).then(function (unitsObj) {
                angular.forEach(unitsObj.units, function (unit) {
                    if (unit.isBaseUnit) {
                        if ($scope.activetab === 'multiple') {
                            $scope.multiplePrintShippingLabelParam.boxInfo = unit.length + "*" + unit.width + "*" + unit.height + " (" + unit.linearUnit + ")";
                        } else {
                            $scope.printShippingLabelParam.boxInfo = unit.length + "*" + unit.width + "*" + unit.height + " (" + unit.linearUnit + ")";

                        }
                        return;
                    }
                });

            });

        };

        $scope.keyUpSearch = function ($event, type) {
            if (!$event) {
                return;
            }
            if ($event.keyCode === 13) {
                if (type === 'ScanPicketTicket') {
                    if (!$scope.printShippingLabelParam.taskIdOrPickTicketId) return;
                    $scope.getOrderItemLineFromPickTask($scope.printShippingLabelParam.taskIdOrPickTicketId);
                    initDataWhenScanPicketTicket();

                    angular.element('#upcCode').focus();
                }
                if (type === 'ScanUPC') {
                    markScanUpcItem();
                    angular.element('#package').focus();

                }
            }
            $event.preventDefault();
        };

        function initDataWhenScanPicketTicket() {
            $scope.task = {};
            $scope.readyToPrintItemLine = [];
        }

        $scope.hasBeenScanedUpc = [];

        function markScanUpcItem() {
            var orders = [];
            $scope.itemSpecId = null;
            $scope.readyToPrintItemLine = [];
            $scope.itemLineShowDetail = _.find($scope.task.ordersItemLines, {
                upcCodeForPrint: $scope.printShippingLabelParam.upc
            });
            _.forEach($scope.task.ordersItemLines, function (ordersItemLine) {
                if (ordersItemLine.upcCodeForPrint === $scope.printShippingLabelParam.upc) {
                    orders.push($scope.orderKeyById[ordersItemLine.orderId]);
                    ordersItemLine.isScanUpc = true;
                    $scope.itemSpecId = ordersItemLine.itemSpecId;
                    $scope.readyToPrintItemLine.push(ordersItemLine);
                } else {
                    ordersItemLine.isScanUpc = false;
                }

            })
            $scope.noNeedRepack();

            setUpPrintPackingList(orders);
        }

        $scope.noNeedRepack = function () {
            $scope.printShippingLabelParam.boxInfo = null;
            $scope.printShippingLabelParam.itemWeight = null;
            $scope.printShippingLabelParam.packageId = null;
            if (!$scope.itemSpecId) return;
            itemService.searchItemUnits({
                itemSpecId: $scope.itemSpecId
            }).then(function (unitsObj) {
                angular.forEach(unitsObj.units, function (unit) {
                    if (unit.isBaseUnit) {
                        $scope.printShippingLabelParam.boxInfo = unit.length + "*" + unit.width + "*" + unit.height + " (" + unit.linearUnit + ")";
                        $scope.printShippingLabelParam.itemWeight = unit.weight;
                    }
                });
            });

        };

        $scope.sumPrintedQty = function (itemLine) {
            var beenPrintedTrackingNosWithSameUnit =  _.filter(itemLine.beenPrintedTrackingNos,function(beenPrinted){
                return beenPrinted.itemLineDetail.unitId ===  itemLine.unitId;
             });
            return _.sum(_.map(beenPrintedTrackingNosWithSameUnit, 'qty'));
            };

        $scope.sumUnPrintedQty = function (itemLine) {
            var beenPrintedTrackingNosWithSameUnit =  _.filter(itemLine.beenPrintedTrackingNos,function(beenPrinted){
                    return beenPrinted.itemLineDetail.unitId ===  itemLine.unitId;
            });
            return itemLine.qty - (_.sum(_.map(beenPrintedTrackingNosWithSameUnit, 'qty')));
        };

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
            });
            $scope.printShippingLabelParam.taskIdOrPickTicketId = $stateParams.taskId;
            $scope.getOrderItemLineFromPickTask($stateParams.taskId);
        }

        $scope.searchAvailablePrinters = function (callback) {
            var param = {};
            printService.searchAvailablePrinters(param).then(function (printers) {
                $scope.ZplPrinters = _.filter(printers, function (printer) {
                    return printer.type === 'ZPL' || printer.type === 'RAW';
                });
                $scope.PdfPrinters = _.filter(printers, function (printer) {
                    return printer.type === 'PDF';
                });
                if (callback) {
                    callback();
                }
            });
        };

        $scope.printer = {};
        $scope.ZplPrinterSelect = function (printer) {
            $scope.printer.zplPrinter = printer;

        };
        $scope.PdfPrinterSelect = function (printer) {
            $scope.printer.pdfPrinter = printer;
        };

        function judgeIsBatchOrSinglePrintLoadingToClose() {
            if ($scope.activetab === 'multiple') {
                $scope.isMulLoading = false;
            } else {
                if ($scope.printBatchStatus) {
                    $scope.batchPrinting = false;
                    $scope.readyToPrintItemLine = [];
                } else
                    $scope.isLoading = false;
            }

        }


        $scope.selectedTab = function (tagName) {
            $scope.activetab = tagName;
            $scope.printLogs = [];

            if (tagName === 'single') {
                $scope.multiplePrintShippingLabelParam = {
                    multiplePrintItemLines: [{
                        itemQty: 0
                    }],
                    packingListTogetherWithLabel: false,
                    packingListByOrder: false,
                    shippingLabel: false,
                    pickTicket_PDF: true,
                    pickTicket_ZPL: false
                };
                _init();
            } else {
                $scope.multiplePrintShippingLabelParam.packingListTogetherWithLabel = true;
                $scope.commonSet.isPrintPackingList = false;
                $scope.printShippingLabelParam = {
                    itemQty: 1,
                    taskIdOrPickTicketId: $stateParams.taskId
                };
            }
        };

        $scope.addMultipleItemLine = function () {
            $scope.multiplePrintShippingLabelParam.multiplePrintItemLines.push({
                itemQty: 0
            });
        };

        $scope.removeMultipleItemLine = function (index) {
            $scope.multiplePrintShippingLabelParam.multiplePrintItemLines.splice(index, 1);
        };

        var mulItemLinesReadyToPrint;
        $scope.printMultipleItemLineShippingLabels = function () {

            if (!$scope.multiplePrintShippingLabelParam.shippingLabel && !$scope.multiplePrintShippingLabelParam.packingListByOrder && !$scope.multiplePrintShippingLabelParam.packingListTogetherWithLabel) {
                if (!$scope.multiplePrintShippingLabelParam.pickTicket_PDF && !$scope.multiplePrintShippingLabelParam.pickTicket_ZPL) {
                    lincUtil.errorPopup('Please  Select one')
                } else if ($scope.multiplePrintShippingLabelParam.pickTicket_PDF) {
                    $scope.printPickTicketPDF();
                } else {
                    $scope.printPickTicketZPL();
                }
                return;
            }


            $scope.header = angular.copy($scope.multiplePrintShippingLabelParam.multiplePrintItemLines);
            if ($scope.multiplePrintShippingLabelParam.multiplePrintItemLines.length > 0) {
                var multiplePrintItemLines = $scope.multiplePrintShippingLabelParam.multiplePrintItemLines;
                initPrintLogWhenPrint();
                var matchUnPrintTrackingNo = getUnPrintTrackingNo(multiplePrintItemLines);
                var itemLists = [];
                _.forEach(multiplePrintItemLines, function (mulItemLine) {
                    var itemLine = mulItemLine.selectItemLine;
                    var item = {
                        "orderId": itemLine.orderId,
                        "itemSpecId": itemLine.itemSpecId,
                        "unitId": itemLine.unitId,
                        "qty": mulItemLine.itemQty,

                    };
                    itemLists.push(item);
                });
                mulItemLinesReadyToPrint = itemLists;
                if (!judgeSelectOrderSameLabelPrintTypeAndSameShipto(itemLists)) return;
                $scope.isMulLoading = true;
                if (matchUnPrintTrackingNo) {
                    printWithDatasAccordingCustomerPrintType([matchUnPrintTrackingNo], {});

                } else {
                    var hasEnoughQtyToPrint = judgeMultipItemLineNeedToPrintQty(multiplePrintItemLines);
                    if (hasEnoughQtyToPrint) {

                        getPrintShippingmentTrackingNoAndPrint(itemLists, {});

                    } else {
                        $scope.printLogs.unshift($scope.printLog);
                        judgeIsBatchOrSinglePrintLoadingToClose();
                    }
                }

            } else {
                lincUtil.errorPopup('Please set up package ')
            }
        };

        $scope.printPickTicketPDF = function () {
            if (!$scope.printer.pdfPrinter) {
                lincUtil.errorPopup('Selected Pdf printer name');
                return;
            }
            $scope.isPrintPickTicketLoading = true;
            printService.taskTicketPrint($stateParams.taskId).then(function (response) {
                var fileId = response.fileId;
                var printerName = $scope.printer.pdfPrinter.printerName;
                printService.pdfPrint(fileId, printerName).then(function () {
                    $scope.isPrintPickTicketLoading = false;
                    lincUtil.messagePopup("Message", "Print Pick Ticket (PDF) Successful.");
                }, function (error) {
                    $scope.isPrintPickTicketLoading = false;
                    lincUtil.processErrorResponse(error);
                });

            }, function (error) {
                $scope.isPrintPickTicketLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        $scope.printPickTicketZPL = function () {
            if (!$scope.printer.zplPrinter) {
                lincUtil.errorPopup('Selected Zpl printer name');
                return;
            }
            printService.print(printService.getPickTicketLabelPrint($stateParams.taskId), $scope.printer.zplPrinter).then(function () {},
                function (error) {
                    lincUtil.processErrorResponse(error);
                });
        }



        $scope.onPrintLabelChecked = function (labelOption) {
            $scope.multiplePrintShippingLabelParam[labelOption] = !$scope.multiplePrintShippingLabelParam[labelOption];
            if (labelOption === "pickTicket_PDF" && $scope.multiplePrintShippingLabelParam[labelOption] === true) {
                $scope.multiplePrintShippingLabelParam.pickTicket_ZPL = false;
            } else if (labelOption === "pickTicket_ZPL" && $scope.multiplePrintShippingLabelParam[labelOption] === true) {
                $scope.multiplePrintShippingLabelParam.pickTicket_PDF = false;
            } else if (labelOption === "packingListTogetherWithLabel" && $scope.multiplePrintShippingLabelParam[labelOption] === true) {
                $scope.multiplePrintShippingLabelParam.packingListByOrder = false;
                $scope.multiplePrintShippingLabelParam.shippingLabel = false;
            } else if ((labelOption === "packingListByOrder" || labelOption === "shippingLabel") && $scope.multiplePrintShippingLabelParam[labelOption] === true) {
                $scope.multiplePrintShippingLabelParam.packingListTogetherWithLabel = false;
            }

        };

        function judgeMultipItemLineNeedToPrintQty(multiplePrintItemLines) {
            var hasEnoughQtyToPrint = true;
            _.forEach(multiplePrintItemLines, function (mulItemLine) {
                var itemLine = mulItemLine.selectItemLine
                var unPrintQty = _.sum(_.map(itemLine.unPrintedTrackingNos, 'qty'));
                var beenPrintQty = _.sum(_.map(itemLine.beenPrintedTrackingNos, 'qty'));
                var theRestQty = itemLine.qty - beenPrintQty - unPrintQty;
                if (mulItemLine.itemQty > theRestQty) {
                    hasEnoughQtyToPrint = false;
                    $scope.printLog.printFail = true;
                    $scope.printLog.printStatus = 'Fail';
                    $scope.printLog.printInprogress.push("Order Id :" + itemLine.orderId + " Item :" + itemLine.itemSpecName + ",  remain unprinted qty is less than qty in package setting");
                }

            });

            return hasEnoughQtyToPrint;
        }

        function getUnPrintTrackingNo(multiplePrintItemLines) {
            var matchUnPrintTrackingNo;
            var firstItemLines = _.filter(multiplePrintItemLines[0].selectItemLine.unPrintedTrackingNos, {
                qty: multiplePrintItemLines[0].itemQty
            });
            if (firstItemLines && firstItemLines.length > 0) {
                var firstMapTrackingNos = _.map(firstItemLines, 'trackingNo');
                var unMapTrackingNo = [];
                _.forEach(firstMapTrackingNos, function (trackingNo) {
                    _.forEach(multiplePrintItemLines, function (mulitemLine, index) {
                        if (index > 0) {
                            if (!_.find(mulitemLine.selectItemLine.unPrintedTrackingNos, {
                                    'trackingNo': trackingNo,
                                    qty: mulitemLine.itemQty
                                })) {
                                unMapTrackingNo.push(trackingNo);
                            }
                        }
                    });
                })
            }
            var diff = _.difference(firstMapTrackingNos, unMapTrackingNo)
            if (diff.length > 0) {
                matchUnPrintTrackingNo = diff[0];
            }
            return matchUnPrintTrackingNo

        }


        function transforPrintAndUnPrintQtyToItemQtyWithSameUnit(orderItemLines) {
            _.forEach(orderItemLines, function (orderItemLine) {
                _.forEach(orderItemLine.beenPrintedTrackingNos, function (beenPrintedTrackingNo) {

                    var itemLineDetail = beenPrintedTrackingNo.itemLineDetail;
                    var itemLineUnitId = orderItemLine.unitId;
                    var trackingNoUnit = $scope.UnitKeyByUnitId[itemLineDetail.unitId];
                    var itemLineUnit = $scope.UnitKeyByUnitId[itemLineUnitId];

                    if (itemLineUnit && trackingNoUnit) {
                        beenPrintedTrackingNo.realQty = angular.copy(beenPrintedTrackingNo.qty);
                        beenPrintedTrackingNo.qty = trackingNoUnit.baseQty * itemLineDetail.qty / itemLineUnit.baseQty;

                    }

                })
                _.forEach(orderItemLine.unPrintedTrackingNos, function (unPrintedTrackingNo) {

                    var itemLineDetail = unPrintedTrackingNo.itemLineDetail;
                    var itemLineUnitId = orderItemLine.unitId;
                    var trackingNoUnit = $scope.UnitKeyByUnitId[itemLineDetail.unitId];
                    var itemLineUnit = $scope.UnitKeyByUnitId[itemLineUnitId];

                    if (itemLineUnit && trackingNoUnit) {
                        unPrintedTrackingNo.realQty = angular.copy(unPrintedTrackingNo.qty);
                        unPrintedTrackingNo.qty = trackingNoUnit.baseQty * itemLineDetail.qty / itemLineUnit.baseQty;

                    }

                })
            });

        }

        $scope.tranforQtyToCurrentUnit = function (trackingNoItem,itemLine) {

            if(trackingNoItem.itemLineDetail.unitId === itemLine.unitId) {
                var trackingNoUnitId = trackingNoItem.itemLineDetail.unitId;
                var trackingNoUnit = $scope.UnitKeyByUnitId[trackingNoUnitId];
                return trackingNoItem.trackingNo + "(" + trackingNoItem.realQty + trackingNoUnit.name + ")";
            }
        }

        if ($stateParams.taskId.indexOf('DN-') > -1) {
            $scope.activetab = 'multiple';
        } else {
            $scope.activetab = 'single';
        }


        _init();
    };
    $scope.$inject = ['$scope', '$window', '$http', '$mdDialog', 'orderService', 'addressService', '$stateParams', 'pickService', 'lincUtil', 'session', 'itemService', 'printService', '$q', 'smallParcelShipmentService'];
    return $scope;
});