'use strict';

define([
    './factories',
    'lodash'
], function(factories, _) {
    factories.factory('pickRuleService', function($q, $resource) {
        var services = {};

        services.savePickRule = function(pickRule) {
            return $resource("/fd-app/pickRuleConfig").save(pickRule).$promise;
        };

        services.updatePickRule = function(pickRule) {
            return $resource("/fd-app/pickRuleConfig/:id", null, {
                "update": {
                    method: 'PUT'
                }
            }).update({ id: pickRule.id }, pickRule).$promise;
        };

        services.getPickRuleConfig = function(pickRule) {
            return $resource("/fd-app/pickRuleConfig/search", null, {
                "postQuery": {
                    method: 'POST',
                    isArray: true
                }
            }).postQuery(pickRule).$promise;
        };

        return services;
    });


});
