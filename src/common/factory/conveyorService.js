'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('conveyorService', function ($resource) {
        var service = {};


        service.converyLineSearch = function (param) {
            return $resource('/wms-app/conveyor-line/search', null, {
                "postQuery": {
                    method: 'POST',
                    isArray: true
                }
            }).postQuery(param).$promise;
        };

        service.conveyorLineCreate = function (PackingStation) {
            var entry = $resource("/wms-app/conveyor-line");
            return entry.save(PackingStation).$promise;
        };        

        service.getConveryLine = function (lineId) {
            return $resource('/wms-app/conveyor-line/:id').get({ id: lineId }).$promise;
        };

        service.updateConveryLine = function (lineId,ConveryLine) {
            var entry = $resource("/wms-app/conveyor-line/:id", null, { 'update': { method: 'PUT' } });
            return entry.update({ id: lineId }, ConveryLine).$promise;
        };
        service.converyLineDelete = function (lineId) {
            var entry = $resource("/wms-app/conveyor-line/:id");
            return entry.delete({id: lineId}).$promise;
        };


        service.conveyorBranchCreate = function (param) {
            return $resource('/wms-app/conveyor-branch', null, {"postQuery": { method: 'POST'}}).postQuery(param).$promise;
        };
        
        service.converyBranchSearch= function (param) {
            return $resource('/bam/conveyor-branch/search', null, {"postQuery": { method: 'POST',isArray:true}}).postQuery(param).$promise;
        };

        service.converyBranchRelease = function (branchId) {
            var entry = $resource("/wms-app/conveyor-branch/:id/release",{ id: branchId } , { 'update': { method: 'PUT' } });
            return entry.update().$promise;
        };

        service.converyBranchOccupy = function (branchId,occupy) {
            var entry = $resource("/wms-app/conveyor-branch/:id/occupy", null, { 'update': { method: 'PUT' } });
            return entry.update({id: branchId}, {occupiedBy:occupy}).$promise;
        };

        service.converyBranchUpdate = function (branchId,ConveryLine) {
            var entry = $resource("/wms-app/conveyor-branch/:id", null, { 'update': { method: 'PUT' } });
            return entry.update({ id: branchId }, ConveryLine).$promise;
        };

        service.converyBranchDelete = function (branchId) {
            var entry = $resource("/wms-app/conveyor-branch/:id");
            return entry.delete({id: branchId}).$promise;
        };

        service.getConveryBranch = function (branchId) {
            return $resource('/wms-app/conveyor-branch/:id').get({ id: branchId }).$promise;
        };

        service.getLpDetail = function (clp) {
            return $resource('/bam/outbound/pack-station/lp-detail/lp/:lpId').get({ lpId: clp }).$promise;
        };

        service.getLpTemplate = function (param) {
            return $resource('/bam/item-lp/search', null, {"postQuery": { method: 'POST',isArray: true}}).postQuery(param).$promise;
        };

        service.getPackTask = function (packTaskId) {
            return $resource('/wms-app/outbound/pack/task/:taskId').get({ taskId: packTaskId }).$promise;
        };


        service.bindingItemToLp = function (Id,slpId,PackItem) {
            var entry = $resource("/wms-app/outbound/pack/step/:stepId/lp/:lpId/binding-item", { stepId: Id, lpId: slpId} , { 'update': { method: 'PUT' } });
            return entry.update(PackItem).$promise;
        };

        
        service.updateLp = function (slpId,lpTemplate) {
            var entry = $resource("/wms-app/lp/:lpId", null , { 'update': { method: 'PUT' } });
            return entry.update({lpId: slpId}, lpTemplate).$promise;
        };

        service.addInnerLp = function (id,clpId,slpId) {
            var entry = $resource("/wms-app/outbound/pack/step/:stepId/lp/:lpId/add-inner-lp/:innerLpId", {stepId:id, lpId:slpId, innerLpId:clpId} , { 'update': { method: 'PUT' } });
            return entry.update().$promise;
        };

        service.reAssignBranches = function (lineId,clpId,name) {
            var entry = $resource("/wms-app/conveyor-line/:id/branch-manual-assign/lp/:lpId/branch/:branchName", {id:lineId, lpId:clpId, branchName:name} , { 'update': { method: 'PUT' } });
            return entry.update().$promise;
        };

        service.getLpBranch = function (lineId,clpId) {
            return $resource('/wms-app/conveyor-line/:id/lp/:lpId/assigned-branch').get({ id: lineId, lpId:clpId}).$promise;
        };

        service.getBranchStoreDetail = function (storeNo) {
            return $resource('/bam/outbound/pack-station/pick-pack-statistics/store/:storeNo').get({ storeNo: storeNo }).$promise;
        };

        service.getConveyorPickingDashboard = function (lineId) {
            return $resource('/report-center/dashboard/conveyor/:lineId/picking-report').get({ lineId: lineId }).$promise;
        };

        service.getSmallParcelStationLpDetail = function (lpId) {
            return $resource('/bam/outbound/small-parcel-station/lp/:lpId').get({ lpId: lpId }).$promise;
        };

        return service;
    });
});