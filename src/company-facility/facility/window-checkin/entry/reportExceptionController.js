'use strict';

define(['lodash', 'angular'], function (_, angular) {
    var entryPhotoController = function ($scope, $state, $mdDialog, $http, entryService, entry, lincUtil, $q, receiveTaskService, loadTaskService) {

        $scope.isViewPhoto = false;
        $scope.entryTicketReject = {};
        var recieptTaskIds = _.map(entry.receiveTasks, 'id');
        var loadTaskIds = _.map(entry.loadTasks, 'id');

        $scope.removeBatchPhoto = function (index) {
            $scope.batchPhotoLists.splice(index, 1);
        };

        $scope.closePhotoView = function () {
            $scope.isViewPhoto = false;
        }

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

        $scope.uploadFileChange = function (element) {
            var fileType = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
            if (fileType.indexOf(element.files[0].type) > -1) {
                $scope.$apply(function () {
                    $scope.FileLoading = true;
                    var promises = [];
                    var request = {
                        withCredentials: true,
                        headers: { 'Content-Type': undefined },
                        transformRequest: angular.identity
                    };
                    _.forEach(element.files, function (file) {
                        var fd = new FormData();
                        fd.append("img", file);
                        fd.append("app", " wms-app");
                        fd.append("module", "facility");
                        fd.append("service", "window-checkin");
                        var url = "/file-app/file-upload";
                        promises.push($http.post(url, fd, request));
                    })

                    $q.all(promises).then(function (responses) {
                        _.forEach(responses, function (response) {
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

        function UpdataPhotos (response) {
            var photoId = response.data.filesId[0];
            var entryPhoto = {
                tags: [entry.id],
                fileId: photoId,
                fileScenario: 'Other',
                fileType: "Photo",
                img: "/file-app/file-download/" + photoId
            };
            $scope.batchPhotoLists.push(entryPhoto);
        }

        $scope.confirm = function () {
            var photoFileIds = [];
            $scope.batchPhotoLists.forEach(function (photo) {
                photoFileIds.push(photo.fileId);
            });
            var promises = [];
            if (recieptTaskIds && recieptTaskIds.length > 0) {
                _.forEach(recieptTaskIds, function (taskId) {
                    promises.push(receiveTaskService.cancelTask(taskId));
                });
            }
            if (loadTaskIds && loadTaskIds.length > 0) {
                _.forEach(loadTaskIds, function (taskId) {
                    promises.push(loadTaskService.cancelTask(taskId));
                });
            }
            $scope.entryTicketReject.photoFileIds = photoFileIds;
            $scope.isLoading = true;
            if (promises && promises.length > 0) {
                $q.all(promises).then(function (responses) {
                    checkInReject(entry.id, $scope.entryTicketReject);
                }, function (error) {
                    $scope.isLoading = false;
                    lincUtil.processErrorResponse(error);
                });
            } else {
                checkInReject(entry.id, $scope.entryTicketReject);
            }
        };

        function checkInReject (entryId, entryTicketReject) {
            entryService.checkInReject(entryId, entryTicketReject).then(function (response) {
                $scope.isLoading = false;
                $mdDialog.hide("true");
            }, function (error) {
                lincUtil.processErrorResponse(error);
                $scope.isLoading = false;
            })

        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        function _init () {
            if (!entry.id) {
                return;
            }
            $scope.batchPhotoLists = [];
        }
        _init();

    };

    entryPhotoController.$inject = ['$scope', '$state', '$mdDialog', '$http', 'entryService', 'entry', 'lincUtil', '$q', 'receiveTaskService', 'loadTaskService'];
    return entryPhotoController;

});
