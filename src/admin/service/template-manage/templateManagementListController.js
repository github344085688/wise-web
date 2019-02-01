'use strict';

define(['angular', 'lodash'], function (angular, _) {
    var controller = function ($scope, $mdDialog, locationService, lincUtil, fileService) {

        $scope.pageSize = 10;
        $scope.searchInfo = { fileScenario: "Template" };
        $scope.fileCategorys = ["Organization", "Item", "Long Haul", "Location", "Address", "Inventory", "Tracking Number"];
        SearchTemplateManagement($scope.searchInfo);

        $scope.search = function () {
         
            SearchTemplateManagement($scope.searchInfo);

        };

        function SearchTemplateManagement(param) {
            $scope.loading=true;
            fileService.searchEntryFile(param).then(function (data) {
                $scope.templateManage = data;
                $scope.loadContent(1);
              
                $scope.loading=false;
            }, function (error) {
                lincUtil.processErrorResponse(error);
                
                $scope.loading=false;
            });
        }


        $scope.loadContent = function (currentPage) {
            $scope.templateManageView = $scope.templateManage.slice((currentPage - 1) * $scope.pageSize, currentPage * $scope.pageSize > $scope.templateManage.length ? $scope.templateManage.length : currentPage * $scope.pageSize);
        };



        $scope.getDownload = function (template) {
            var download = "";
            var a = document.createElement('a');
            a.href = fileService.buildItemDownloadUrl(template.fileId);
            if (!template.createdWhen) {
                var createdWhen = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss");
                download =template.fileCategory +" " +  createdWhen + ".xlsx";
            } else {
                download = template.fileCategory +" " + template.createdWhen + ".xlsx";
            }
            a.download = $scope.download = download;
            a.target = '_blank';
            a.click();
        };


    };
    controller.$inject = ['$scope', '$mdDialog', 'locationService', 'lincUtil', 'fileService'];
    return controller;
});
