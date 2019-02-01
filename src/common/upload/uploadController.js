
'use strict';

define(['angular', 'lodash'], function (angular, _) {

    var uploadController = function ($scope, $stateParams, $mdDialog, locals, FileUploader, itemService, session) {

        $scope.locals = locals;
       
        var uploader = $scope.uploader = new FileUploader({
            url:linc.config.env === "prod" ? '/v2/shared/file-app/file-upload': '/shared/file-app/file-upload',
            headers: {Authorization: session.getUserToken()}
        });

        // FILTERS
        uploader.filters.push({
            name: 'customFilter',
            fn: function(item /*{File|FileLikeObject}*/, options) {
                var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        });

        // CALLBACKS
        uploader.onBeforeUploadItem = function(item) {
            item.formData = [{ "app":"fd", "module":"item", "service":"pic"}];
        };
        uploader.onSuccessItem = function(fileItem, response, status, headers) {
            if(status == 200){
                var filesId =  response.filesId;
                filesId.forEach(function(id){
                    itemService.addItemPicture({"id":id, "itemSpecId":locals.itemSpecId,channel:"MANUAL"});
                    fileItem.id = id;
                });
            }
        };
        uploader.removeItem = function(fileItem) {
            fileItem.remove();
            if(fileItem.id){
                itemService.removeItemPicture(fileItem.id);
            }
        };
        uploader.cancelItem = function(fileItem) {
            fileItem.cancel();
            if(fileItem.id){
                itemService.removeItemPicture(fileItem.id);
            }
        };
        uploader.removeAllItem = function() {
            while(uploader.queue.length) {
                var fileItem = uploader.queue[0];
                fileItem.remove();
                if(fileItem.id){
                itemService.removeItemPicture(fileItem.id);
            }
            }
            uploader.progress = 0;
        };

        $scope.uploadController = function () {};
    

        $scope.hide = function() {
          $mdDialog.hide();
        };

        $scope.cancel = function() {
          $mdDialog.cancel();
          if(locals.itemSpecId){
              locals.refresh(locals.itemSpecId);
          }
        };

        $scope.save = function () {
            $mdDialog.hide();
        };

        $scope.answer = function(answer) {
          $mdDialog.hide(answer);
        };
    };

    uploadController.$inject = ['$scope', '$stateParams', '$mdDialog', 'locals', 'FileUploader', 'itemService', 'session'];

    return uploadController;
});