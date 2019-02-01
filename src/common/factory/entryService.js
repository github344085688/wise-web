'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('entryService', function ($resource, lincUtil) {
        var resourceConfig = {
            'update': {
                method: 'PUT'
            },
            'search': {
                method: 'POST',
                isArray: true
            }
        };


        var service = {};
        service.createEntry = function (entry) {
            return $resource("/base-app/entry-ticket").save(entry).$promise;
        };

        service.updateEntry = function (entry) {
            return $resource("/base-app/entry-ticket/:id", null, {
                'update': {
                    method: 'PUT'
                }
            }).update({ id: entry.id }, entry).$promise;
        };

        service.getPrintEntry = function (entryId) {
            return $resource("/bam/wms-app/checkin/entry-label/:entryId").get({ entryId: entryId }).$promise;
        };

        service.getPrintEntryTicketCheckout = function (entryId) {
            return $resource("/wms-app/entry-ticket-checkout/:entryId").get({ entryId: entryId }).$promise;
        };

        service.searchEntryByPaging = function (criteria) {
            return $resource("/bam/window-checkin/entry-ticket/search", null, {
                'postSearch': {
                    method: 'POST'
                }
            }).postSearch(criteria).$promise;
        };


        service.getEntryByEntryId = function (entryId) {
            return $resource("/bam/wms-app/window-checkin/entry-ticket/:entryId").get({
                entryId: entryId
            }).$promise;
        };

        service.getCarrierInfoByEntryId = function (entryId) {
            return $resource("/bam/wms-app/window-checkin/entry-ticket/:entryId/carrier-info").get({
                entryId: entryId
            }).$promise;
        };

        service.saveCheckinCarrierInfo = function (entryId, params) {
            return $resource("/wms-app/window/checkin/:entryId/carrier-info", null, {
                'update': {
                    method: 'PUT'
                }
            }).update({
                entryId: entryId
            }, params).$promise;
        };

        service.getCarrierByMcDot = function (mcDot) {
            return $resource("/fd-app/carrier/organization/:mcdot").get({ mcdot: mcDot }).$promise;
        };

        /*  Activity Page   */
        service.saveActivity = function (entryId, activityList) {
            return $resource("/wms-app/window/checkin/:entryId/activity", null, {
                'update': {
                    method: 'PUT'
                }
            }).update({
                entryId: entryId
            }, activityList).$promise;
        };

        service.searchAvailableReceipts = function (search) {
            return $resource("/bam/wms-app/window-checkin/receipt/search").query({
                query: search
            }).$promise;
        };

        service.searchAvailableLoads = function (search) {
            return $resource("/bam/wms-app/window-checkin/load/search").query({
                query: search
            }).$promise;
        };

        service.getActivity = function (entryId) {
            return $resource("/bam/wms-app/window-checkin/activity/:entryId").get({
                entryId: entryId
            }).$promise;
        };

        service.searchLoadTaskByParams = function (param) {
            return $resource("/wms-app/outbound/load-task/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true,
                }
            }).postSearch(param).$promise;
        };
        service.searchReceiveTaskByParams = function (param) {

            return $resource("/wms-app/inbound/task/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true,
                },

            }).postSearch(param).$promise;
        };
        service.searchLoadTask = function (loadId, companyId) {
            var loadIds = [];
            loadIds.push(loadId);
            return $resource("/wms-app/outbound/load-task/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true,
                    headers: lincUtil.composeCompanyHeader(companyId)
                }
            }).postSearch({
                loadIds: loadIds,
                scenario: "Window Checkin Activity"
            }).$promise;
        };


        service.searchReceiveTask = function (receiptId, companyId) {

            return $resource("/wms-app/inbound/task/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true,
                    headers: lincUtil.composeCompanyHeader(companyId)
                },

            }).postSearch({
                receiptId: receiptId
            }).$promise;
        };
        service.updateRecieptTaskAndLoadTask = function (receiptList, loadList, entryId) {
            return $resource("/bam/wms-app/window-checkin/activity/updateRecieptTaskAndLoadTask", null, {
                'postSearch': {
                    method: 'POST'
                }
            }).postSearch({
                entryId: entryId,
                receiptLists: receiptList,
                loadLists: loadList
            }).$promise;
        };

        /* Task Page */
        service.getTasksByEntryId = function (entryId) {
            return $resource("/bam/wms-app/window-checkin/tasks/:entryId").get({
                entryId: entryId
            }).$promise;
        };

        service.getTransloadTasksByEntryId = function (entryId) {
            return $resource("/bam/wms-app/window-checkin/transload-tasks/:entryId").get({
                entryId: entryId
            }).$promise;
        };

        service.transloadWaitingConfirm = function (entryId, task) {
            return $resource("/bam/wms-app/window-checkin/transload-tasks/:entryId/waiting", null, {
                'update': {
                    method: 'PUT'
                }
            }).update({
                entryId: entryId
            }, task).$promise;
        };


        service.waitingConfirm = function (entryId, tasks) {
            return $resource("/bam/wms-app/window-checkin/tasks/:entryId/waiting", null, {
                'update': {
                    method: 'PUT'
                }
            }).update({
                entryId: entryId
            }, tasks).$promise;
        };

        service.updateWaiting = function (entryId, waiting) {
            return $resource("/wms-app/window/checkin/:entryId/waiting-list/enqueue", null, {
                'update': {
                    method: 'PUT'
                }
            }).update({
                entryId: entryId
            }, waiting).$promise;
        };

        service.checkin = function (entryId, tasks) {
            return $resource("/bam/wms-app/window-checkin/tasks/:entryId/checkin", null, {
                'update': {
                    method: 'PUT'
                }
            }).update({
                entryId: entryId
            }, tasks).$promise;
        };

        service.waittingEntry = function () {
            var resourceConfig = {
                'queryWaitting': {
                    method: 'get',
                    isArray: false
                }
            };
            return $resource("/bam/entry-ticket/waitting", null, resourceConfig).queryWaitting().$promise;
        };
        service.waittingSearch = function (entryId) {
            var resourceConfig = {
                'queryWaitting': {
                    method: 'POST',
                    isArray: true
                }
            };
            return $resource("/wms-app/window/checkin/waiting-list/search", null, resourceConfig).queryWaitting({ entryId: entryId }).$promise;
        };
        service.readyToCheckIn = function (entry) {
            return $resource("/wms-app/window/checkin/:entryId/waiting-list/dequeue", { entryId: entry.id }, {
                'update': {
                    method: 'PUT'
                }
            }).update().$promise;
        };

        service.setEntryExpediteFee = function (entry) {
            return $resource("/base-app/entry-ticket/" + entry.entryId, {}, {
                'update': {
                    method: 'PUT'
                }
            }).update({ expediteFee: entry.expediteFee }).$promise;
        };

        service.getEquipmentType = function () {
            return $resource("/data/wms/equipment-type.json").query().$promise;
        };

        service.savePhoto = function (entryPhoto) {
            return $resource("/base-app/file-entry").save(entryPhoto).$promise;
        };

        service.getEntryPhotos = function (param) {
            return $resource("/base-app/file-entry/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise;
        };

        service.removeEntryPhoto = function (id) {
            return $resource("/base-app/file-entry/:id/disable", { id: id }, {
                'disable': {
                    method: 'PUT'
                }
            }).disable().$promise;
        };


        service.deleteReceiveAndLoadTasksByEntryId = function (entryId) {
            return $resource("/bam/wms-app/window-checkin/activity/delete-receive-load-tasks/:entryId",
                {entryId: entryId}, {
                    'post': {
                        method: 'POST'
                    }
                }).post().$promise;
        };

        service.transloadCheckin = function (entryId, checkInInfo) {
            return $resource("/wms-app/window/transload-checkin/:entryId/checkin", {entryId: entryId}, {
                'update': {
                    method: 'PUT'
                }
            }).update(checkInInfo).$promise;
        };

        service.transloadWaiting = function (entryId, waitingInfo) {
            return $resource("/wms-app/window/transload-checkin/:entryId/waiting", {entryId: entryId}, {
                'update': {
                    method: 'PUT'
                }
            }).update(waitingInfo).$promise;
        };

        service.forceRemoveReceipt = function (entryId, forceRemoveReceipt) {
            return $resource("/wms-app/window/checkin/tasks/:entryId/force-remove-receipt", {entryId: entryId}, {
                'update': {
                    method: 'PUT'
                }
            }).update(forceRemoveReceipt).$promise;
        };

        service.searchActivityForGisByParams = function (param) {

            return $resource("/wms-app/window/checkin/activity/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true,
                },

            }).postSearch(param).$promise;
        };

        service.checkInReject = function (entryId, entryTicketReject ) {
            return $resource("/base-app/entry-ticket/:entryId/check-in-reject", { entryId: entryId }, {
                'update': {
                    method: 'PUT'
                }
            }).update(entryTicketReject).$promise;
        };

        return service;

    });
});
