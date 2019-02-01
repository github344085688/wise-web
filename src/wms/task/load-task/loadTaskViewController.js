'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $state, $stateParams, loadTaskService, entryService, lincUtil) {
        function getTask(taskId) {
            loadTaskService.getTaskByTaskId(taskId).then(function (response) {
                $scope.task = response;
                if (response.steps.length > 0 && response.steps[0].loadResults) {
                    $scope.groupByLoadId = _.groupBy(response.steps[0].loadResults, 'loadId');
                }

                initActiveTabs($scope.task.steps);
            });
        }

        $scope.getStyle = function (isPutAway) {
            if (isPutAway) {
                return "{background-color: #c0edf1}";
            } else {
                return "{background-color: rgb(241, 192, 201}";
            }
        };

        function init() {
            $scope.materialLinesSearchParam = { loadTaskIds: [$stateParams.taskId] };
            $scope.activeMainTab = "steps";
            getTask($stateParams.taskId);
            getTaskPhoto($stateParams.taskId);
        }

        function initActiveTabs(steps) {
            $scope.activeTabs = {};
            angular.forEach(steps, function (step) {
                $scope.activeTabs[step.id] = "content";
            });
        }

        $scope.changeTab = function (tab, stepId) {
            $scope.activeTabs[stepId] = tab;
        };

        $scope.changeMainTab = function (tab) {
            $scope.activeMainTab = tab;
        }

        $scope.editTask = function () {
            $state.go("wms.task.loadTask.general.edit", { taskId: $scope.task.id });
        }

        function getTaskPhoto(taskId) {
            entryService.getEntryPhotos({ tags: [taskId], fileScenario: 'Other', fileCategory: 'Load' }).then(function (response) {
                $scope.photosResult = angular.copy(response);
                $scope.photosGroupByTags = _.groupBy(response, 'tags');
            }, function (error) {
                lincUtil.processErrorResponse(error);
            });
        }


        $scope.savePicture = function (param) {

            param.fileIds.forEach(function (fileId) {
                var photo = {
                    tags: [$scope.task.id, param.loadId, param.orderId],
                    fileId: fileId,
                    fileScenario: 'Other',
                    fileCategory: 'Load',
                    fileType: "Photo",
                };

                entryService.savePhoto(photo).then(function (response) {
                    if( $scope.photosGroupByTags[$scope.task.id + "," + param.loadId + "," + param.orderId]){
                        $scope.photosGroupByTags[$scope.task.id + "," + param.loadId + "," + param.orderId].push(photo);
                    }
                    else{
                        $scope.photosGroupByTags[$scope.task.id + "," + param.loadId + "," + param.orderId]=[];
                        $scope.photosGroupByTags[$scope.task.id + "," + param.loadId + "," + param.orderId].push(photo);
                    }
                    
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });


        }


        $scope.reopenStep = function (step) {
            lincUtil.confirmPopup('Tip', 'Would you like to reopen this step?', function () {
                loadTaskService.reopenStep($scope.task.id, step.id).then(function () {
                    lincUtil.updateSuccessfulPopup(function () {
                        step.status = "In Progress";
                    });
                }, function (error) {
                    lincUtil.processErrorResponse(error);
                });
            });
        };

        $scope.formateArray=function(arr){
            if(arr){
                return _.join(arr,' , ');
            }
           
        }


        init();
    }
    controller.$inject = ['$scope', '$state', '$stateParams', 'loadTaskService', 'entryService', 'lincUtil'];
    return controller;
});