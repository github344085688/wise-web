'use strict';

define([
    'angular',
    'src/company-facility/facility/resource/conveyor-branch/conveyorBranchListController',
    'src/company-facility/facility/resource/conveyor-branch/editConveyorBranchListController'
], function(angular, conveyorBranchListController,editConveyorBranchListController) {
    angular.module('linc.cf.facility.resource.conveyorBranch', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.facility.resource.conveyorBranch.list', {
                url: '/list',
                views: {
                    "unis-main@cf.facility.resource.conveyorBranch.list": {
                        templateUrl: 'company-facility/facility/resource/conveyor-branch/template/conveyorBranchList.html',
                        controller: 'conveyorBranchListController',
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
             }).state('cf.facility.resource.conveyorBranch.add', {
                url: '/add',
                params:{"lineId":null},
                views: {
                    "unis-main@cf.facility.resource.conveyorBranch.add": {
                        templateUrl: 'company-facility/facility/resource/conveyor-branch/template/editConveyorBranchList.html',
                        controller: 'editConveyorBranchListController',
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
             }).state('cf.facility.resource.conveyorBranch.edit', {
                url: '/edit/:branchId',
                views: {
                    "unis-main@cf.facility.resource.conveyorBranch.edit": {
                        templateUrl: 'company-facility/facility/resource/conveyor-branch/template/editConveyorBranchList.html',
                        controller: 'editConveyorBranchListController',
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
        .controller("conveyorBranchListController", conveyorBranchListController)
        .controller("editConveyorBranchListController", editConveyorBranchListController);
      });
