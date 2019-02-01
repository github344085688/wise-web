'use strict';

define(['./directives', 'lodash'], function (directives, _) {
    directives.directive('templateManage', ['$q', 'fileService','lincUtil', function ($q, fileService,lincUtil) {
        return {
            restrict: "E",
            templateUrl: 'common/directive/template/templateManage.html',

            scope: {
                fileCategory:'@'
            },
            link: function ($scope) {
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

                $scope.templateManage = [];


                $scope.getTemplate = function () {
                    $scope.searchInfo = { fileScenario: "Template" , fileCategory: $scope.fileCategory };
                    SearchTemplateManagement($scope.searchInfo);
            
                    function SearchTemplateManagement(param) {
                        $scope.loading=true;
                        fileService.searchEntryFile(param).then(function (data) {
                            $scope.templateManage = data;
                            $scope.templateManage = _.orderBy($scope.templateManage, ['createdWhen'],['desc']);
                        }, function (error) {
                            lincUtil.processErrorResponse(error);
                        });
                    }
                };
                   function init(){
                    $scope.getTemplate();
                   };
                   init();
                $scope.getTemplateName = function (template) {
                    if (!template) return "";
                    return  $scope.fileCategory +" Template "+ ($scope.templateManage.length-$scope.templateManage.indexOf(template))+".0";
                };
            }
        };
    }]);
});
