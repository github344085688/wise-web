'use strict';

define([
    'angular',
    'src/print-pages/printMBOLController',
    'src/print-pages/printBOLController',
    'src/print-pages/printOrderBOLController',
    'src/print-pages/printPackingListController',
    'src/print-pages/printEntryController',
    'src/print-pages/printOrderPalletLabelController',
    'src/print-pages/printOrdersPalletLabelController',
    'src/print-pages/printReceiptPalletLabelController',
    'src/print-pages/printUCCLabelController',
    'src/print-pages/printCountingSheetController',
    'src/print-pages/printLoadPackingListController',
    'src/print-pages/printOrderPackingListController',
    'src/print-pages/printMultipleOrderPackingListController',
    'src/print-pages/printLoadByShipToBolController',
    'src/print-pages/printPageTaskShippingLabelController',
    'src/print-pages/printTransloadTallySheetController',
    'src/print-pages/printReceiptTallySheetController',
    'src/print-pages/printReceiptWithDetailController',
    'src/print-pages/printMasterBolLoadController',
    'src/print-pages/printFileController',
    'src/print-pages/printPickTicketLabelController',
    'src/print-pages/printMaterLoadingTicketController',
    'src/print-pages/printEntryTicketCheckoutController'
], function (angular, printMBOLController, printBOLController, printOrderBOLController,
             printPackingListController, printEntryController, printOrderPalletLabelController,
             printOrdersPalletLabelController,
             printReceiptPalletLabelController,
             printUCCLabelController, printCountingSheetController, printLoadPackingListController,
             printOrderPackingListController, printMultipleOrderPackingListController,
             printLoadByShipToBolController,
             printPageTaskShippingLabelController, printTransloadTallySheetController,
             printReceiptTallySheetController, printReceiptWithDetailController, printMasterBolLoadController,
             printFileController, printPickTicketLabelController, printMaterLoadingTicketController,printEntryTicketCheckoutController) {
    angular.module('linc.print', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('mbolPrint', {
                url: '/mbol-print/:loadId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintMBOLController'
            }).state('bolPrint', {
                url: '/bol-print/:loadId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintBOLController'
            }).state('orderBolPrint', {
                url: '/order-bol-print/:loadId/order/:orderId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintOrderBOLController'
            }).state('packingListPrint', {
                url: '/packing-list-print/:orderId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintPackingListController'
            }).state('entryPrint', {
                url: '/entry-print/:entryId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintEntryController'
            }).state('entryTicketCheckoutLabelPrint', {
                url: '/entry-ticket-checkout-print/:entryId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintEntryTicketCheckoutController'
            }).state('orderPalletLabelPrint', {
                url: '/pallet-label-print/:orderId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintOrderPalletLabelController'
            }).state('ordersPalletLabelPrint', {
                url: '/orders-pallet-label-print/:orderIds',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintOrdersPalletLabelController'
            }).state('receiptPalletLabelPrint', {
                url: '/pallet-label-print/:receiptId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintReceiptPalletLabelController'
            }).state('uccLabelPrint', {
                url: '/ucc-label-print/order/:orderId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintUCCLabelController'
            }).state('countingSheetPrint', {
                url: '/counting-sheet-print/entry/:entryId/load/:loadId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintCountingSheetController'
            }).state('loadPackingListPrint', {
                url: '/load-packing-list-print/:loadId/order/:orderId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintLoadPackingListController'
            }).state('orderPackingListPrint', {
                url: '/order-packing-list-print/order/:orderId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintOrderPackingListController'
            }).state('mutipleOrderPackingListPrint', {
                url: '/order-packing-list-print/mutiple-order/:orderIds',
                templateUrl: 'print-pages/template/printMultipleItemsPage.html',
                controller: 'PrintMultipleOrderPackingListController'
            }).state('loadByShipToBolPrint', {
                url: '/load-by-shipto-bol-print/:loadId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintLoadByShipToBolController'
            }).state('PageTaskShippingLabelPrint', {
                url: '/page-task-shipping-label-print/:orderIds',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintPageTaskShippingLabelController'
            }).state('transloadTallySheetPrint', {
                url: '/transload-tally-sheet-print/:taskId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintTransloadTallySheetController'
            }).state('receiptTallySheetPrint', {
                url: '/receipt-tally-sheet-print/:receiptId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintReceiptTallySheetController'
            }).state('receiptWithDetailPrint', {
                url: '/receipt-with-detail-print/:receiptId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintReceiptWithDetailController'
            }).state('loadMasterBolPrint', {
                url: '/lmbol-print/:loadIds',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintMasterBolLoadController'
            }).state('printFile', {
                url: '/printFile/:fileId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintFileController'
            }).state('pickTicketLabelPrint', {
                url: '/pick-ticket-label-print/:taskId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintPickTicketLabelController'
            }).state('materLoadingTicketPrint', {
                url: '/mater-loading-ticket-print/:loadId',
                templateUrl: 'print-pages/template/printPage.html',
                controller: 'PrintMaterLoadingTicketController'
            });
        }])
        .controller('PrintMBOLController', printMBOLController)
        .controller('PrintBOLController', printBOLController)
        .controller('PrintOrderBOLController', printOrderBOLController)
        .controller('PrintPackingListController', printPackingListController)
        .controller('PrintEntryController', printEntryController)
        .controller('PrintEntryTicketCheckoutController', printEntryTicketCheckoutController)
        .controller('PrintOrderPalletLabelController', printOrderPalletLabelController)
        .controller('PrintOrdersPalletLabelController', printOrdersPalletLabelController)
        .controller('PrintReceiptPalletLabelController', printReceiptPalletLabelController)
        .controller('PrintUCCLabelController', printUCCLabelController)
        .controller('PrintCountingSheetController', printCountingSheetController)
        .controller('PrintLoadPackingListController', printLoadPackingListController)
        .controller('PrintOrderPackingListController', printOrderPackingListController)
        .controller('PrintMultipleOrderPackingListController', printMultipleOrderPackingListController)
        .controller('PrintLoadByShipToBolController', printLoadByShipToBolController)
        .controller('PrintPageTaskShippingLabelController', printPageTaskShippingLabelController)
        .controller('PrintTransloadTallySheetController', printTransloadTallySheetController)
        .controller('PrintReceiptTallySheetController', printReceiptTallySheetController)
        .controller('PrintReceiptWithDetailController', printReceiptWithDetailController)
        .controller('PrintMasterBolLoadController', printMasterBolLoadController)
        .controller('PrintFileController', printFileController)
        .controller('PrintPickTicketLabelController', printPickTicketLabelController)
        .controller('PrintMaterLoadingTicketController', printMaterLoadingTicketController);
});
