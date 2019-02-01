'use strict';

define([
    './factories'
], function (factories, _) {
    factories.factory('fileService', function ($resource) {

        var service = {};

        service.buildDownloadUrl = function(fileId){
            var fileDownloadUrl = "/shared/file-app/file-download/" + fileId;
            fileDownloadUrl = linc.config.contextPath + fileDownloadUrl;
            return fileDownloadUrl;
        };

        service.buildItemDownloadUrl = function(fileId){
            var fileDownloadUrl = "/shared/file-app/file-download/" + fileId;
            fileDownloadUrl = linc.config.contextPath + fileDownloadUrl;
            return fileDownloadUrl;
        };

        service.fileSearch = function (param) {
            return $resource("/file-app/file-info/search", null, { "postQuery": { method: 'POST', isArray: true } }).postQuery(param).$promise;
        };

        service.updateFileEntry = function (id, FileEntryUpdate) {
            return $resource("/base-app/file-entry/:id", null, {
                'update': {
                    method: 'PUT'
                }
            }).update({ id: id }, FileEntryUpdate).$promise;
        };
        
        service.savefile = function (fileEntry) {
            return $resource("/base-app/file-entry").save(fileEntry).$promise;
        };

        service.getFileEntry = function (id) {
            return $resource("/base-app/file-entry/:id").get({ id: id }).$promise;
        };

        service.removeFileEntry = function (id) {
            return $resource("/base-app/file-entry/:id/disable", { id: id }, {
                'disable': {
                    method: 'PUT'
                }
            }).disable().$promise;
        };

        service.searchEntryFile = function (param) {
            return $resource("/base-app/file-entry/search", null, {
                'postSearch': {
                    method: 'POST',
                    isArray: true
                }
            }).postSearch(param).$promise;
        };

        return service;
    });
});
