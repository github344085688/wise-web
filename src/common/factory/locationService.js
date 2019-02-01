'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('locationService', function ($resource) {
        var service = {};

        service.getOccupyEntryList = function (param) {
            return $resource('/base-app/location/occupy-entry/search', null, {
                "postQuery": {
                    method: 'POST',
                    isArray: true
                }
            }).postQuery(param).$promise;
        };


        service.getLocationList = function (param) {
            return $resource('/base-app/location/search', null, {
                "postQuery": {
                    method: 'POST',
                    isArray: true
                }
            }).postQuery(param).$promise;
        };


        service.getLocationDockSuggestList = function (loadIds) {
            return $resource('/bam/window/checkin/dock-suggest', null, {
                "postQuery": {
                    method: 'POST',
                    isArray: true
                }
            }).postQuery({ loadIds: loadIds }).$promise;
        };

        service.getLocationById = function (id) {
            return $resource('/base-app/location/' + id).get().$promise;
        };

        service.searchLocation = function (param) {
            var entry = $resource("/bam/base/location/search", null, { 'postQuery': { method: 'POST', isArray: true } });
            return entry.postQuery(param).$promise;
        };

        service.locationBasicInfoSearchByPaging = function (param) {
            return $resource("/base-app/location/search-by-paging", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };

        service.locationSearchByPaging = function (param) {
            return $resource("/bam/location/search-by-paging", null, { "postQuery": { method: 'POST' } }).postQuery(param).$promise;
        };

        service.addLocation = function (location) {
            var entry = $resource("/base-app/location");
            return entry.save(location).$promise;
        };

        service.batchAddLocation = function (locations) {
            var entry = $resource("/base-app/location/batch-create", null, { 'postQuery': { method: 'POST', isArray: true } });
            return entry.postQuery(locations).$promise;
        };

        service.updateLocation = function (location) {
            var entry = $resource("/base-app/location/:id", null, { 'update': { method: 'PUT' } });
            return entry.update({ id: location.id }, location).$promise;
        };

        service.releaseDock = function (locationId, entryId) {
            return $resource("/base-app/location/release", null, { 'update': { method: 'PUT' } }).update({ locationId: locationId, entryId: entryId }).$promise;
        };

        service.reserveDock = function (locationId, entryId) {
            return $resource("/base-app/location/reserve", null, { 'update': { method: 'PUT' } }).update({ locationId: locationId, entryId: entryId }).$promise;
        };

        service.occupyDock = function (locationId, entryId) {
            return $resource("/base-app/location/occupy", null, { 'update': { method: 'PUT' } }).update({ locationId: locationId, entryId: entryId }).$promise;
        };

        service.getZones = function () {
            var entry = $resource("/base-app/location/search", null, { 'postQuery': { method: 'POST', isArray: true } });
            return entry.postQuery({ type: 'ZONE' }).$promise;
        };


        service.searchLocationGroup = function (param) {
            return $resource('/fd-app/location-group/search', null, {
                "postQuery": {
                    method: 'POST',
                    isArray: true
                }
            }).postQuery(param).$promise;
        };
        service.searchLocationGroupFromBam = function (param) {
            return $resource('/bam/location-group/search', null, {
                "postQuery": {
                    method: 'POST',
                    isArray: false
                }
            }).postQuery(param).$promise;
        };

        service.getLocationGroupById = function (id) {
            return $resource('/fd-app/location-group/' + id).get().$promise;
        };

        service.addLocationGroup = function (locationGroup) {
            var entry = $resource("/fd-app/location-group");
            return entry.save(locationGroup).$promise;
        };

        service.updateLocationGroup = function (locationGroup) {
            var entry = $resource("/fd-app/location-group/:id", null, { 'update': { method: 'PUT' } });
            return entry.update({ id: locationGroup.id }, locationGroup).$promise;
        };

        service.deleteLocationGroup = function (id) {
            return $resource('/fd-app/location-group/' + id).delete().$promise;
        };

        service.isDockBusy = function (dock) {
            if (!dock || !dock.dockStatus) return false;
            if (dock.dockStatus.toUpperCase() == "OCCUPIED" || dock.dockStatus.toUpperCase() == "RESERVED") {
                return true;
            }
            return false;
        };

        service.addVirtualLocationGroup = function (locationVirtualGroup) {
            var entry = $resource("/wms-app/location/virtual-group");
            return entry.save(locationVirtualGroup).$promise;
        };

        service.deleteVirtualLocationGroup = function (id) {
            return $resource('/wms-app/location/virtual-group/' + id).delete().$promise;
        };


        service.updateVirtualLocationGroup = function (groupId, virtualLocation) {
            var entry = $resource("/wms-app/location/virtual-group/:groupId", null, { 'update': { method: 'PUT' } });
            return entry.update({ groupId: groupId }, virtualLocation).$promise;
        };

        service.getVirtualLocationGroupById = function (groupId) {
            return $resource('/wms-app/location/virtual-group/:groupId').get({ groupId: groupId }).$promise;
        };
        service.searchVirtualLocationGroup= function (param) {
            return $resource('/wms-app/location/virtual-group/search', null, {"postQuery": { method: 'POST',isArray:true}}).postQuery(param).$promise;
        };

        service.searchVirtualLocationGroupFromBam = function (param) {
            return $resource('/bam/location/virtual-group/search', null, {"postQuery": { method: 'POST'}}).postQuery(param).$promise;
        };


        service.addLocationTag = function (locationVirtualGroupTag) {
            var entry = $resource("/wms-app/location/virtual-tag");
            return entry.save(locationVirtualGroupTag).$promise;
        };

        service.updateLocationTag = function (tagId, virtualLocationTag) {
            var entry = $resource("/wms-app/location/virtual-tag/:tagId", null, { 'update': { method: 'PUT' } });
            return entry.update({ tagId: tagId }, virtualLocationTag).$promise;
        };

        service.getLocationTagByIdFromBam = function (tagId) {
            return $resource('/bam/location/virtual-tag/:tagId').get({ tagId: tagId }).$promise;
        };

        service.searchLocationTag = function (param) {
            return $resource('/wms-app/location/virtual-tag/search', null, {"postQuery": {method: 'POST',isArray: true}}).postQuery(param).$promise;
        };

        service.deleteLocationTag = function (tagId) {
            return $resource('/wms-app/location/virtual-tag/' + tagId).delete().$promise;
        };

        service.resetPickStrategyWeight = function () {
            return $resource("/base-app/location/pick-strategy-weight/reset-all", null, { 'update': { method: 'PUT' } }).update().$promise;
        };

        service.updateLocationTenant = function (param) {
            return $resource("/base-app/location/tenant", null, { 'update': { method: 'PUT' } }).update(param).$promise;
        };

        service.updateReplenishPathCost = function(replenishPathCosts) {
            return $resource("/wms-app/replenish-path-costs/all", null,  {'update': { method: 'PUT' }}).update(replenishPathCosts).$promise;
        };
            
        service.getReplenishPathCost = function () {
            return $resource('/wms-app/replenish-path-costs/all').get().$promise;
        };

        return service;
    });
});