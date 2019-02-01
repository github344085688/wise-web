'use strict';

define([
    './factories'
], function(factories, _) {
    factories.factory('waittingService', function($resource) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST'

            }
        };
        var service = {};
        service.waittingEntrySearch = function(param){
            return $resource("/bam/entry-ticket/search",{}, resourceConfig)
                .search(param).$promise;
        };


        service.setEntryExpediteFee = function(entry) {
            return $resource("/base-app/entry-ticket/" + entry.entryId, {}, resourceConfig)
                .update({expediteFee: entry.expediteFee}).$promise;

            // return $resource("/wms-app/window/checkin/" + entry.entryId + "/mark-vip",{}, resourceConfig)
            //     .update({expediteFee: entry.expediteFee}).$promise;
        };
        return service;
    });
});
