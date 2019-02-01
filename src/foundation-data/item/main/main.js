'use strict';

define([
    'angular',
    'src/foundation-data/item/inheritPropertiesService',
    'src/foundation-data/item/itemspec/item',
    'src/foundation-data/item/item-property-configuration/itemProperty',
    'src/foundation-data/item/item-group/itemGroup',
    'src/foundation-data/item/black-sn/blackSN',
    'src/foundation-data/item/item-lp-template-mapping/itemLpTemplateMapping'
], function(angular, inheritPropertiesService) {
    angular.module('linc.fd.item', ['linc.fd.item.itemspec',
        'linc.fd.item.itemProperty','linc.fd.item.itemGroup', 'linc.fd.item.black-sn', 'linc.fd.item.item-lp-template-mapping'])
        .config(['$stateProvider', function($stateProvider) {
            $stateProvider.state('fd.item.itemspec', {
                        url: '/itemspec',
                        templateUrl: 'foundation-data/item/itemspec/template/item.html'
                    }).state('fd.item.itemProperty', {
                        url: '/itemproperty',
                        templateUrl: 'foundation-data/item/item-property-configuration/template/itemProperty.html',
                    }).state('fd.item.itemGroup', {
                        url: '/ipg',
                        templateUrl: 'foundation-data/item/item-group/template/itemGroup.html',
                    }).state('fd.item.blackSN', {
                        url: '/blackSN',
                        template:'<ui-view></ui-view>'
                    }).state('fd.item.lpTemplateMapping', {
                        url: '/lpTemplateMapping',
                        template:'<ui-view></ui-view>'
                    });
        }])
        .factory('inheritPropertiesService', inheritPropertiesService);
});
