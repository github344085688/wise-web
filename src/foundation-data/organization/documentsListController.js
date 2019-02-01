'use strict';

define(['angular', 'lodash'], function (angular, _) {

    var uploadController = function ($scope, $stateParams, lincUtil, organizationService, fileService, session,$http) {

        $scope.pageSize = 10;
        $scope.uploadFileSuccess = function (param) {
            var fileIds = param.fileId;
            if (fileIds) {
                var fileIds = _.union($scope.organization.extend.fileIds, fileIds)
                $scope.organization.extend.fileIds = fileIds;
                updateOrganization($scope.organization,'Add');
            }

        }

        function updateOrganization(organization,action) {

            organizationService.updateOrganization(organization).then(function () {
                if(action ==='Delete'){
                    lincUtil.messagePopup('Message', 'Delete Successful.');
                }
                getFiles(organization.extend.fileIds);
            }, function (error) {

                lincUtil.processErrorResponse(error);
            });
        }

        function getOrganization() {
            var companyId = session.getCompanyFacility().companyId;
            organizationService.getOrganizationAndRoles(companyId, $stateParams.organizationId).then(function (response) {
                $scope.organization = response;
                var fileIds = _.size(response.extend.fileIds) > 0 ? response.extend.fileIds : [];
                getFiles(fileIds);

            }, function (error) {

                lincUtil.processErrorResponse(error);
            });
        }

        function getFiles(fileIds){
            if (fileIds.length > 0) {
                fileService.fileSearch({
                    ids: fileIds
                }).then(function (files) {
                    $scope.orgFiles = files;
                    $scope.loadContent(1);
                });
            } else {
                $scope.orgFiles = [];
                $scope.loadContent(1);
            }
        }

        $scope.loadFile = function (file) {

            var fileDownloadUrl = fileService.buildDownloadUrl(file.id);
            $http.get(fileDownloadUrl, {
                responseType: 'arraybuffer'
            }).then(function (res) {
                if (res.data.byteLength == 0) {
                    lincUtil.errorPopup("Download Failed!");
                    return;
                }
                lincUtil.exportFile(res, file.name);

            }, function (error) {
                lincUtil.errorPopup(error);

            });
        }


        $scope.loadContent = function (currentPage) {
            $scope.orgFilesView = $scope.orgFiles.slice((currentPage - 1) * $scope.pageSize,
                currentPage * $scope.pageSize > $scope.orgFiles.length ? $scope.orgFiles.length : currentPage * $scope.pageSize);
        };

        function _init() {
            getOrganization();
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        _init();

        $scope.deleteFileEntry = function (fileId) {

            lincUtil.deleteConfirmPopup("Are you sure to delete this document?", function() {
                _.remove($scope.organization.extend.fileIds, function (id) {
                    return id == fileId;
                });
                updateOrganization($scope.organization,"Delete");
            });

        }
    }
    uploadController.$inject = ['$scope', '$stateParams', 'lincUtil','organizationService', 'fileService', 'session','$http'];

    return uploadController;
});