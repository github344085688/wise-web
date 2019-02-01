'use strict';

define(['lodash', 'angular'], function (_,  angular) {
    var controller = function ($scope, $state, itemLpTemplateMappingService, itemPropertyService, lincUtil) {

        $scope.searchInfo = {};
        $scope.pageObj = {pageSize: 10};
        $scope.isLoading = false;
        $scope.mappings = [];
        var currentPageIndex;
        var currentMappingType;

        $scope.search = function() {
            var param = angular.copy($scope.searchInfo);
            searchMapping(param);
        };

        $scope.keyUpSearch = function ($event) {
            if(!$event){
                return;
            }
            if ($event.keyCode === 13) {
                $scope.loadContent(1);
            }
            $event.preventDefault();
        };

        function searchMapping(param){
            $scope.isLoading = true;
            itemLpTemplateMappingService.search(param).then(function(response) {
                $scope.isLoading = false;
                $scope.mappings = response;
                $scope.loadContent(1);
            },function(err){
                $scope.isLoading = false;
                lincUtil.errorPopup("Error:" + err.data.error);
            });
        }

        $scope.loadContent = function (currentPage) {
            currentPageIndex = currentPage;
            $scope.mappingsView = $scope.mappings.slice((currentPage - 1) * $scope.pageObj.pageSize,
                currentPage * $scope.pageObj.pageSize > $scope.mappings.length ? $scope.mappings.length : currentPage * $scope.pageObj.pageSize);
        };

        $scope.update = function (id) {
            $state.go('fd.item.lpTemplateMapping.edit', { id: id });
        };

        $scope.delete = function (id) {
            lincUtil.deleteConfirmPopup('Would you like to remove this item LP template mapping?', function () {
                itemLpTemplateMappingService.deleteById(id).then(function () {
                    var index = _.findIndex($scope.mappings, function(mapping) {return mapping.id == id;});
                    if(index > -1) {
                        $scope.mappings.splice(index, 1);
                    }

                    $scope.loadContent(currentPageIndex);
                }, function (error) {
                    lincUtil.errorPopup('Delete Error! ' + error.data.error);
                });
            });
        };

        $scope.mappingTypeOnSelect = function () {
            var mappingType = $scope.searchInfo.mappingType;
            if(!mappingType) {
                $scope.fieldNames = [];
                $scope.searchInfo.fieldName = null;
            }else if(mappingType != currentMappingType) {
                $scope.getFieldNames("")
                $scope.searchInfo.fieldName = null;
                currentMappingType = mappingType;
            }
        };

        $scope.getFieldNames = function (searchName) {
            var mappingType = $scope.searchInfo.mappingType;
            if(mappingType == "Static Field") {
                $scope.fieldNames = ["name", "desc", "shortDescription", "upcCode"];
            }else if(mappingType == "Dynamic Field") {
                itemPropertyService.getItemProperties({name: searchName}).then(function (properties) {
                    $scope.fieldNames =  _.map(properties, "name");
                });
            }
        };

        function init() {
            searchMapping({});
        }

        init();
    };
    controller.$inject = ['$scope', '$state', 'itemLpTemplateMappingService', 'itemPropertyService', 'lincUtil'];
    return controller;
});
