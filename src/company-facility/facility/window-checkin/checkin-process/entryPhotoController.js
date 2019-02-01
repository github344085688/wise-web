'use strict';

define(['lodash', 'angular'], function (_, angular) {
    var entryPhotoController = function ($scope, $state, $mdDialog, $http, entryService, entryId, lincUtil,$q) {



        $scope.remove = function (index) {
            var photo = $scope.photoLists[index];
            entryService.removeEntryPhoto(photo.id).then(function (response) {
                $scope.photoLists.splice(index, 1);

            });
        };

        $scope.removeBatchPhoto = function (index) {
            $scope.batchPhotos.splice(index, 1);
            $scope.batchPhotoLists.splice(index, 1);
        };
        $scope.closePhotoView = function () {
            $scope.isViewPhoto = false;
        }
        $scope.isViewPhoto = false;
        $scope.viewPhotos = function ($event) {
            var currentSrc = $event.target.currentSrc;
            var img = new Image();
            img.src = currentSrc;
            if (img.complete) {
                $scope.photoWidth = "-" + img.width / 2 + "px";
                $scope.photoHeight = "-" + img.height / 2 + "px";

            } else {

                img.onload = function () {
                    $scope.photoWidth = "-" + img.width / 2 + "px";
                    $scope.photoHeight = "-" + img.height / 2 + "px";
                };
            }

            $scope.photoView = currentSrc;
            $scope.isViewPhoto = true;


        }

        $scope.photoErr = false;
        $scope.photoBtnDisable = true;
        var mediaStream = null,
            track = null;
        $scope.newPhoto = function () {
            navigator.getMedia = (navigator.getUserMedia ||
                navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
                navigator.msGetUserMedia);
            if (navigator.getMedia) {
                navigator.getMedia({
                    video: true
                },
                    // successCallback
                    function (stream) {
                        // var s = window.URL.createObjectURL(stream);
                        var video = document.getElementById('video');
                        video.srcObject = stream
                        mediaStream = stream;
                        track = stream.getTracks()[0];
                        $scope.photoBtnDisable = false;
                        $scope.cameraStart = true;
                        $scope.$apply();
                    },
                    // errorCallback
                    function (err) {
                        $scope.photoErr = true;
                        $scope.cameraStart = false;
                    });
            } else {
                $scope.photoErr = true;
            }
        };

        $scope.uploadFileChange = function (element) {
            var fileType=['image/png','image/jpeg','image/jpg','image/gif'];
            if(fileType.indexOf( element.files[0].type)>-1) {
                $scope.$apply(function () {
                    $scope.isBatchPhotos = true;
                    $scope.FileLoading = true;
                    var promises = [];
                    var request ={
                        withCredentials: true,
                        headers: {'Content-Type': undefined},
                        transformRequest: angular.identity
                    };
                    _.forEach(element.files,function(file){
                        var fd = new FormData();
                        fd.append("img", file);
                        fd.append("app", " wms-app");
                        fd.append("module", "facility");
                        fd.append("service", "window-checkin");
                        var url = "/file-app/file-upload";
                        promises.push($http.post(url, fd,request));
                    })
                   
                    $q.all(promises).then(function (responses) {
                        _.forEach(responses,function(response){
                            UpdataPhotos(response)
                        })

                        $scope.FileLoading = false;
                    }, function (error) {
                        $scope.FileLoading = false;
                        lincUtil.processErrorResponse(error);
                    });
                });
            }
        };

        $scope.snap = function () {
            $scope.isBatchPhotos = true;
            var canvas = document.createElement('canvas');
            canvas.width = "400";
            canvas.height = "304";
            var video = document.getElementById('video');
            var ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, 400, 304);
            $scope.closeCamera();
            var imgData = canvas.toDataURL("image/png");
            uploadImg(imgData);
        };

        $scope.batchGroupPhotos = {};

        function uploadImg(data) {
            var fd = new FormData();
            fd.append("img", data);
            var promise = $http.post("/file-app/img-upload", fd, {
                withCredentials: true,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            });
            promise.then(function (response) {
                UpdataPhotos (response);
            });
        }

        function UpdataPhotos (response) {
            var photoId = response.data.filesId[0];
            $scope.photoIds.push(photoId);
            var entryPhoto = {
                tags: [entryId],
                fileId: photoId,
                fileScenario: 'Other',
                fileCategory: $scope.photo.type,
                fileType: "Photo",
                // img: data
                img:"/file-app/file-download/" + photoId
            };
            if ($scope.batchGroupPhotos[entryPhoto.fileCategory]) {
                $scope.batchGroupPhotos[entryPhoto.fileCategory].push(entryPhoto);
            } else {
                $scope.batchGroupPhotos[entryPhoto.fileCategory] = [entryPhoto];
            }
            $scope.batchPhotos.push(entryPhoto);
            $scope.batchPhotoLists = $scope.batchGroupPhotos[entryPhoto.fileCategory];
        }

        $scope.savePhotos = function () {
            $scope.batchPhotos.forEach(function (photo) {
                entryService.savePhoto(photo).then(function (response) {
                   $mdDialog.hide();
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.closeCamera = function () {
            if (mediaStream !== null) {
                if (mediaStream.stop) {
                    mediaStream.stop();
                }
                var video = document.getElementById('video');
                video.src = "";
                $scope.cameraStart = false;
            }
            if (track !== null) {
                if (track.stop) {
                    track.stop();
                }
            }
        };

        $scope.cancel = function () {
            $scope.closeCamera();
            $mdDialog.cancel();
        };

        $scope.photoTypes = ["Driver ID", "Badge", "Manifest", "Entry Ticket", "POD"];
        $scope.entryPhotos = [];
        $scope.entryPhotoTypes = [];
        function getEntryPhoto(entry) {
            entryService.getEntryPhotos({ tags: [entryId] }).then(function (response) {


                _.forEach(response, function (photo) {
                    $scope.entryPhotos.push({
                        id: photo.id,
                        photoType: photo.fileCategory,
                        url: "/file-app/file-download/" + photo.fileId,
                        createTime: photo.createdWhen
                    });
                });
                $scope.entryPhotos.groupedPhotos = _.groupBy($scope.entryPhotos, "photoType");
                $scope.entryPhotoTypes = angular.copy($scope.photoTypes);
                _.forEach($scope.entryPhotos.groupedPhotos, function (val, k) {
                    if (_.indexOf($scope.entryPhotoTypes, k) < 0) {
                        $scope.entryPhotoTypes.push(k);
                    }

                });

            });
        }

        $scope.isPhotoTypes = false;
        $scope.isBatchPhotos = false;
        $scope.entryPhotosView = function (photoType) {
            $scope.photo.type = photoType;
            $scope.hightLights = {};
            $scope.hightLights[photoType] = true;
            $scope.photoLists = $scope.entryPhotos.groupedPhotos[photoType];
            $scope.batchPhotoLists = $scope.batchGroupPhotos[photoType];
            if (_.indexOf($scope.photoTypes, photoType) > -1) {
                $scope.isPhotoTypes = true;
            } else {
                $scope.isPhotoTypes = false;
            }

            if ($scope.batchPhotoLists&&$scope.batchPhotoLists.length) {
                $scope.isBatchPhotos = true;

            } else {
                $scope.isBatchPhotos = false;
            }
        };


        function _init() {
            if (!entryId) {
                return;
            }
            $scope.photo = {};
            $scope.photoIds = [];
            $scope.batchPhotos = [];

            getEntryPhoto();
        }

        _init();

    };

    entryPhotoController.$inject = ['$scope', '$state', '$mdDialog', '$http', 'entryService', 'entryId', 'lincUtil','$q'];
    return entryPhotoController;

});
