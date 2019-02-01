'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $state, entryService, receiveTaskService, $mdDialog, entry) {



        $scope.entry = entry;
        $scope.entryPhotos = [];
        $scope.entryPhotoTypes = [];
        $scope.receiveTasksPhotos = [];
        $scope.hightLights = {};

        $scope.getPhotoType = function (type) {
            if ("CONTAINER_NO_CHECK" === type) {
                return "Container No";
            }
            if ("SEAL_CHECK" === type) {
                return "Seal No";
            }
            if ("OFFLOAD" === type) {
                return "Offload";
            }
        };

        $scope.closePhotoView = function () {
            $scope.isViewPhoto = false;
        };

        $scope.isViewPhoto = false;

        $scope.previewPhotos = function ($event) {
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
        };

        $scope.entryPhotosView = function (photoType) {

            $scope.hightLights = {};
            $scope.hightLights[photoType] = true;
            $scope.photoLists = $scope.entryPhotos.groupedPhotos[photoType];
        };

        $scope.receivePhotoView = function (photoGroup) {
            $scope.hightLights = {};
            $scope.hightLights[photoGroup.type] = true;
            $scope.photoLists = [];
            var ids = photoGroup.photoIds;
            _.forEach(ids, function (id) {
                $scope.photoLists.push({
                    url: "/file-app/file-download/" + id,
                });
            })

        };

        $scope.LoadPhotosView = function (fieldIds) {
            $scope.hightLights = {};
            $scope.hightLights[fieldIds] = true;

            $scope.photoLists = [];
            _.forEach(fieldIds, function (id) {
                $scope.photoLists.push({
                    url: "/file-app/file-download/" + id,
                });
            })

        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.ok = function () {

            $mdDialog.hide();
        };

        function getEntryPhoto(entry) {
            entryService.getEntryPhotos({ tags: [entry.id] }).then(function (response) {


                _.forEach(response, function (photo) {
                    $scope.entryPhotos.push({
                        id: photo.id,
                        photoType: photo.fileCategory,
                        url: "/file-app/file-download/" + photo.fileId,
                        createTime: photo.createdWhen
                    });
                });
                $scope.entryPhotos.groupedPhotos = _.groupBy($scope.entryPhotos, "photoType");
                _.forEach($scope.entryPhotos.groupedPhotos, function (val, k) {
                    $scope.entryPhotoTypes.push(k);
                });


            });
        }

        function getReceiptTaskPhotos(taskIds) {

            receiveTaskService.getReceiptTaskPhotos(taskIds).then(function (response) {
                $scope.receiveTasksPhotos = response;
            }, function () {

            })
        }

        function getTaskPhoto(taskIds) {
            entryService.getEntryPhotos({ tags: taskIds, fileCategory: 'Load' }).then(function (response) {
                $scope.loadTasksPhotos = response;
                $scope.loadTasksPhotoMaps = {}
                _.forEach(response, function (photo) {

                    _.forEach(photo.tags, function (tag) {
                        if ($scope.loadTasksPhotoMaps[tag]) {
                            $scope.loadTasksPhotoMaps[tag].push(photo);
                        } else {
                            $scope.loadTasksPhotoMaps[tag] = [photo];
                        }

                    });
                });

                _.forEach($scope.loadTasksPhotoMaps, function (loadTasksPhotoMap, keys) {
                    $scope.loadTasksPhotoMaps[keys] = _.groupBy(loadTasksPhotoMap, "fileCategory");
                    _.forEach($scope.loadTasksPhotoMaps[keys], function (val, loadKey) {
                        $scope.loadTasksPhotoMaps[keys][loadKey] = _.map(val, "fileId");
                    });
                })

                getSealNo();
                getCountingSheet();

            });

        }

        function getCountingSheet() {
            var loadKeybyId = _.keyBy($scope.entry.loads, 'id');
            _.forEach($scope.entry.loadTasks, function (loadTask) {
                var CountingSheetPhotoFileIds = [];
                _.forEach(loadTask.loadIds, function (loadId) {
                    if (loadKeybyId[loadId]) {
                        var countingSheetPhotos = loadKeybyId[loadId].countingSheetPhotos;
                        if (countingSheetPhotos && countingSheetPhotos.length > 0) {
                            CountingSheetPhotoFileIds.push(loadKeybyId[loadId].countingSheetPhotos);
                        }
                    }
                })
                $scope.loadTasksPhotoMaps[loadTask.id]['Counting Sheet'] = _.flattenDeep(CountingSheetPhotoFileIds);
            });


        }

        function getSealNo() {
            _.forEach($scope.entry.loadTasks, function (loadTask) {
                if (loadTask.seal.photos && loadTask.seal.photos.length > 0) {
                    $scope.loadTasksPhotoMaps[loadTask.id]['Seal No'] = loadTask.seal.photos;
                }
            });

        }

        function init() {
            getEntryPhoto($scope.entry);

            $scope.recieptTaskIds = _.map($scope.entry.receiveTasks, 'id');
            if ($scope.recieptTaskIds.length > 0) {
                getReceiptTaskPhotos($scope.recieptTaskIds);
            }
            $scope.loadTaskIds = _.map($scope.entry.loadTasks, 'id');
            if ($scope.loadTaskIds.length > 0) {
                getTaskPhoto($scope.loadTaskIds);
            }

        }

        init();

    };
    controller.$inject = ['$scope', '$state', 'entryService', 'receiveTaskService', '$mdDialog', 'entry'];
    return controller;
});
