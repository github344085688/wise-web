'use strict';

define(['angular','lodash'], function(angular, _) {
    var $scope = function($scope, $stateParams, blackSNService, lincUtil, $mdDialog, $state, $http) {


        $scope.excelDataFileChange = function (element) {
            if ($scope.isUploading) return;
            excelFileValidate(element);
            var data = new FormData();
            data.append("excelDataFile", element.files[0]);
            $scope.isUploading = true;
            $http.post("/fd-app/item-import/upload", data, {
                withCredentials: true,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            }).then(function (res) {
                $scope.isUploading = false;
                $scope.filePath = element.value;
                if (!res.data || !res.data.jsonArray) {
                    lincUtil.errorPopup("No data of the file you uploaded!");
                    return;
                }
                $scope.importUploadData = res.data.jsonArray;

            }, function (error) {
                element.value = "";
                $scope.isUploading = false;
                lincUtil.errorPopup(error);
            });
        };
        
        $scope.submitImportItemBlacks = function () {
            $scope.loading = true;
            blackSNService.batchCreate($scope.importUploadData).then(function(res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('fd.item.blackSN.list');
                });
            },function(error) {
                $scope.loading = false;
                lincUtil.errorPopup('Update Error! ' + error.data.error);
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

        $scope.cancelImportItemBlack = function(){
            $state.go('fd.item.blackSN.list');
        };

        function init() {

        }

        init();
        
    };
    $scope.$inject = ['$scope', '$stateParams', 'blackSNService', 'lincUtil', '$mdDialog', '$state', '$http'];
    return $scope;
});
