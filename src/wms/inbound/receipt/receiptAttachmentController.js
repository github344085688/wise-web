'use strict';

define(['angular', 'lodash'], function (angular, _) {

    var uploadController = function ($scope, lincUtil, locals, $mdDialog, fileService,$q ) {
        var receipt = locals.receipt;
        $scope.pageSize = 10;
        $scope.uploadFileSuccess = function (param) {
            var fileIds = param.fileId;
            if (fileIds) {
                savefile(receipt,fileIds).then(function(){
                    getFiles(receipt.id);
                },function(error){
                    lincUtil.processErrorResponse(error);
                });
            }

        }
        function savefile(receipt,fileIds) {

            var promises = [];
            fileIds.forEach(function (fileId) {
                var promise = fileService.savefile({tags:[receipt.id],fileCategory:"Receipt",fileScenario:"Other",fileId:fileId,fileType:'Photo'});
                promises.push(promise);
            });
            return $q.all(promises);

        }

        $scope.loadFile=function(file) {
            var a = document.createElement('a');
            var fileDownloadUrl = fileService.buildDownloadUrl(file.id);
            a.href = fileDownloadUrl;
            a.target = '_blank';
            a.click();
        }

        function getFiles(receiptId) {

            fileService.searchEntryFile({fileTags:[receiptId],fileCategory:"Receipt",fileScenario:"Other",fileType:'Photo'}).then(function (file) {
               var fileIds= _.uniq( _.map(file,'fileId'));
    
               $scope.fileEntryKeyByFileId=_.keyBy(file,'fileId');
                if (fileIds.length > 0) {
                    fileService.fileSearch({ ids: fileIds }).then(function (files) {
                        $scope.receiptFiles = files;
                         $scope.loadContent(1);
                    });
                }else{
                    $scope.receiptFiles =[];
                    $scope.loadContent(1);
                }
            }, function (error) {

                lincUtil.processErrorResponse(error);
            });
        }

        $scope.loadContent = function (currentPage) {
            $scope.receiptFilesView = $scope.receiptFiles.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.receiptFiles.length ? $scope.receiptFiles.length : currentPage * $scope.pageSize);
        };

        function _init() {
            getFiles(receipt.id);
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.deleteFileEntry=function(fileId){
          if($scope.fileEntryKeyByFileId[fileId]){
            fileService.removeFileEntry($scope.fileEntryKeyByFileId[fileId].id).then(function(response){
                getFiles(receipt.id);
            },function(error){
                lincUtil.processErrorResponse(error);
            });
          }
        }

        _init();
    }
    uploadController.$inject = ['$scope', 'lincUtil', 'locals', '$mdDialog', 'fileService','$q'];

    return uploadController;
});