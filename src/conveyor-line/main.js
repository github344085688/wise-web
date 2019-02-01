'use strict';

define([
    'angular',
    'src/conveyor-line/exceptional-handling/exceptionalHandlingController',
    'src/conveyor-line/packing-station/packingStationController',
    'src/conveyor-line/packing-station/packingStationBranchListController',
    'src/conveyor-line/exceptional-handling/exceptionalHandlingLineListController',
    'src/conveyor-line/conveyor-dashboard/conveyorDashboardLineListController',
    'src/conveyor-line/conveyor-dashboard/conveyorDashboardController',
    'src/conveyor-line/small-parcel-station/smallParcelStationController'
], function (angular, exceptionalHandlingController, packingStationController, packingStationBranchListController,exceptionalHandlingLineListController,
    conveyorDashboardLineListController, conveyorDashboardController, smallParcelStationController) {
    angular.module('linc.cl.main', [])
        .config(['$stateProvider', function ($stateProvider) {
            $stateProvider.state('cl.packingStation.list', {
                url: '/list',
                templateUrl: 'conveyor-line/packing-station/template/packingStationBranchList.html',
                controller: packingStationBranchListController,
                data: {
                    title: "Packing Station Branch List"
                }
            }).state('cl.exceptionalHandling.list', {
                url: '/list',
                templateUrl: 'conveyor-line/exceptional-handling/template/exceptionalHandlingLineList.html',
                controller: exceptionalHandlingLineListController,
                data: {
                    title: "Exceptional Handling"
                }
            }).state('cl.exceptionalHandling.line', {
                url: '/line/:lineId',
                templateUrl: 'conveyor-line/exceptional-handling/template/exceptionalHandling.html',
                controller: exceptionalHandlingController,
                data: {
                    title: "Exceptional Handling"
                }
            }).state('cl.packingStation.branch', {
                url: '/branch/:branchId',
                templateUrl: 'conveyor-line/packing-station/template/packingStation.html',
                controller: packingStationController,
                data: {
                    title: "Packing Station "
                }
            }).state('cl.conveyorDashboard.list', {
                url: '/list',
                templateUrl: 'conveyor-line/conveyor-dashboard/template/conveyorDashboardLineList.html',
                controller: conveyorDashboardLineListController,
                data: {
                    title: "Conveyor Dashboard List"
                }
            }).state('cl.conveyorDashboard.line', {
                url: '/line/:lineId',
                templateUrl: 'conveyor-line/conveyor-dashboard/template/conveyorDashboard.html',
                controller: conveyorDashboardController,
                data: {
                    title: "Conveyor Dashboard"
                }
            }).state('cl.smallParcelStation', {
                url: '/smallParcelStation',
                templateUrl: 'conveyor-line/small-parcel-station/template/smallParcelStation.html',
                controller: smallParcelStationController,
                data: {
                    title: "Small Parcel Station"
                }
            }).state('cl.packingStation', {
                url: '/packingStation',
                template: '<ui-view></ui-view>'
            }).state('cl.exceptionalHandling', {
                url: '/exceptionalHandling',
                template: '<ui-view></ui-view>'
            }).state('cl.conveyorDashboard', {
                url: '/conveyorDashboard',
                template: '<ui-view></ui-view>'
            })
        }]).controller('packingStationController', packingStationController)
        .controller('exceptionalHandlingController', exceptionalHandlingController)
        .controller('packingStationBranchListController', packingStationBranchListController)
        .controller('exceptionalHandlingLineListController', exceptionalHandlingLineListController)
        .controller('conveyorDashboardLineListController', conveyorDashboardLineListController)
        .controller('conveyorDashboardController', conveyorDashboardController)
        .controller('smallParcelStationController', smallParcelStationController);
});