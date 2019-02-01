'use strict';
define([
    './factories'
], function (factories, _) {

    factories.factory('printService', function ($resource, $q, addressService, session, entryService, lincUtil) {
        var service = {};

        service.buildUrlFromPrintServer = function (printServer, url) {
            var protocol = printServer.protocol ? printServer.protocol : 'http';
            var urlPrefix = printServer.urlPrefix ? printServer.urlPrefix : '';
            return protocol + '://' + printServer.serverIP + ':' + printServer.port + urlPrefix + "/wh-print-app/" + url;
        };

        service.buildUrl = function (printServer, printType) {
             var url = 'zpl/print';
             if (printType.toLowerCase() == "pdf") {
                 url = 'pdf/print';
             }
             return service.buildUrlFromPrintServer(printServer, url);
        };

        service.printPdf = function (fileId, printerName, callback) {
            service.getFacilityPrintServer().then(function (printServers) {
                if (printServers.length >= 1) {
                    return $resource(service.buildUrlFromPrintServer(printServers[0], "pdf/print"), null, {
                        "printPost": {
                            method: 'POST',
                            isArray: false,
                            transformResponse: function (data) {
                                if (data === "success") {
                                    return {data: "success"};
                                }
                                return {error: "Error Found"};
                            }
                        }
                    }).printPost({
                        fileId: fileId,
                        printerName: printerName
                    }, callback);
                }
            });
        };

        service.pdfPrint = function (fileId, printerName, printQty) {
            var defer = $q.defer();
            service.getFacilityPrintServer().then(function (printServers) {
                if (printServers.length >= 1) {
                    $resource(service.buildUrlFromPrintServer(printServers[0], "pdf/print"), null, {
                        "printPost": {
                            method: 'POST',
                            isArray: false,
                            transformResponse: function (data) {
                                if (data === "success") {
                                    return {data: "success"};
                                } else {
                                    return {error: data}
                                }
                            }
                        }
                    }).printPost({
                        fileId: fileId,
                        printQTY: printQty ? printQty : 1,
                        printerName: printerName
                    }).$promise.then(function (res) {
                        if (!(res.data === 'success')) {
                            defer.reject(res);
                        } else {
                            defer.resolve(res);
                        }
                    }, function (err) {
                        defer.reject(err);
                    });
                } else {
                    defer.reject("No available print server found");
                }
            }, function (err) {
                defer.reject(err);
            });
            return defer.promise;

        };

        service.generateMasterBolPdf = function (loadId) {
            return $resource('/wms-app/outbound/bol/:loadId/master-bol-pdf-full-load').get({
                loadId: loadId
            }).$promise;
        };

        service.getMasterBolWarning = function (loadId) {
            return $resource('/wms-app/outbound/masterbol/:loadId/master-bol-warning',{loadId: loadId}, {'query': {method: 'GET', isArray: true}}).query().$promise;
        };

        service.generateBolPdf = function (loadId) {
            return $resource('/wms-app/outbound/bol/:loadId/bol-pdf-full-load').get({
                loadId: loadId
            }).$promise;
        };


        service.generateBolPdfByShippingAddress = function (loadId) {
            return $resource('/wms-app/outbound/bol/:loadId/master-bol-pdf-full-load-by-shipping-address').get({
                loadId: loadId
            }).$promise;
        };

        service.getBolWarning = function (loadId) {
            return $resource('/wms-app/outbound/bol/:loadId/bol-warning').query({
                loadId: loadId
            }).$promise;
        };

        service.generateOrderBolPdf = function (loadId, orderId) {
            return $resource('/wms-app/outbound/bol/:loadId/:orderId/bol-pdf').get({
                loadId: loadId,
                orderId: orderId
            }).$promise;
        };

        service.getOrderBolWarning = function (loadId, orderId) {
            return $resource('/wms-app/outbound/bol/:loadId/:orderId/bol-warning').query({
                loadId: loadId,
                orderId: orderId
            }).$promise;
        };

        service.generatePackingListPdf = function (orderId) {
            return $resource('/wms-app/outbound/order/:orderId/packing-list/print').get({
                orderId: orderId
            }).$promise;
        };

        service.generateLoadPackingListPdf = function (loadId, orderId) {
            return $resource('/wms-app/outbound/load/:loadId/order/:orderId/packing-list/print').get({
                loadId: loadId,
                orderId: orderId
            }).$promise;
        };

        service.generateOrderPackingListPdf = function (orderId) {
            return $resource('/wms-app/outbound/order/:orderId/packing-list/print').get({
                orderId: orderId
            }).$promise;
        };

        service.generatePackagingTicketWithZPL = function (trackingNo) {
            return $resource('/wms-app/packaging-ticket-label/tracking-no/:trackingNo').get({
                trackingNo: trackingNo
            }).$promise;
        };

        service.getPrintServerByWarehouseId = function (warehouseId) {
            return $resource('/print-app/print-server/search', null, {
                'search': {
                    method: 'POST',
                    isArray: true
                }
            }).search({
                warehouseId: warehouseId,
                status: 'Active'
            }).$promise;
        };

        service.searchAvailablePrinters = function (param) {
            return $resource('/print-app/printer/search', null, {
                'search': {
                    method: 'POST',
                    isArray: true
                }
            }).search(param).$promise;

        };

        service.getPrinterById = function (id) {
            return $resource('/print-app/printer/' + id).get().$promise;
        };

        service.PrintZplWithDatas = function (data, printer) {
            var defer = $q.defer();
            service.getFacilityPrintServer().then(function (printServers) {
                if (printServers.length >= 1) {
                    $resource(service.buildUrlFromPrintServer(printServers[0], "zpl/print-with-data"), null, {
                        "printPost": {
                            method: 'POST',
                            isArray: false
                        }
                    }).printPost({
                        data: data,
                        host: printer.ip,
                        port: printer.port,
                        printType: printer.type,
                        printerName: printer.printerName
                    }).$promise.then(function (res) {
                        defer.resolve(res)
                    }, function (err) {
                        defer.reject(err);
                    });
                } else {
                    defer.reject("No available print server found");
                }
            }, function (err) {
                defer.reject(err);
            });
            return defer.promise;
        }

        service.createSmallParcelShipment = function (params) {
            return $resource('/bam/wms-app/outbound/small-parcel-shipment', null, {'search': {method: 'POST'}}).search(params).$promise;
        };

        service.searchSmallParcelShipment = function (params) {
            return $resource('/wms-app/small-parcel-shipment/search', null, {
                'search': {
                    method: 'POST',
                    isArray: true
                }
            }).search(params).$promise;
        };

        service.searchSmallParcelShipmentThroughBam = function (params) {
            return $resource('/bam/wms-app/small-parcel-shipment/search-by-paging', null, {
                'search': {
                    method: 'POST'
                }
            }).search(params).$promise;
        };

        service.updateSmallParcelShipment = function (trackingNo) {
            return $resource('/wms-app/small-parcel-shipment/mark-as-printed/:trackingNo', {trackingNo: trackingNo}, {'update': {method: 'PUT'}}).update().$promise;
        };

        service.searchSmallParcelShipmentDetail = function (params) {
            return $resource('/bam/wms-app/small-parcel-shipment/shipment-detail/search', null, {
                'search': {
                    method: 'POST',
                    isArray: true
                }
            }).search(params).$promise;
        };


        service.taskTicketPrint = function (taskId) {
            return $resource("/wms-app/outbound/pick-task/:taskId/task-ticket/print").get({taskId: taskId}).$promise;
        };

        service.zplPrint = function (jobId, printer) {
            var defer = $q.defer();
            service.getFacilityPrintServer().then(function (printServers) {
                if (printServers.length >= 1) {
                    $resource(service.buildUrlFromPrintServer(printServers[0], "zpl/print"), null, {
                        "printPost": {
                            method: 'POST',
                            isArray: false
                        }
                    }).printPost({
                        jobId: jobId,
                        host: printer.ip,
                        port: printer.port,
                        printType: printer.type,
                        printerName: printer.printerName
                    }).$promise.then(function (res) {
                        defer.resolve(res)
                    }, function (err) {
                        defer.reject(err);
                    });
                } else {
                    defer.reject("No available print server found");
                }
            }, function (err) {
                defer.reject(err);
            });
            return defer.promise;

        };



        service.syncPrintRequests = function(requests) {
            
                return $resource('/bam/toolset/post-requests-synchronous', null, {
                    'search': {
                        method: 'POST',
                        isArray: true
                    }
                }).search(requests).$promise;
        }

        service.getFacilityPrintServer = function () {
            var organizationName = session.getCompanyFacility().facility.name;
            if (!organizationName) {
                return $q.when([]);
            }
            return service.getPrintServerByWarehouseId(organizationName);
        };

        service.previewZPL = function (callback) {
            var organizationName = session.getCompanyFacility().facility.name;
            if (!organizationName) {
                return;
            }
            service.getPrintServerByWarehouseId(organizationName).then(callback);
        };

        service.getPalletLabelPrint = function (orderId) {
            return $resource("/bam/wms-app/pallet-label/:orderId").get({orderId: orderId}).$promise;
        };

        service.orderPalletLabelPrint = function (orderId) {
            return $resource("/wms-app/outbound/:orderId/pallet-label/preview").get({orderId: orderId}).$promise;
        };

        service.ordersPalletLabelPrint = function (orderIds) {
            return $resource("/wms-app/pallet-label/orders", null, {'post': {method: 'POST'}}).post(orderIds).$promise;
        };

        service.getLabelPrint = function (searchParam) {
            return $resource('/wms-app/label/', null, {'search': {method: 'POST'}}).search(searchParam).$promise;
        };


        service.getUCCLabelPrint = function (orderId) {
            return $resource("/wms-app/ucc-label/:orderId").get({
                orderId: orderId
            }).$promise;
        };

        service.postUCCLabelPrint = function (orderId,param) {
            return $resource('/wms-app/ucc-label/:orderId', {orderId:orderId}, {'search': {method: 'POST'}}).search(param).$promise;
        };

        service.generateCountingSheetPdf = function (entryId, loadId) {
            return $resource('/wms-app/outbound/entry/:entryId/load/:loadId/counting-sheet/print').get({
                entryId: entryId,
                loadId: loadId
            }).$promise;
        };

        service.printEntryLabelDirectly = function (printer, entryId) {
            var defer = $q.defer();
            entryService.getPrintEntry(entryId).then(function (response) {
                if (response.id) {
                    var jobId = response.id;
                    service.zplPrint(jobId, printer).then(function (response) {
                        defer.resolve(response);
                    }, function (err) {
                        defer.reject("Failed to print entry (" + entryId + ")");
                    });
                }
            }, function (err) {
                defer.reject(err);
            });
            return defer.promise;
        };

        service.printEntryTicketCheckoutLabelDirectly = function (printer, entryId) {
            var defer = $q.defer();
            entryService.getPrintEntryTicketCheckout(entryId).then(function (response) {
                if (response.id) {
                    var jobId = response.id;
                    service.zplPrint(jobId, printer).then(function (response) {
                        defer.resolve(response);
                    }, function (err) {
                        defer.reject("Failed to print entry (" + entryId + ")");
                    });
                }
            }, function (err) {
                defer.reject(err);
            });
            return defer.promise;
        };

        service.printShippingLabelDirectly = function (printer, orderId) {
            var defer = $q.defer();
            service.getPalletLabelPrint(orderId).then(function (response) {
                if (response.id) {
                    var jobId = response.id;
                    service.zplPrint(jobId, printer).then(function (response) {
                        defer.resolve(response);
                    }, function (err) {
                        defer.reject("Failed to print order (" + orderId + ")");
                    });
                }
            }, function (err) {
                defer.reject(err);
            });
            return defer.promise;
        };

        service.printOrderBOLDirectly = function (printer, loadId, orderId) {
            var defer = $q.defer();
            service.generateOrderBolPdf(loadId, orderId).then(function (data) {
                var fileId = data.fileId ? data.fileId : data.fieldId;
                if (fileId) {
                    service.pdfPrint(fileId, printer.printerName).then(function (response) {
                        defer.resolve(response);
                    }, function (err) {
                        defer.reject("Failed to print order (" + orderId + ")");
                    });
                }
            }, function (err) {
                defer.reject("Failed to print order (" + orderId + ")");
            });
            return defer.promise;
        };

        service.printLoadMasterBOLDirectly = function (printer, loadId) {
            var defer = $q.defer();
            service.generateMasterBolPdf(loadId).then(function (data) {
                var fileId = data.fileId ? data.fileId : data.fieldId;
                if (fileId) {
                    service.pdfPrint(fileId, printer.printerName).then(function (response) {
                        defer.resolve(response);
                    }, function () {
                        defer.reject("Failed to print order (" + loadId + ")");
                    });
                }
            }, function (err) {
                defer.reject("Failed to print order (" + loadId + ")");
            });
            return defer.promise;
        };

        service.printPackagingListDirectly = function (printer, orderId) {
            var defer = $q.defer();
            service.generatePackingListPdf(orderId).then(function (data) {
                var fileId = data.fileId ? data.fileId : data.fieldId;
                if (fileId) {
                    service.pdfPrint(fileId, printer.printerName).then(function (response) {
                        defer.resolve(response);
                    }, function () {
                        defer.reject("Failed to print order (" + orderId + ")");
                    });
                }
            }, function (err) {
                defer.reject("Failed to print order (" + orderId + ")");
            });
            return defer.promise;
        };

        service.printCountingSheetDirectly = function (printer, entryId, loadId) {
            var defer = $q.defer();
            service.generateCountingSheetPdf(entryId, loadId).then(function (data) {
                var fileId = data.fileId ? data.fileId : data.fieldId;
                if (fileId) {
                    service.pdfPrint(fileId, printer.printerName).then(function (response) {
                        defer.resolve(response);
                    }, function () {
                        defer.reject("Failed to print order (" + loadId + ")");
                    });
                }
            }, function (err) {
                defer.reject("Failed to print order (" + loadId + ")");
            });
            return defer.promise;
        };

        service.generatePalletLabelPdf = function (receiptId) {
            return $resource('/wms-app/outbound/:receiptId/pallet-label/pdf').get({
                receiptId: receiptId
            }).$promise;
        };

        service.generateTransloadTaskTallysheetPdf = function (taskId) {
            return $resource('/wms-app/outbound/transload/:taskId/print-by-task').get({
                taskId: taskId
            }).$promise;
        };

        service.generateReceiptTallysheetPdf = function (receiptId) {
            return $resource('/wms-app/outbound/tally-sheet/:receiptId/print-by-receiptId').get({
                receiptId: receiptId
            }).$promise;
        };

        
        service.generateReceiptWithDetailPdf = function (receiptId) {
            return $resource('/wms-app/outbound/tally-sheet/:receiptId/print-detail-by-receiptId').get({
                receiptId: receiptId
            }).$promise;
        };

        service.getPickTicketLabelPrint = function (pickTaskId) {
            return $resource("/wms-app/pick-ticket-label/task/:pickTaskId").get({
                pickTaskId: pickTaskId
            }).$promise;
        };

        service.getMasterLoadingTicketPrint = function (loadId) {
            return $resource("/wms-app/master-loading-ticket/:loadId").get({
                loadId: loadId
            }).$promise;
        };

        service.print = function(getFileOrJobIdPromise, printer) {
            var defer = $q.defer();
            getFileOrJobIdPromise.then(function (data) {
                 if ( printer.type == "PDF") {
                     service.pdfPrint(data.fileId, printer.printerName).then(function(data){
                         defer.resolve(data);
                     }, function(err) {
                         defer.reject(err);
                     });
                 } else if ( printer.type == "ZPL" || printer.type == "RAW") {
                     service.zplPrint(data.id, printer).then(function(data) {
                         defer.resolve(data);
                     }, function(err) {
                         defer.reject(err);
                     });
                 } else {
                     defer.reject(new Error("Unsupported print type"));
                 }
            }, function (err) {
                defer.reject(err);
            });
            return defer.promise;
        };



        return service;

    });
});
