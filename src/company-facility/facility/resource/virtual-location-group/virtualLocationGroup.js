'use strict';

define([
    'angular',
    'src/company-facility/facility/resource/virtual-location-group/virtualLocationGroupListController',
    'src/company-facility/facility/resource/virtual-location-group/editVirtualLocationGroupController',
    'src/company-facility/facility/resource/virtual-location-group/batchUpdateZonePickersController',
    'src/company-facility/facility/resource/virtual-location-group/replenishGroupSettingController',
    './editTitleVirtualLocationGroupController',
    './titleVirtualLocationGroupListController'
], function(angular, virtualLocationGroupListController, editVirtualLocationGroupController,
            batchUpdateZonePickersController,replenishGroupSettingController, editTitleVirtualLocationGroupController, titleVirtualLocationGroupListController) {
    angular.module('linc.cf.facility.resource.virtualLocationGroup', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('cf.facility.resource.virtualLocationGroup.groupManagement', {
                url: '/groupManagement',
                template: '<ui-view></ui-view>'
            }).state('cf.facility.resource.virtualLocationGroup.titleVlgMapping', {
                url: '/titleVlgMapping',
                template: '<ui-view></ui-view>'
            }).state('cf.facility.resource.virtualLocationGroup.groupManagement.list', {
                url: '/list',
                views: {
                    "unis-main@cf.facility.resource.virtualLocationGroup.groupManagement.list": {
                        templateUrl: 'company-facility/facility/resource/virtual-location-group/template/virtualLocationGroupList.html',
                        controller: 'VirtualLocationGroupListController',
                        controllerAs: "ctrl"
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    permissions: "facility::virtualLocationGroup_read"
                }
            }).state('cf.facility.resource.virtualLocationGroup.groupManagement.add', {
                url: '/add',
                views: {
                    "unis-main@cf.facility.resource.virtualLocationGroup.groupManagement.add": {
                        templateUrl: 'company-facility/facility/resource/virtual-location-group/template/editVirtualLocationGroup.html',
                        controller: 'EditVirtualLocationGroupController',
                        controllerAs: "ctrl"
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                resolve: {
                    'isAddAction': function(){
                        return true;
                    }
                },
                data: {
                    permissions: "facility::virtualLocationGroup_write"
                }
            }).state('cf.facility.resource.virtualLocationGroup.groupManagement.update', {
                url: '/update',
                views: {
                    "unis-main@cf.facility.resource.virtualLocationGroup.groupManagement.update": {
                        templateUrl: 'company-facility/facility/resource/virtual-location-group/template/batchUpdateZonePickers.html',
                        controller: 'BatchUpdateZonePickersController',
                        controllerAs: "ctrl"
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                resolve: {
                    'isAddAction': function(){
                        return true;
                    }
                },
                data: {
                    permissions: "facility::virtualLocationGroup_write"
                }
            }).state('cf.facility.resource.virtualLocationGroup.replenishGroup', {
                url: '/replenishGroup',
                views: {
                    "unis-main@cf.facility.resource.virtualLocationGroup.replenishGroup": {
                        templateUrl: 'company-facility/facility/resource/virtual-location-group/template/replenishGroupSetting.html',
                        controller: 'ReplenishGroupSettingController',
                        controllerAs: "ctrl"
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                resolve: {
                    'isAddAction': function(){
                        return true;
                    }
                },
                data: {
                    permissions: "facility::virtualLocationGroup_write"
                }
            }).state('cf.facility.resource.virtualLocationGroup.edit', {
            }).state('cf.facility.resource.virtualLocationGroup.groupManagement.edit', {
                url: '/edit/:groupId',
              
                views: {
                    "unis-main@cf.facility.resource.virtualLocationGroup.groupManagement.edit": {
                        templateUrl: 'company-facility/facility/resource/virtual-location-group/template/editVirtualLocationGroup.html',
                        controller: 'EditVirtualLocationGroupController',
                        controllerAs: "ctrl"
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                resolve: {
                    'isAddAction' : function(){
                        return false;
                    }
                },
                data: {
                    permissions: "facility::virtualLocationGroup_read"
                }
            }).state('cf.facility.resource.virtualLocationGroup.titleVlgMapping.list', {
                url: '/list',
                views: {
                    "unis-main@cf.facility.resource.virtualLocationGroup.titleVlgMapping.list": {
                        templateUrl: 'company-facility/facility/resource/virtual-location-group/template/titleVirtualLocationGroupList.html',
                        controller: 'TitleVirtualLocationGroupListController'
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    permissions: "facility::virtualLocationGroup_read"
                }
            }).state('cf.facility.resource.virtualLocationGroup.titleVlgMapping.add', {
                url: '/add',
                views: {
                    "unis-main@cf.facility.resource.virtualLocationGroup.titleVlgMapping.add": {
                        templateUrl: 'company-facility/facility/resource/virtual-location-group/template/editTitleVirtualLocationGroup.html',
                        controller: 'EditTitleVirtualLocationGroupController'
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                resolve: {
                    'isAddAction': function(){
                        return true;
                    }
                },
                data: {
                    permissions: "facility::virtualLocationGroup_write"
                }
            }).state('cf.facility.resource.virtualLocationGroup.titleVlgMapping.edit', {
                url: '/edit/:groupId',
                views: {
                    "unis-main@cf.facility.resource.virtualLocationGroup.titleVlgMapping.edit": {
                        templateUrl: 'company-facility/facility/resource/virtual-location-group/template/editTitleVirtualLocationGroup.html',
                        controller: 'EditTitleVirtualLocationGroupController'
                    },
                    "@":{
                        template:""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                resolve: {
                    'isAddAction' : function(){
                        return false;
                    }
                },
                data: {
                    permissions: "facility::virtualLocationGroup_read"
                }
            });
        }])
        .controller("VirtualLocationGroupListController", virtualLocationGroupListController)
        .controller("BatchUpdateZonePickersController", batchUpdateZonePickersController)
        .controller("ReplenishGroupSettingController", replenishGroupSettingController)
        .controller("EditVirtualLocationGroupController", editVirtualLocationGroupController)
        .controller("EditVirtualLocationGroupController", editVirtualLocationGroupController)
        .controller("EditTitleVirtualLocationGroupController", editTitleVirtualLocationGroupController)
        .controller("TitleVirtualLocationGroupListController", titleVirtualLocationGroupListController)

});
