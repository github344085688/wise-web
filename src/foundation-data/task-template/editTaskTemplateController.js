'use strict';
define(['angular',
    'lodash',
    'src/common/upload/lpConfigurationUploadController'], function (angular, _, uploadController) {
        var controller = function ($scope, $state, $mdDialog, $stateParams, lincUtil, taskTemplateService, facilityService) {


            $scope.taskTypes = ["Receive", "Pick", "Pack", "Load", "Put Away", "Generic", "Configuration Change"];
            //$scope.StepTypes = ["Predefined", "Offload", "Pallet Count", "LP Setup", "LP Verify", "SN Scan", "Load", "Count Unshipped", "Put Away", "PICK", "Pack", "STAGE", "Generic", "CC Efficiency to Pool", "CC Efficiency Pool to LP", "CC Traditional", "Replenishment"];
            $scope.StepTypes = [ "Generic"];
            $scope.taskTemplate = {
                steps: [{
                    genericStepTemplate: { instructionFileIds: [] }
                }]
            };


            function init() {

                searchFacility();

                $scope.isAddAction = $stateParams.taskTemplateId ? false : true;
                if ($scope.isAddAction) {
                    $scope.submitLabel = "Save";

                } else {
                    $scope.submitLabel = "Update";
                    taskTemplateService.getTaskTemplateById($stateParams.taskTemplateId).then(function (response) {
                        $scope.taskTemplate = response;
                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });
                }

            }

            init();

            function searchFacility() {
                facilityService.searchFacility({}).then(function (response) {
                    $scope.facilities = response;
                }, function () { });
            }


            $scope.addTaskTempleteItem = function (index) {
                $scope.taskTemplate.steps.push({
                    genericStepTemplate: { instructionFileIds: [] }
                });
            }

            $scope.removeTaskTempleteItem = function (index) {
                $scope.taskTemplate.steps.splice(index, 1);
            };

            $scope.addOrUpdateTaskTemplate = function () {
               
                $scope.loading = true;
                if ($scope.isAddAction && !$scope.taskTemplate.id) {
                    taskTemplateService.createTaskTemplate($scope.taskTemplate).then(function (response) {
                        $scope.loading = false;
                        if (response.error) {
                            lincUtil.processErrorResponse(error);
                            return;
                        }

                        lincUtil.saveSuccessfulPopup(function () {
                            $state.go("fd.taskTemplate.list");
                        });
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                } else {
                    taskTemplateService.updateTaskTemplate($stateParams.taskTemplateId,$scope.taskTemplate).then(function () {
                        $scope.loading = false;
                        lincUtil.updateSuccessfulPopup(function () {
                            $state.go("fd.taskTemplate.list");
                        });
                    }, function (error) {
                        $scope.loading = false;
                        lincUtil.processErrorResponse(error);
                    });
                }
            };

            $scope.uploadFiles = function (index, itemLine) {
                var form = {
                    templateUrl: 'common/upload/template/upload.html',
                    autoWrap: true,
                    title: 'Upload product images',
                    locals: {
                        formTitle: "Upload Task Template images",
                        fileIds: _.isUndefined(itemLine.genericStepTemplate.instructionFileIds) ? null : itemLine.genericStepTemplate.instructionFileIds
                    },
                    controller: uploadController
                };
                $mdDialog.show(form).then(function (response) {
                    savePicture(response, itemLine);
                });
            };

            function savePicture(response, itemLine) {
                if (_.size(response) > 0) {
                    itemLine.genericStepTemplate.instructionFileIds = _.union(itemLine.genericStepTemplate.instructionFileIds, response);
                }
            }

            $scope.removeFile = function (item, itemLine) {
                lincUtil.deleteConfirmPopup("Are you sure to delete this img?", function () {
                    _.remove(itemLine.genericStepTemplate.instructionFileIds, function (img) {
                        return img == item;
                    });
                });
            };

            function searchFacility() {
                facilityService.searchFacility({}).then(function (response) {
                    $scope.facilities = response;
                }, function () { });
            }

            $scope.cancelEditLocation = function () {
                $state.go("fd.taskTemplate.list");
            };

        };
        controller.$inject = ['$scope', '$state', '$mdDialog', '$stateParams', 'lincUtil', 'taskTemplateService', 'facilityService'];

        return controller;
    });
