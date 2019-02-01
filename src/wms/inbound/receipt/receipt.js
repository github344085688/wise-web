'use strict';

define([
    'angular',
    'src/wms/inbound/receipt/receiptListController',
    'src/wms/inbound/receipt/addReceiptController',
    'src/wms/inbound/receipt/receiptViewController'
], function (angular, receiptListCtrl, addReceiptCtrl, receiptViewCtrl) {
    angular.module('linc.wms.inbound.receipt', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider
                .state('wms.inbound.receipt.add', {
                    url: '/add',
                    templateUrl: 'wms/inbound/receipt/template/addReceipt.html',
                    controller: 'AddReceiptController',
                    resolve: {
                        'isAddAction' : function(){
                            return true;
                        }
                    },
                    data: {
                        title: "Add Receipt",
                        permissions: "inbound::receipt_write"
                    }
                })
                .state('wms.inbound.receipt.view', {
                    url: '/:receiptId',
                    templateUrl: 'wms/inbound/receipt/template/receiptView.html',
                    controller: 'ReceiptViewController',
                    data: {
                        title: "WISE-Receipt",
                        permissions: "inbound::receipt_read"
                    }
                }) .state('wms.inbound.receipt.list', {
                    url: '/list',
                    templateUrl: 'wms/inbound/receipt/template/receiptList.html',
                    controller: 'ReceiptListController',
                    data: {
                        title: "Receipt",
                        permissions: "inbound::receipt_read"
                    }
                })
                .state('wms.inbound.receipt.edit', {
                    url: '/edit/:receiptId',
                    templateUrl: 'wms/inbound/receipt/template/addReceipt.html',
                    controller: 'AddReceiptController',
                    resolve: {
                        'isAddAction' : function(){
                            return false;
                        }
                    },
                    data: {
                        title: "WISE-Receipt",
                        permissions: "inbound::receipt_write"
                    }
                })

        }])
        .controller('ReceiptListController', receiptListCtrl)
        .controller('AddReceiptController',  addReceiptCtrl)
        .controller('ReceiptViewController',  receiptViewCtrl);
});

