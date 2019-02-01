'use strict';
define([
    'angular',
    'src/admin/parking/parkingListController',
    'src/admin/parking/addParkingController'
], function(angular, parkingListCtrl, addParkingCtrl) {

    angular.module('linc.admin.parking', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('admin.parking.list', {
                url: '/list',
                templateUrl: 'admin/parking/template/parkingList.html',
                controller: 'ParkingListController',
            })
            .state('admin.parking.add', {
                url: '/add',
                templateUrl: "admin/parking/template/addParking.html",
                controller: 'AddParkingController',
                resolve: {
                    'isAddAction': function(){
                        return true;
                    }
                }
            })
            .state('admin.parking.edit', {
                url: '/edit/:parkingId',
                templateUrl: "admin/parking/template/addParking.html",
                controller: 'AddParkingController',
                resolve: {
                    'isAddAction': function(){
                        return false;
                    }
                }
            });
            // .state('wms.inbound.receipt.view', {
            //     url: '/:receiptId',
            //     templateUrl: 'wms/inbound/receipt/template/receiptView.html',
            //     controller: 'ReceiptViewController'
            // });
        }])
        .controller("ParkingListController", parkingListCtrl)
        .controller("AddParkingController", addParkingCtrl);

});
