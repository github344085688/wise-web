'use strict';

define([
    'angular',
    'src/wms/outbound/load/loadListController',
    'src/wms/outbound/load/loadOverviewController',
    'src/wms/outbound/load/buildLoadController',
    'src/wms/outbound/load/uploadLoadController',
    'src/wms/outbound/load/orderSelectPageController',
    'src/wms/outbound/load/loadOrderSelectService'
], function (angular, loadListController, loadOverviewController, buildLoadController, uploadLoadController, orderSelectPageController, loadOrderSelectService) {
    angular.module('linc.wms.outbound.load',  ['wms.outbound.loadOrderSelectService'])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider
                .state('wms.outbound.load.list', {
                    url: '/list',
                    templateUrl: 'wms/outbound/load/template/loadList.html',
                    controller: 'LoadListController',
                    data: {
                        title: "Load List",
                        data: {
                            permissions: "outbound::load_read"
                        }
                    }
                })
                .state('wms.outbound.load.view', {
                    url: '/:loadId',
                    templateUrl: 'wms/outbound/load/template/loadOverview.html',
                    controller: 'LoadOverviewController',
                    data: {
                        title: "WISE-Load",
                        data: {
                            permissions: "outbound::load_read"
                        }
                    }
                })
                .state('wms.outbound.load.add', {
                    url: '/add',
                    templateUrl: 'wms/outbound/load/template/buildLoad.html',
                    controller: 'BuildLoadController',
                    data: {
                        title: "Add Load",
                        data: {
                            permissions: "outbound::load_write"
                        }
                    }
                })
                .state('wms.outbound.load.edit', {
                    url: '/edit/:loadId',
                    templateUrl: 'wms/outbound/load/template/buildLoad.html',
                    controller: 'BuildLoadController',
                    data: {
                        title: "WISE-Load",
                        data: {
                            permissions: "outbound::load_write"
                        }
                    }
                })
                .state('wms.outbound.load.uploadLoad', {
                    url: '/upload-load',
                    templateUrl: 'wms/outbound/load/template/uploadLoad.html',
                    controller: 'UploadLoadController',
                    data: {
                        title: "Upload Load",
                        data: {
                            permissions: "outbound::load_write"
                        }
                    }
                })
                .state('wms.outbound.load.add.orderSelect', {
                    url: '/order-select',
                    templateUrl: 'wms/outbound/load/template/orderSelect.html',
                    controller: 'OrderSelectPageController',
                    params: { customerId: null },
                    data: {
                        permissions: "outbound::load_write"
                    }
                })
                .state('wms.outbound.load.edit.orderSelect', {
                    url: '/order-select',
                    templateUrl: 'wms/outbound/load/template/orderSelect.html',
                    controller: 'OrderSelectPageController',
                    params: { customerId: null },
                    data: {
                        permissions: "outbound::load_write"
                    }
                })
                
        }])
                .controller('LoadListController', loadListController)
                .controller('LoadOverviewController', loadOverviewController)
                .controller('BuildLoadController', buildLoadController)
                .controller('UploadLoadController', uploadLoadController)
                .controller('OrderSelectPageController', orderSelectPageController);
});
