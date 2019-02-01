'use strict';

define([
    'angular',
    'src/foundation-data/uomDefinition/uomDefinitionListPageService',
    'src/foundation-data/uomDefinition/uomDefinitionService'
], function(angular, uomDefinitionListCtrl, uomDefinitionService) {
    angular.module('linc.fd.uomDefinition', [])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('fd.uomDefinition.list', {
                url: '/list',
                views: {
                    "unis-main@fd.uomDefinition.list": {
                        templateUrl: 'foundation-data/uomDefinition/template/uomNameDefinitionList.html',
                        controller: 'UomDefinitionListController',
                        controllerAs: "ctrl"
                    },
                    "@": {
                        template: ""
                    },
                    "unis@": {
                        templateUrl: 'common/template/unis-main.html',
                        controller: 'DefaultMainPageController'
                    }
                },
                data: {
                    permissions: "uomDefinition_read"
                }
            });
        }])
        .factory("uomDefinitionService",uomDefinitionService)
        .controller("UomDefinitionListController", uomDefinitionListCtrl);

});
