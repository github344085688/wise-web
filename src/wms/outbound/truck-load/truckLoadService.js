'use strict';

define(['angular', 'lodash'], function(angular, _) {

    var truckService = function() {
        var truckLoadService = {};
        var _loadLines = [];

        var _truckLoad = {};
        truckLoadService.getTruckLoad = function() {
            return _truckLoad;
        };

        truckLoadService.setTruckLoad = function(truckLoad) {
            _truckLoad = truckLoad;
        };

        truckLoadService.setLoadLines = function(loadLines) {
            _loadLines = loadLines;
        };

        truckLoadService.getLoadLines = function() {
            return _loadLines;
        };

        truckLoadService.addLoadLines = function(loadLines) {
            truckLoadService.fromSelect = true;
            _loadLines = _.uniqBy(_.concat(_loadLines, loadLines), 'id');
        };

        return truckLoadService;
    };
    return truckService;


});
