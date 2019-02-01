/**
 * Created by Giroux on 2017/7/5.
 */

'use strict';

define([
    'angular',
    'lodash'
], function (angular, _) {
    var controller = function ($scope, $http, lincUtil) {
        $scope.importUploadData = [];
        $scope.importUploadFields = [];
        $scope.importUploadDataSimple = [];
        $scope.page = {
            pageSize: 10
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
        function apply() {
            if (!$scope.$$phase) {
                try {
                    $scope.$apply();
                } catch (e) { }
            }
        }
        function getDataTableHead() {
            $scope.importUploadFields = [];
            if ($scope.importUploadData.length === 0) return;

            _.forEach($scope.importUploadData[0], function (val, key) {
                $scope.importUploadFields.push(key);
            });
        }

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
                element.value = "";
                $scope.isUploading = false;
                if (!res.data || !res.data.jsonArray) {
                    lincUtil.errorPopup("No data of the file you uploaded!");
                    return;
                }
                $scope.importUploadData = res.data.jsonArray;
                getDataTableHead();
                $scope.headAutoMapping();
                $scope.loadContent();
                apply();

            }, function (error) {
                element.value = "";
                $scope.isUploading = false;
                lincUtil.errorPopup(error);
            });
        };

        var currentPgno;
        $scope.loadContent = function (pageNo) {
            pageNo = pageNo || 1;
            currentPgno = pageNo;
            var total = $scope.importUploadData.length;
            $scope.importUploadDataSimple = $scope.importUploadData.slice((pageNo - 1) * $scope.page.pageSize,
                pageNo * $scope.page.pageSize > total ? total : pageNo * $scope.page.pageSize);
        };
        $scope.deleteItem = function (index) {
            index = (currentPgno - 1) * $scope.page.pageSize + index;
            $scope.importUploadData.splice(index, 1);

            $scope.loadContent(currentPgno);
        };

        function dataReFormat(item) {
            var data = {};
            _.forEach($scope.fieldMapping, function (val, key) {
                data[val] = item[key];
            });

            return data;
        }

        $scope.addErrorData = function (data, field) {
            if (!_.includes($scope.importUploadFields, "errorMesg")) {
                $scope.importUploadFields.push("errorMesg");
            }
            $scope.importUploadData = [];
            _.forEach(data, function (item) {
                var error = dataReFormat(item[field]);
                error.errorMesg = item.errorMesg;
                $scope.importUploadData.push(error);
            });
            $scope.loadContent();

            lincUtil.errorPopup("There are " + data.length + " data import fail, you can see the error message in Upload Data List!");
        };
    };

    return controller;
});