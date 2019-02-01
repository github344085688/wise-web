'use strict';
define(['angular',
    'lodash',
    'src/common/upload/lpConfigurationUploadController'], function (angular, _, uploadController) {
        var controller = function ($scope, $http, $state, $mdDialog, $stateParams, lincUtil, fileService) {


            $scope.fileCategory = ["Organization", "Item", "Long Haul", "Location", "Address", "Inventory", "Tracking Number"];
            $scope.templateManage = {};


            function init() {



                $scope.isAddAction = $stateParams.fileEntryId ? false : true;
                if ($scope.isAddAction) {
                    $scope.submitLabel = "Save";

                } else {
                    $scope.submitLabel = "Update";
                    fileService.getFileEntry($stateParams.fileEntryId).then(function (response) {
                        $scope.templateManage = response;
                    }, function (error) {
                        lincUtil.processErrorResponse(error);
                    });
                }

            }

            init();



            $scope.addOrUpdateTemplateManagement = function () {
                $scope.loading = true;
                $http.post("/file-app/file-upload", $scope.Filedata, {
                    withCredentials: true,
                    headers: { 'Content-Type': undefined },
                    transformRequest: angular.identity
                }).then(function (res) {
                    var fileId = res.data.filesId[0];
                    $scope.templateManage.fileId = fileId;
                    $scope.templateManage.fileType = "Excel";
                    $scope.templateManage.fileScenario = "Template";
                    if ($scope.isAddAction) {
                        saveFileEntry();
                    } else {
                        updateFileEntry();
                    }

                }, function (error) {
                    element.value = "";
                    lincUtil.processErrorResponse(error);
                });


            };

            function saveFileEntry() {
                fileService.savefile($scope.templateManage).then(function (response) {
                    $scope.loading = false;
                    if (response.error) {
                        lincUtil.processErrorResponse(error);
                        return;
                    }

                    lincUtil.saveSuccessfulPopup(function () {
                        $state.go("admin.service.templateManagement.list");
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }

            function updateFileEntry() {
               console.log($scope.templateManage);
                fileService.updateFileEntry($scope.templateManage.id, $scope.templateManage).then(function () {
                    $scope.loading = false;
                    lincUtil.updateSuccessfulPopup(function () {
                        $state.go("admin.service.templateManagement.list");
                    });
                }, function (error) {
                    $scope.loading = false;
                    lincUtil.processErrorResponse(error);
                });
            }

            $scope.excelDataFileChange = function (element) {

                excelFileValidate(element);
                var data = new FormData();
                data.append("app", "admin");
                data.append("module", "service");
                data.append("service", "import");
                data.append("excelDataFile", element.files[0]);
                $scope.Filedata = data;

                $scope.$apply(function () {
                    $scope.templateFilePath = element.value;
                });
            };

            function excelFileValidate(element) {
                var fileName = element.value;
                var temp = fileName.toLowerCase().split(".");
                var fileType = temp[temp.length - 1];
                if (fileType !== "xls" && fileType !== "xlsx") {
                    element.value = "";
                    lincUtil.errorPopup("Please upload Excel file!");
                    throw new Error("Please upload Excel file!");
                }
            }
            $scope.cancelEditLocation = function () {
                $state.go("admin.service.templateManagement.list");
            };

        };

        controller.$inject = ['$scope', '$http', '$state', '$mdDialog', '$stateParams', 'lincUtil', 'fileService'];

        return controller;
    });
