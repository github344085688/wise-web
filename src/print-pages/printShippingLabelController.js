'use strict';

define(["lodash",
    './selectPrinterContoller'
], function (_, selectPrinterController) {
    var $scope = function ($scope, $http, $mdDialog, orderService, addressService, $stateParams, pickService, lincUtil, session, itemService, printService) {

        $scope.pageSize = 10;
        $scope.printShippingLabel = {
            batchLabelPrint: true,
            orderQty: 1,
            batchLabelQty: 1
        };
        $scope.hasPrintedOrder = [];

        function getUserInfo() {
            session.getUserInfo().then(function (userInfo) {
                $scope.user = {
                    username: userInfo.username
                };

            });
        }

        $scope.orderIsHighLight = function (orderId) {
            if (_.indexOf($scope.hasPrintedOrder, orderId) > -1) {
                return true;
            } else {
                return false;
            }
        }

        $scope.getOrderItemLineFromPickTask = function (taskIdOrPickTicketId, callback) {

            var param = {
                taskIdOrPickTicketId: taskIdOrPickTicketId
            };
            pickService.searchOrderItemLineFromPickTask(param).then(function (orderFrompickTask) {
                $scope.task = orderFrompickTask;
                $scope.orderKeyById = _.keyBy(orderFrompickTask.orders, 'id');
                if (callback) {
                    callback();
                }
                $scope.task.orderIds = _.sortBy($scope.task.orderIds, function (order) {
                    return Number(order.split('-')[1]);
                })
            }, function (error) {

                lincUtil.processErrorResponse(error);
            });
        }

        $scope.batchlabelPrintChange = function (val) {
            if (!val) {
                $scope.printShippingLabel.orderQty = 1;
                $scope.printShippingLabel.batchLabelQty = 1;
            }
        };

        $scope.itemSpecIdOnSelect = function (item) {
            itemService.searchItemUnits({
                itemSpecId: item.id
            }).then(function (unitsObj) {
                angular.forEach(unitsObj.units, function (unit) {
                    if (unit.isBaseUnit) {
                        $scope.printShippingLabel.boxInfo = unit.length + "*" + unit.width + "*" + unit.height + " (" + unit.linearUnit + ")";
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
                    if (!$scope.printShippingLabel.taskIdOrPickTicketId) return;
                    $scope.getOrderItemLineFromPickTask($scope.printShippingLabel.taskIdOrPickTicketId);
                    initDataWhenScanPicketTicket();

                    angular.element('#upcCode').focus();
                }
                if (type === 'ScanUPC') {
                    recordScanUpc();
                    angular.element('#package').focus();

                }
            }
            $event.preventDefault();
        };

        function initDataWhenScanPicketTicket() {
            $scope.order = {
                itemLines: []
            };
            $scope.loadContent(1);
            $scope.task.orderIds = [];
        }

        $scope.hasBeenScanedUpc = [];

        function recordScanUpc() {
            $scope.hasBeenScanedUpc.push($scope.printShippingLabel.upc)
            $scope.hasBeenScanedUpc = _.uniq($scope.hasBeenScanedUpc);
        }

       
        $scope.selectedOrderId;
        $scope.selectedOrder = function (event, order, index) {
            var trElements = angular.element(event.target).parent().find('div');
            trElements.removeClass("select-border-color");
            trElements.eq(index).addClass("select-border-color");
            $scope.selectTrackingNo = order.trackingNo;
            $scope.selectedOrderId=order.id;
            getOrder(order.id);

        };

        $scope.selectTrackingNo;
        $scope.selectedTrackingNo=function (event, order, index) {
            var trElements = angular.element(event.target).parent().parent().find('tr');
            trElements.removeClass("select-border-color");
            trElements.eq(index).addClass("select-border-color");
            $scope.selectTrackingNo = order.trackingNo;
           
        };

        $scope.loadContent = function (currentPage) {
            $scope.order.itemLinesView = $scope.order.itemLines.slice((currentPage - 1) * $scope.pageSize, currentPage * $scope.pageSize > $scope.order.itemLines.length ? $scope.order.itemLines.length : currentPage * $scope.pageSize);
        };


        $scope.selectShippingLabel = function () {
            if (!$scope.selectPrinter || !$scope.selectPrinter.zplPrinters || !$scope.selectPrinter.pdfPrinters) {
                $mdDialog.show({
                    templateUrl: 'print-pages/template/selectPrinter.html',
                    controller: selectPrinterController,
                    controllerAs: 'ctrl',
                    locals: {

                    },
                    bindToController: true
                }).then(function (selectPrinter) {
                    $scope.selectPrinter = selectPrinter;
                    getPrintShippingmentBuffer();
                });
            } else {
                getPrintShippingmentBuffer();
            }
        };

        $scope.getAddressInfo = function (addressObject) {
            return addressService.generageAddressData(addressObject, null);
        };

        $scope.voidLabel = function () {
            if ($scope.selectTrackingNo) {
                $scope.isVoidLabelLoading = true;
                pickService.voidTrackingNo($scope.selectTrackingNo).then(function (response) {
                    lincUtil.updateSuccessfulPopup();
                    searchSmallParcelShipment();
                    getOrder($scope.selectedOrderId);
                    $scope.isVoidLabelLoading = false;
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                    $scope.isVoidLabelLoading = false;
                });

            } else {
                lincUtil.errorPopup("Please select item which tracking no is not empty");
            }
        }

        function getPrintShippingmentBuffer() {
            var printOrderIds = selectPrintOrder();
            if (printOrderIds.length == 0) return;
            $scope.isLoading = true;
            var param = {};
            param.orderIds = printOrderIds;
            param.packageId = $scope.printShippingLabel.packageId;
            param.packageWeight = $scope.printShippingLabel.itemWeight;
            param.packageType = "CP";
            param.printer = $scope.selectPrinter.zplPrinters.printerName;
            printService.smallParcelShipment(param).then(function (response) {

                PrintZplWithDatas(response, printOrderIds);

            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isLoading = false;
            });
        }

        function printPdfForOrderShipToCanada(sucessOrderIds) {
            if (sucessOrderIds.length > 0) {
                _.forEach(sucessOrderIds, function (orderId) {
                    var orderMap = $scope.orderKeyById[orderId];
                    if (orderMap && orderMap.shipToAddress && (_.toLower(orderMap.shipToAddress.country) === "canada" || _.toLower(orderMap.shipToAddress.country) === "ca")) {
                        printService.generateOrderPackingListPdf(orderId).then(function (data) {
                            var fileId = data.fileId ? data.fileId : data.fieldId;
                            if (fileId) {
                                var printer = $scope.selectPrinter.pdfPrinters.printerName;;
                                var printQty = 4;
                                printService.pdfPrint(fileId, printer, printQty).then(function () {

                                }, function (error) {
                                    lincUtil.processErrorResponse(error);
                                })
                            }
                        }, function (error) {
                            $scope.isLoading = false;
                            lincUtil.processErrorResponse(error);
                        });
                    }
                })
            }
        }

        function PrintZplWithDatas(response, sucessOrderIds) {
            var shipmentLabels = response.shipmentLabels;
            var lookupId = shipmentLabels[0].lookupId;
            var orderPrintBuffers = _.map(shipmentLabels, 'shipmentLabel').toString();
            var sucessOrderIds = _.map(shipmentLabels, 'orderId');
            printPdfForOrderShipToCanada(sucessOrderIds);

            printService.PrintZplWithDatas(orderPrintBuffers, $scope.selectPrinter).then(function (response) {
                $scope.isLoading = false;
                lincUtil.messagePopup("Success", "Data has been sent to printer successfully");
                batchUpdateSmallParcelShipment(lookupId, sucessOrderIds);
                getOrder($scope.selectedOrderId);
            }, function (error) {
                $scope.isLoading = false;
                lincUtil.processErrorResponse(error);
            });
        }

        function batchUpdateSmallParcelShipment(lookupId, printOrderIds) {
            var batchUpdateParams = {
                lookupId: lookupId,
                orderIds: printOrderIds,
                isShippingLabelPrinted: true
            }
            printService.batchUpdateSmallParcelShipment(batchUpdateParams).then(function (response) {
                searchSmallParcelShipment();
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function searchSmallParcelShipment() {
            printService.searchSmallParcelShipment({
                "isShippingLabelPrinted": true,
                "isTrackingNoDeleted": false,
                orderIds: $scope.task.orderIds
            }).then(function (response) {
                $scope.hasPrintedOrder = _.uniq(_.map(response, "orderId"));
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }

        function selectPrintOrder() {
            var scanOrderIds = [];
            var orderGroupById = _.groupBy($scope.task.ordersItemLines, "orderId");
            var selectOrderIds = _.difference($scope.task.orderIds, $scope.hasPrintedOrder);
            if (selectOrderIds.length > 0) {
                var printOrderIds = _.slice(selectOrderIds, 0, $scope.printShippingLabel.batchLabelQty ? $scope.printShippingLabel.batchLabelQty : 1);
                scanOrderIds = selectSkuIsScaned(printOrderIds);
            }
            return scanOrderIds;
        }

        function selectSkuIsScaned(printOrderIds) {
            var scanOrderIds = [],
                notScanOrderIds = [];
            var orderGroupById = _.groupBy($scope.task.ordersItemLines, "orderId");
            _.forEach(printOrderIds, function (printOrderId) {
                var upcCodes = _.map(orderGroupById[printOrderId], "upcCode");
                var differenceVal = _.difference(upcCodes, $scope.hasBeenScanedUpc);
                if (differenceVal.length == 0 && $scope.hasBeenScanedUpc.length > 0) {
                    scanOrderIds.push(printOrderId);
                } else {
                    notScanOrderIds.push(printOrderId);
                }
            });
            if (notScanOrderIds.length > 0) {
                promptMessage(notScanOrderIds);
            }
            return scanOrderIds;

        }

        function promptMessage(notScanOrderIds) {
            lincUtil.popUpWithHtml("Some items of the orders:" + notScanOrderIds.toString() + " are not be scanned yet, please scan first", function () {});
        }

        function getOrder(orderId) {
            if ($scope.order) {
                $scope.order.shipToAddress = "";
                $scope.order.shipFrom = "";
            }

            $scope.isLoadingTable = true;
            orderService.getOrder(orderId).then(function (order) {
                $scope.order = order;
                $scope.isLoadingTable = false;
                $scope.loadContent(1);
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isLoadingTable = false;
            });
        }

        function _init() {
            $scope.printShippingLabel.taskIdOrPickTicketId = $stateParams.taskId;
            getUserInfo();

            $scope.getOrderItemLineFromPickTask($stateParams.taskId, function () {
                searchSmallParcelShipment();
            });


        }

        _init();
    };
    $scope.$inject = ['$scope', '$http', '$mdDialog', 'orderService', 'addressService', '$stateParams', 'pickService', 'lincUtil', 'session', 'itemService', 'printService'];
    return $scope;
});