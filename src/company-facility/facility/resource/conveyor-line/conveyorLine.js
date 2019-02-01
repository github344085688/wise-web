'use strict';

define([
    'angular',
    'src/company-facility/facility/resource/conveyor-line/conveyorLineListController',
    'src/company-facility/facility/resource/conveyor-line/editConveyorLineListController'
], function(angular, conveyorLineListController,editConveyorLineListController) {
    angular.module('linc.cf.facility.resource.conveyorLine', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.facility.resource.conveyorLine.list', {
                url: '/list',
                views: {
                    "unis-main@cf.facility.resource.conveyorLine.list": {
                        templateUrl: 'company-facility/facility/resource/conveyor-line/template/conveyorLineList.html',
                        controller: 'conveyorLineListController',
                        controllerAs: "ctrl"
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                 }
             }).state('cf.facility.resource.conveyorLine.add', {
                url: '/add',
                views: {
                    "unis-main@cf.facility.resource.conveyorLine.add": {
                        templateUrl: 'company-facility/facility/resource/conveyor-line/template/editConveyorLineList.html',
                        controller: 'editConveyorLineListController',
                        controllerAs: "ctrl"
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }, 
                    resolve: {
                        'isAddAction': function(){
                            return true;
                        }
                    }
                 }
             }).state('cf.facility.resource.conveyorLine.edit', {
                url: '/edit/:lineId',
                views: {
                    "unis-main@cf.facility.resource.conveyorLine.edit": {
                        templateUrl: 'company-facility/facility/resource/conveyor-line/template/editConveyorLineList.html',
                        controller: 'editConveyorLineListController',
                        controllerAs: "ctrl"
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                 }
             });
          }])
        .controller("conveyorLineListController", conveyorLineListController)
        .controller("editConveyorLineListController", editConveyorLineListController);
      });
