/**
 * Created by Jerry on 2018/1/30.
 */

'use strict';

define(['jquery', 'lodash', './directives'], function ($, _, directives) {
    directives.directive('uploadAttachment', ["$document", "$mdDialog", 'FileUploader', 'session',
        function ($document, $mdDialog, FileUploader, session) {

            return {
                restrict: "EA",
                templateUrl: 'common/directive/template/uploadAttachment.html',
                controller: function ($scope, FileUploader, session) {
                    $scope.uploadController = function () {};

                    var uploader = $scope.uploader = new FileUploader({
                        url: linc.config.contextPath +  '/shared/file-app/file-upload',
                        headers: {
                            Authorization: session.getUserToken()
                        }
                    });

                    // FILTERS
                    uploader.filters.push({
                        name: 'customFilter',
                        fn: function (item /*{File|FileLikeObject}*/ , options) {

                            var type = '|' + item.type.toLowerCase().slice(item.type.lastIndexOf('/') + 1) + '|';
                            // if('|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1){
                            //     if(item.size<=2*1024*1024){

                            //     }
                            // };
                            if ('|avi|wma|rmvb|rm|flash|mp4|mid|3GP|'.indexOf(type) !== -1) {
                                if (item.size < 30 * 1024 * 1024) {
                                    $scope.errorTips = "";
                                    return true;

                                } else {
                                    $scope.errorTips = 'The uploaded video can not large than 30M, please check';
                                    return false;
                                }
                            } else {
                                if (item.size < 2 * 1024 * 1024) {
                                    $scope.errorTips = "";
                                    return true;
                                } else {
                                    $scope.errorTips = 'The uploaded image or document can not large than 2M, please check';
                                    return false;
                                }
                            }

                        }
                    });

                    // CALLBACKS
                    uploader.onBeforeUploadItem = function (item) {

                        item.formData = [{
                            "app": $scope.app ? $scope.app : 'wms',
                            "module": $scope.module,
                            "service": $scope.service ? $scope.service : 'attachment'
                        }];
                    };
                    uploader.onSuccessItem = function (fileItem, response, status, headers) {
                        if (status == 200) {
                            var filesId = response.filesId;
                            fileItem.filesId = filesId;
                            uploadSuccess();
                        }
                    };
                    uploader.removeItem = function (fileItem) {
                        fileItem.remove();
                    };

                    function uploadSuccess() {
                        var filesId = [];
                        _.forEach(uploader.queue, function (fileItem) {
                            if (fileItem && fileItem.filesId) {
                                filesId = _.union(filesId, fileItem.filesId);
                                fileItem.remove();
                            }
                        });
                        var param = {
                            fileId: filesId
                        }
                        $scope.uploadFileSuccess({
                            param: param
                        });
                    };
                },
                scope: {
                    app: '@',
                    module: '@',
                    service: '@',
                    uploadFileSuccess: '&'
                },
                link: function ($scope, element) {


                }
            };
        }
    ]);
});