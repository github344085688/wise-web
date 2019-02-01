'use strict';

define(['angular', 'lodash'], function (angular, _) {

    var uploadController = function ($scope, $stateParams, $mdDialog, locals, FileUploader, session) {
        $scope.locals = locals;
        $scope.retFiles = $stateParams.fileIds;

        var uploader = $scope.uploader = new FileUploader({
            url: linc.config.contextPath +  '/shared/file-app/file-upload',
            headers: {Authorization: session.getUserToken()}
        });

        // FILTERS
        uploader.filters.push({
            name: 'customFilter',
            fn: function (item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        // CALLBACKS
        uploader.onBeforeUploadItem = function (item) {
            item.formData = [{"app": locals.app, "module": locals.module, "service": locals.service}];
        };
        uploader.onSuccessItem = function (fileItem, response, status, headers) {
            if (status == 200) {
                var filesId = response.filesId;
                fileItem.filesId = filesId;
            }
        };
        uploader.removeItem = function (fileItem) {
            fileItem.remove();
        };
        uploader.cancelItem = function (fileItem) {
            fileItem.cancel();
        };
        uploader.removeAllItem = function () {
            while (uploader.queue.length) {
                var fileItem = uploader.queue[0];
                fileItem.remove();
            }
            uploader.progress = 0;
        };

        $scope.uploadController = function () {
        };
        
        $scope.hide = function () {
            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };

        $scope.save = function () {
            var filesId = [];
            _.forEach(uploader.queue, function (fileItem) {
                filesId = _.union(filesId, fileItem.filesId);
            });
            $mdDialog.hide(filesId);
        };
    };

    uploadController.$inject = ['$scope', '$stateParams', '$mdDialog', 'locals', 'FileUploader', 'session'];

    return uploadController;
});