'use strict';

define(['angular','lodash'], function(angular, _) {
    var $scope = function($scope, $stateParams, itemLpTemplateMappingService, itemPropertyService, isAddAction,
                          lincUtil, $mdDialog, $state) {

        var currentMappingType;
        $scope.submit = function() {
            var mapping = angular.copy($scope.mapping);
            if(isAddAction) {
                createMapping(mapping);
            }else {
                updateMapping(mapping);
            }
        };

        function createMapping(mapping) {
            $scope.loading = true;
            itemLpTemplateMappingService.create(mapping).then(function(res) {
                $scope.loading = false;
                lincUtil.saveSuccessfulPopup(function () {
                    $state.go('fd.item.lpTemplateMapping.list');
                });
            },function(error) {
                $scope.loading = false;
                lincUtil.errorPopup('Save Error! ' + error.data.error);
            });
        }

        function updateMapping(mapping) {
            $scope.loading = true;
            itemLpTemplateMappingService.updateById(mapping.id, mapping).then(function(res) {
                $scope.loading = false;
                lincUtil.updateSuccessfulPopup(function () {
                    $state.go('fd.item.lpTemplateMapping.list');
                });
            },function(error) {
                $scope.loading = false;
                lincUtil.errorPopup('Update Error! ' + error.data.error);
            });
        }

        $scope.mappingTypeOnSelect = function () {
            var mappingType = $scope.mapping.mappingType;
            if(!mappingType) {
                $scope.fieldNames = [];
                $scope.mapping.fieldName = null;
            }else if(mappingType != currentMappingType) {
                $scope.getFieldNames("")
                $scope.mapping.fieldName = null;
                currentMappingType = mappingType;
            }
        };

        $scope.getFieldNames = function (searchName) {
            var mappingType = $scope.mapping.mappingType;
            if(mappingType == "Static Field") {
                $scope.fieldNames = ["name", "desc", "shortDescription", "upcCode"];
            }else if(mappingType == "Dynamic Field") {
                itemPropertyService.getItemProperties({name: searchName}).then(function (properties) {
                    $scope.fieldNames =  _.map(properties, "name");
                });
            }
        };

        $scope.cancel = function(){
            $state.go('fd.item.lpTemplateMapping.list');
        };

        function init() {
            if(isAddAction) {
                $scope.title = "Add Item Lp Template Mapping";
                $scope.submitName = "Save";
                $scope.mapping = {};
            }else {
                $scope.title = "Edit Item Lp Template Mapping: " + $stateParams.id;
                $scope.submitName = "Update";
                itemLpTemplateMappingService.getById($stateParams.id).then(function(mapping) {
                    $scope.mapping = mapping;
                });
            }
        }

        init();
        
    };
    $scope.$inject = ['$scope', '$stateParams', 'itemLpTemplateMappingService', 'itemPropertyService',
        'isAddAction', 'lincUtil', '$mdDialog', '$state'];
    return $scope;
});
